import * as localforage from "localforage";
import * as React from "react";
import { v4 as uuidv4 } from 'uuid';
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
export const makeNewUniqueKey = (): string => {
    return (Date.now().toString()) + uuidv4();
}

const defaultEmptyArray = () => [{
    id: makeNewUniqueKey(),
    data: "",
    children: [],
    collapsed: false
}];

export const useSavedItems = (): [Array<ItemTreeNode>, React.Dispatch<React.SetStateAction<Array<ItemTreeNode>>>] => {
    const [todoItems, setTodoItems] = React.useState<Array<ItemTreeNode>>(defaultEmptyArray())
    React.useEffect(() => {
        (async () => {
            const localForageTodoItems: FlatItemBlob | null = await localforage.getItem<FlatItemBlob>("items")
            if (localForageTodoItems) {
                setTodoItems(buildTree(localForageTodoItems));
            }
        })()
    }, [])

    React.useEffect(() => {
        localforage.setItem<FlatItemBlob>("items", fromTree(todoItems));
    }, [todoItems])

    return [todoItems, setTodoItems];
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
    if (treeRootsArray.length == 0) return defaultEmptyArray();
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