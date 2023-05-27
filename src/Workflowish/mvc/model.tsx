import * as React from "react";
import { BaseItemType, BaseStoreDataType, makeNewUniqueKey, setToDeleted } from "~CoreDataLake";
import { HighlightStates as SearchHighlightStates } from "../Subcomponents/OmnibarWrapper/Specializations/search";
import { generateFirstTimeDoc } from "./firstTimeDoc";

type HighlightStates = SearchHighlightStates;

export type ItemTreeNode = {
    lastModifiedUnixMillis: number
    id: string,
    data: string,
    children: ItemTreeNode[],
    collapsed: boolean,
    searchHighlight: HighlightStates[],
    markedForCleanup?: boolean,
    symlinkedNode?: ItemTreeNode
}

export type FlatItemData = {
    lastModifiedUnixMillis: number
    data: string,
    children: string[],
    collapsed: boolean
}

export type FlatItemBlob = Record<string, FlatItemData>;

export const makeNewItem = (): ItemTreeNode => ({
    id: makeNewUniqueKey(),
    lastModifiedUnixMillis: Date.now(),
    data: "",
    children: [],
    searchHighlight: [],
    collapsed: false
});

export const getTransformedDataAndSetter = (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
}) => {

    let transformedData: ReturnType<typeof transformData>;
    let setItemsByKey: ReturnType<typeof getItemSetterByKey>
    if (!(virtualRootId in props.data)) {
        const firstTimeData = fromTree(generateFirstTimeDoc());
        setTimeout(() => props.updateData((data) => {
            // Must check second time otherwise this is called multiple times.
            // feels like locks all over again
            if (!(virtualRootId in data)) return firstTimeData;
            else return data;
        }), 1);
        setItemsByKey = () => {
            // Don't allow user modifications before first load
        };
        transformedData = transformData(firstTimeData);
    } else {
        setItemsByKey = getItemSetterByKey(props.updateData);
        transformedData = transformData(props.data as FlatItemBlob);
    }
    return {
        transformedData,
        setItemsByKey
    };
}

export type TransformedData = ReturnType<typeof transformData>;
export type TransformedDataAndSetter = ReturnType<typeof getTransformedDataAndSetter>;

export const virtualRootId = "__virtualRoot";

export const getItemSetterByKey = (updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>) => {
    return (itemsToSet: Record<string, ItemTreeNode> | ((transformedData: TransformedData) => Record<string, ItemTreeNode>)) => {
        updateData((oldData) => {
            let todoItemsToSet: Record<string, ItemTreeNode>;
            if (itemsToSet instanceof Function) {
                todoItemsToSet = itemsToSet(transformData(oldData as FlatItemBlob));
            } else {
                todoItemsToSet = itemsToSet;
            }
            for (const key in todoItemsToSet) {
                oldData[key] = {
                    ...flattenItemNode(todoItemsToSet[key]),
                    lastModifiedUnixMillis: Date.now()
                };
            }
            return { ...oldData };
        })


    }
}

export const transformData = (flatItemBlob: FlatItemBlob) => {
    const treeConstructorRecord: Record<string,
        ItemTreeNode
    > = {};
    const orphanedTreeItemCandidates = new Set<string>();
    const parentById: Record<string, string> = {};
    // First pass: instantiation.
    for (const nodeId in flatItemBlob) {
        if (isValidTreeObject(flatItemBlob[nodeId])) {
            orphanedTreeItemCandidates.add(nodeId);
            treeConstructorRecord[nodeId] = {
                id: nodeId,
                lastModifiedUnixMillis: flatItemBlob[nodeId].lastModifiedUnixMillis,
                data: flatItemBlob[nodeId].data,
                children: [],
                searchHighlight: [],
                collapsed: flatItemBlob[nodeId].collapsed
            }
        }
    }
    // Second pass: Child linking
    for (const nodeId in treeConstructorRecord) {
        const nodeChildInstances = flatItemBlob[nodeId].children.map(childId => {
            const childWasDeleted = !(childId in treeConstructorRecord)
            return childWasDeleted ? null : treeConstructorRecord[childId]
        }).filter((nodeOrNull): nodeOrNull is ItemTreeNode => nodeOrNull != null);
        treeConstructorRecord[nodeId].children = deduplicate(nodeChildInstances);
        flatItemBlob[nodeId].children.forEach(childId => {
            orphanedTreeItemCandidates.delete(childId);
            parentById[childId] = nodeId;
        })

        // Symlink linking
        const symlinkMatch = /^\[LN: (.+?)\]$/g.exec(flatItemBlob[nodeId].data);
        if (symlinkMatch && symlinkMatch[1] in treeConstructorRecord) {
            treeConstructorRecord[nodeId].symlinkedNode = treeConstructorRecord[symlinkMatch[1]];
        }
    }

    let virtualRoot: ItemTreeNode;
    if (virtualRootId in treeConstructorRecord) {
        virtualRoot = treeConstructorRecord[virtualRootId];
    } else {
        virtualRoot = makeNewItem();
        virtualRoot.id = virtualRootId;
    }
    for (const orphanedId of orphanedTreeItemCandidates) {
        if (orphanedId != virtualRoot.id) virtualRoot.children.push(treeConstructorRecord[orphanedId]);
    }
    if (virtualRoot.children.length == 0) throw "Virtual root must have children"; // DOMASSERTION
    return {
        rootNode: virtualRoot,
        keyedNodes: treeConstructorRecord,
        parentById
    };
}

const isValidTreeObject = (item: BaseItemType) => {
    return (
        "children" in item &&
        "data" in item &&
        "collapsed" in item
    )
}

const deduplicate = (inArray: ItemTreeNode[]): ItemTreeNode[] => {
    const seenStrs: Record<string, boolean> = {}
    return inArray.filter(i => {
        if (seenStrs[i.id]) return false;
        else {
            seenStrs[i.id] = true;
            return true;
        }
    })
}

type Queue<T> = Array<T>;
export const fromTree = (root: ItemTreeNode): FlatItemBlob => {
    const flatBlob: FlatItemBlob = {};
    const nodeStack: Queue<ItemTreeNode> = [root];
    const seenChildRecord: Record<string, boolean> = {};
    while (nodeStack.length) {
        const top = nodeStack.shift()
        if (top) {
            let foundDuplicate = false;
            const noDuplicateChildren = top.children.map((child): ItemTreeNode => {
                if (child.id in seenChildRecord) {
                    console.error(`Duplicate node ${top.id}! Making into a symlink and moving on.`);
                    const newItem = makeNewItem();
                    newItem.data = `[LN: ${child.id}]`;
                    foundDuplicate = true;
                    return newItem;
                } else {
                    seenChildRecord[child.id] = true;
                    nodeStack.push({ ...child, markedForCleanup: top.markedForCleanup || child.markedForCleanup })
                    return child;
                }
            });
            if (foundDuplicate) {
                top.children = noDuplicateChildren;
                top.lastModifiedUnixMillis = Date.now();
            }
            flatBlob[top.id] = flattenItemNode(top);
        }
    }
    return flatBlob;
}

const flattenItemNode = (itemNode: ItemTreeNode): FlatItemData => {
    const flatBlob: FlatItemData = {
        lastModifiedUnixMillis: itemNode.lastModifiedUnixMillis,
        data: itemNode.data,
        collapsed: itemNode.collapsed,
        children: itemNode.children.map(child => child.id)
    }
    if (itemNode.markedForCleanup) {
        setToDeleted(flatBlob);
    }
    return flatBlob;
}