import * as React from "react";
import { BaseStoreDataType, makeNewUniqueKey } from "~CoreDataLake";
export type ItemTreeNode = {
    id: string,
    data: string,
    children: ItemTreeNode[],
    collapsed: boolean
}

type FlatItemData = {
    data: string,
    parentId: string,
    indexInParent: number,
    collapsed: boolean
}

type FlatItemBlob = Record<string, FlatItemData>;

export const makeNewItem = () => ({
    id: makeNewUniqueKey(),
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
    const treeRootsArray: Array<ItemTreeNode> = [];
    const treeConstructorRecord: Record<string,
        { indexInParent: number, children: Array<ItemTreeNode & { indexInParent: number }> } & ItemTreeNode
    > = {};
    // First pass: instantiation. 
    for (const nodeId in flatItemBlob) {
        treeConstructorRecord[nodeId] = {
            id: nodeId,
            data: flatItemBlob[nodeId].data,
            indexInParent: flatItemBlob[nodeId].indexInParent,
            children: [],
            collapsed: flatItemBlob[nodeId].collapsed
        }
    }
    // Second pass: Parent assignment
    for (const nodeId in flatItemBlob) {
        const parentId = flatItemBlob[nodeId].parentId;
        const currentNode = treeConstructorRecord[nodeId];
        if (parentId in treeConstructorRecord) {
            treeConstructorRecord[parentId].children.push(currentNode);
        } else {
            // Lost OR root items
            treeRootsArray.push(currentNode);
        }
    }
    // Clean up the ordering
    for (const nodeId in flatItemBlob) {
        const currentNode = treeConstructorRecord[nodeId];
        currentNode.children.sort((a, b) => a.indexInParent - b.indexInParent);
    }
    // Remove indexInParent
    treeRootsArray.forEach((n: ItemTreeNode & { indexInParent?: number }) => {
        delete n.indexInParent;
    })
    if (treeRootsArray.length == 0) return [makeNewItem()];
    else return treeRootsArray;
}

const fromTree = (itemTreeArray: Array<ItemTreeNode>): FlatItemBlob => {
    const flatBlob: FlatItemBlob = {};
    const unrollItems = (parentId: string, nodes: ItemTreeNode[]) => {
        nodes.forEach((n, idx) => {
            flatBlob[n.id] = {
                data: n.data,
                parentId: parentId,
                indexInParent: idx,
                collapsed: n.collapsed
            }
            unrollItems(n.id, n.children);
        })
    }
    unrollItems("", itemTreeArray);
    return flatBlob;
}