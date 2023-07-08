import { makeNewUniqueKey } from "~CoreDataLake";
import { FocusRequest, TreePath } from "~Workflowish/mvc/DFSFocus";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";


export type Command = {
    commandName: string,
    prettyName: string,
    singleArgument?: boolean
    command: (commandFunctions: {
        itemGetSetter: TransformedDataAndSetter,
        searchedItemId: string,
        currentItem: { id: string, treePath: TreePath },
        focusItem: (focusRequest: FocusRequest) => void,
        transformedDataAndSetter: TransformedDataAndSetter
    }) => void
}

export const commands: Command[] = [
    {
        commandName: "g",
        prettyName: "Jump to item",
        command: (commandFunctions) => {
            commandFunctions.focusItem({ id: commandFunctions.searchedItemId });
        }
    },
    {
        commandName: "l",
        prettyName: "Add sibling with link to...",
        command: (commandFunctions) => {
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const currentItem = transformedData.keyedNodes[commandFunctions.currentItem.id]
                const parentItemId = transformedData.parentById[commandFunctions.currentItem.id];
                const parentItem = transformedData.keyedNodes[parentItemId];
                const currentChildIdx = parentItem.children.indexOf(currentItem);
                const newNode: ItemTreeNode = {
                    id: makeNewUniqueKey(),
                    data: `[LN: ${commandFunctions.searchedItemId}]`,
                    children: [],
                    collapsed: false,
                    searchHighlight: [],
                    lastModifiedUnixMillis: Date.now()
                }
                parentItem.children.splice(currentChildIdx + 1, 0, newNode);
                parentItem.lastModifiedUnixMillis = Date.now();
                return {
                    [parentItemId]: parentItem,
                    [newNode.id]: newNode
                }
            })
            commandFunctions.focusItem({ id: commandFunctions.currentItem.id, treePathHint: commandFunctions.currentItem.treePath });
        },
    },
    {
        commandName: "lc",
        prettyName: "Add child with link to...",
        command: (commandFunctions) => {
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const currentItem = transformedData.keyedNodes[commandFunctions.currentItem.id]
                const newNode: ItemTreeNode = {
                    id: makeNewUniqueKey(),
                    data: `[LN: ${commandFunctions.searchedItemId}]`,
                    children: [],
                    collapsed: false,
                    searchHighlight: [],
                    lastModifiedUnixMillis: Date.now()
                }
                return {
                    [currentItem.id]: {
                        ...currentItem,
                        lastModifiedUnixMillis: Date.now(),
                        children: [...currentItem.children, newNode]
                    },
                    [newNode.id]: newNode
                }
            })
            commandFunctions.focusItem({ id: commandFunctions.currentItem.id, treePathHint: commandFunctions.currentItem.treePath });
        },
    },
    {
        commandName: "lu",
        prettyName: "Link this item under another...",
        command: (commandFunctions) => {
            const newNode: ItemTreeNode = {
                id: makeNewUniqueKey(),
                data: `[LN: ${commandFunctions.currentItem.id}]`,
                children: [],
                collapsed: false,
                searchHighlight: [],
                lastModifiedUnixMillis: Date.now()
            }
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const searchedItem = transformedData.keyedNodes[commandFunctions.searchedItemId]
                return {
                    [searchedItem.id]: {
                        ...searchedItem,
                        lastModifiedUnixMillis: Date.now(),
                        children: [...searchedItem.children, newNode]
                    },
                    [newNode.id]: newNode
                }
            })
            commandFunctions.focusItem({ id: newNode.id });
        },
    },
    {
        commandName: "csl",
        prettyName: "Copy as symlink",
        singleArgument: true,
        command: (commandFunctions) => {
            const newId = makeNewUniqueKey();
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const thisItem = transformedData.keyedNodes[commandFunctions.currentItem.id];
                let linkId = commandFunctions.currentItem.id;
                if (thisItem.symlinkedNode) {
                    linkId = thisItem.symlinkedNode.id;
                }
                const newNode: ItemTreeNode = {
                    id: newId,
                    data: `[LN: ${linkId}]`,
                    children: [],
                    collapsed: false,
                    searchHighlight: [],
                    lastModifiedUnixMillis: Date.now()
                }
                const parentId = transformedData.parentById[commandFunctions.currentItem.id]
                const parentItem = transformedData.keyedNodes[parentId];
                const currentIdx = parentItem.children.map(i => i.id).indexOf(commandFunctions.currentItem.id)
                parentItem.children.splice(currentIdx + 1, 0, newNode);
                return {
                    [parentItem.id]: parentItem,
                    [newNode.id]: newNode
                }
            })
            commandFunctions.focusItem({ id: newId });
        },
    }
]