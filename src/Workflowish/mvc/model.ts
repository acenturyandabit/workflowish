import * as React from "react";
import { BaseItemType, BaseStoreDataType, makeNewUniqueKey, newBlankDoc, setToDeleted } from "~CoreDataLake";
import { generateFirstTimeWorkflowishDoc } from "./firstTimeDoc";
import { excludeKeys } from "~util/getStateToSet";

export type ItemTreeNode = {
    _lm: number
    id: string,
    data: string,
    children: ItemTreeNode[],
    collapsed: boolean,
    markedForCleanup?: boolean,
    symlinkedNode?: ItemTreeNode
}

export type FlatItemData = {
    _lm: number
    data: string,
    children: string[],
    collapsed: boolean
}

export type FlatItemBlob = Record<string, FlatItemData> & BaseStoreDataType;

export const makeNewItem = (): ItemTreeNode => ({
    id: makeNewUniqueKey(),
    _lm: Date.now(),
    data: "",
    children: [],
    collapsed: false
});

export type TransformedData = {
    rootNode: ItemTreeNode,
    keyedNodes: Record<string, ItemTreeNode>,
    parentById: Record<string, string>
};

export type ItemSetterByKey = (itemsToSet: Record<string, ItemTreeNode> | ((transformedData: TransformedData) => Record<string, ItemTreeNode>)) => void

export type TransformedDataAndSetter = {
    transformedData: TransformedData,
    setItemsByKey: ItemSetterByKey
    readyForEdits: boolean
};


export const getTransformedDataAndSetter = (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
}): TransformedDataAndSetter => {
    const transformedData = React.useRef<TransformedData>();
    let newTransformedData: TransformedData
    let setItemsByKey: ReturnType<typeof getItemSetterByKey>
    let readyForEdits: boolean;
    if (!(virtualRootId in props.data)) {
        const firstTimeData = fromTree(generateFirstTimeWorkflowishDoc());
        setTimeout(() => props.updateData((data) => {
            // Must check second time otherwise this is called multiple times.
            // feels like locks all over again
            if (!(virtualRootId in data)) return firstTimeData;
            else return newBlankDoc();
        }), 1);
        setItemsByKey = () => {
            // Don't allow user modifications before first load
            console.log("Attempted to edit before load complete");
        };
        readyForEdits = false;
        newTransformedData = transformData(firstTimeData);
    } else {
        newTransformedData = transformData(props.data as FlatItemBlob);
        setItemsByKey = getItemSetterByKey(props.updateData, transformedData);
        readyForEdits = true;
    }
    transformedData.current = newTransformedData;
    return {
        transformedData: newTransformedData,
        setItemsByKey,
        readyForEdits
    };
}

export const virtualRootId = "__virtualRoot";

export const getItemSetterByKey = (updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>, oldTransformedData: React.RefObject<TransformedData | undefined>): ItemSetterByKey => {
    return (itemsToSet: Record<string, ItemTreeNode> | ((transformedData: TransformedData) => Record<string, ItemTreeNode>)) => {
        updateData((data) => {
            let todoItemsToSet: Record<string, ItemTreeNode>;
            if (itemsToSet instanceof Function) {
                const currentData = oldTransformedData.current;
                if (currentData) {
                    todoItemsToSet = itemsToSet(currentData);
                } else {
                    throw "Data ref was undefined!"
                }
            } else {
                todoItemsToSet = itemsToSet;
            }
            const flatItemsToSet: BaseStoreDataType = {};
            for (const key in todoItemsToSet) {
                const flatItem = flattenItemNode(todoItemsToSet[key]);
                flatItemsToSet[key] = {
                    ...excludeKeys(data[key], Object.keys(flattenItemNode(makeNewItem()))),
                    ...flatItem,
                    _lm: Date.now()
                }
            }
            return flatItemsToSet;
        })
    }
}

export const transformData = (flatItemBlob: FlatItemBlob): TransformedData => {
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
                _lm: flatItemBlob[nodeId]._lm,
                data: flatItemBlob[nodeId].data,
                children: [],
                collapsed: flatItemBlob[nodeId].collapsed
            }
        }
    }
    // Second pass: Child linking
    for (const nodeId in treeConstructorRecord) {
        const dedupChildren = [...new Set(flatItemBlob[nodeId].children)];
        const nodeChildInstances = dedupChildren.map(childId => {
            const childWasDeleted = !(childId in treeConstructorRecord)
            return childWasDeleted ? null : treeConstructorRecord[childId]
        }).filter((nodeOrNull): nodeOrNull is ItemTreeNode => nodeOrNull != null);
        treeConstructorRecord[nodeId].children = nodeChildInstances;
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
    else {
        virtualRoot.children.forEach(child => parentById[child.id] = virtualRootId);
    }
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
                    console.error(`Duplicate node ${child.id}! Making into a symlink and moving on.`);
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
                top._lm = Date.now();
            }
            flatBlob[top.id] = flattenItemNode(top);
        }
    }
    return flatBlob;
}

export const flattenItemNode = (itemNode: ItemTreeNode): FlatItemData => {
    const flatBlob: FlatItemData = {
        _lm: itemNode._lm,
        data: itemNode.data,
        collapsed: itemNode.collapsed,
        children: itemNode.children.map(child => child.id)
    }
    if (itemNode.markedForCleanup) {
        setToDeleted(flatBlob);
    }
    return flatBlob;
}