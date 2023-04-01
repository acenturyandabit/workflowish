import * as React from "react";
import { BaseItemType, BaseStoreDataType, makeNewUniqueKey, setToDeleted } from "~CoreDataLake";
export type ItemTreeNode = {
    lastModifiedUnixMillis: number
    id: string,
    data: string,
    children: ItemTreeNode[],
    collapsed: boolean,
    markedForCleanup?: boolean
}

type FlatItemData = {
    lastModifiedUnixMillis: number
    data: string,
    children: string[],
    collapsed: boolean
}

type FlatItemBlob = Record<string, FlatItemData>;

export const makeNewItem = (): ItemTreeNode => ({
    id: makeNewUniqueKey(),
    lastModifiedUnixMillis: Date.now(),
    data: "",
    children: [],
    collapsed: false
});

export const transformData = (props: {
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}): [Array<ItemTreeNode>,
        React.Dispatch<React.SetStateAction<Array<ItemTreeNode>>>] => {
    const currentTodoItems = buildTree(props.data as FlatItemBlob);
    const setTodoItems = (todoItems: Array<ItemTreeNode> |
        ((currentTodoItems: Array<ItemTreeNode>) => Array<ItemTreeNode>)
    ) => {
        props.setData((oldData) => {
            let todoItemsToSet: Array<ItemTreeNode>
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

const buildTree = (flatItemBlob: FlatItemBlob): Array<ItemTreeNode> => {
    const treeConstructorRecord: Record<string,
        ItemTreeNode
    > = {};
    const treeRootIdCandidates = new Set<string>();
    // First pass: instantiation.
    for (const nodeId in flatItemBlob) {
        if (isValidTreeObject(flatItemBlob[nodeId])) {
            treeRootIdCandidates.add(nodeId);
            treeConstructorRecord[nodeId] = {
                id: nodeId,
                lastModifiedUnixMillis: flatItemBlob[nodeId].lastModifiedUnixMillis,
                data: flatItemBlob[nodeId].data,
                children: [],
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
        flatItemBlob[nodeId].children.forEach(childId => treeRootIdCandidates.delete(childId))
    }
    const treeRootsArray = Array.from(treeRootIdCandidates).map(rootId => treeConstructorRecord[rootId]);
    if (treeRootsArray.length == 0) return [makeNewItem()];
    else return treeRootsArray;
}

const isValidTreeObject = (item: BaseItemType) => {
    return (
        "children" in item &&
        "data" in item &&
        "collapsed" in item
    )
}

const fromTree = (itemTreeArray: Array<ItemTreeNode>): FlatItemBlob => {
    const flatBlob: FlatItemBlob = {};
    const unrollItems = (nodes: ItemTreeNode[]) => {
        nodes.forEach((n) => {
            flatBlob[n.id] = {
                lastModifiedUnixMillis: n.lastModifiedUnixMillis,
                data: n.data,
                children: n.children.map(i => i.id),
                collapsed: n.collapsed
            }
            if (n.markedForCleanup) {
                setToDeleted(flatBlob[n.id]);
            }
            unrollItems(n.children);
        })
    }
    unrollItems(itemTreeArray);
    return flatBlob;
}