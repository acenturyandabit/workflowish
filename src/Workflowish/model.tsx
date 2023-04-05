import * as React from "react";
import { BaseItemType, BaseStoreDataType, makeNewUniqueKey, setToDeleted } from "~CoreDataLake";
import { SearchOptions } from "./Subcomponents/SearchBar";
export type ItemTreeNode = {
    lastModifiedUnixMillis: number
    id: string,
    data: string,
    children: ItemTreeNode[],
    collapsed: boolean,
    searchHighlight: SearchOptions,
    markedForCleanup?: boolean,
    symlinkedNode?: ItemTreeNode
}

export type FlatItemData = {
    lastModifiedUnixMillis: number
    data: string,
    children: string[],
    collapsed: boolean,
    lastRememberedParent: string
}

type FlatItemBlob = Record<string, FlatItemData>;

export const makeNewItem = (): ItemTreeNode => ({
    id: makeNewUniqueKey(),
    lastModifiedUnixMillis: Date.now(),
    data: "",
    children: [],
    searchHighlight: "NONE",
    collapsed: false
});

export const transformData = (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
}): [ItemTreeNode,
        React.Dispatch<React.SetStateAction<ItemTreeNode>>] => {
    const currentTodoItems = buildTree(props.data as FlatItemBlob);
    const setTodoItems = (todoItems: ItemTreeNode |
        ((currentTodoItems: ItemTreeNode) => ItemTreeNode)
    ) => {
        props.updateData((oldData) => {
            // TODO: Make Workflowish not have to update the entire tree.
            let todoItemsToSet: ItemTreeNode;
            if (todoItems instanceof Function) {
                todoItemsToSet = todoItems(buildTree(oldData as FlatItemBlob))
            } else {
                todoItemsToSet = todoItems
            }
            return fromTree(todoItemsToSet)
        })
    }
    return [currentTodoItems, setTodoItems];
}

const buildTree = (flatItemBlob: FlatItemBlob): ItemTreeNode => {
    const treeConstructorRecord: Record<string,
        ItemTreeNode
    > = {};
    const orphanedTreeItemCandidates = new Set<string>();
    // First pass: instantiation.
    for (const nodeId in flatItemBlob) {
        if (isValidTreeObject(flatItemBlob[nodeId])) {
            orphanedTreeItemCandidates.add(nodeId);
            treeConstructorRecord[nodeId] = {
                id: nodeId,
                lastModifiedUnixMillis: flatItemBlob[nodeId].lastModifiedUnixMillis,
                data: flatItemBlob[nodeId].data,
                children: [],
                searchHighlight: "NONE",
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
        treeConstructorRecord[nodeId].children = nodeChildInstances;
        flatItemBlob[nodeId].children.forEach(childId => orphanedTreeItemCandidates.delete(childId))
    }
    const virtualRootId = "__virtualRoot";
    let virtualRoot: ItemTreeNode;
    if (virtualRootId in treeConstructorRecord) {
        virtualRoot = treeConstructorRecord[virtualRootId];
    } else {
        virtualRoot = makeNewItem();
        virtualRoot.id = "__virtualRoot";
    }
    for (const orphanedId of orphanedTreeItemCandidates) {
        if (orphanedId != virtualRoot.id) virtualRoot.children.push(treeConstructorRecord[orphanedId]);
    }
    if (virtualRoot.children.length == 0) {
        virtualRoot.children.push(makeNewItem());
    }
    return virtualRoot;
}

const isValidTreeObject = (item: BaseItemType) => {
    return (
        "children" in item &&
        "data" in item &&
        "collapsed" in item
    )
}

type Queue<T> = Array<T>;
const fromTree = (root: ItemTreeNode): FlatItemBlob => {
    const flatBlob: FlatItemBlob = {};
    const lastRememberedParent: Record<string, string> = {};
    const nodeStack: Queue<ItemTreeNode> = [root];
    while (nodeStack.length) {
        const top = nodeStack.shift()
        if (top) {
            const noDuplicateChildren = top.children.filter(child => {
                if (child.id in lastRememberedParent) {
                    // Log an error and ignore the duplicate
                    console.error(`Duplicate node ${top.id}! Removing from this parent and moving on.`);
                    return false;
                } else {
                    lastRememberedParent[child.id] = top.id;
                    nodeStack.push({ ...child, markedForCleanup: top.markedForCleanup || child.markedForCleanup })
                    return true;
                }
            });
            if (noDuplicateChildren.length != top.children.length) {
                top.children = noDuplicateChildren;
                top.lastModifiedUnixMillis = Date.now();
            }
            flatBlob[top.id] = {
                lastModifiedUnixMillis: top.lastModifiedUnixMillis,
                data: top.data,
                collapsed: top.collapsed,
                children: top.children.map(child => child.id),
                lastRememberedParent: lastRememberedParent[top.id]
            }
            if (top.markedForCleanup) {
                setToDeleted(flatBlob[top.id]);
            }
        }
    }
    return flatBlob;
}