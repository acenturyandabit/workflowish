import { makeNewUniqueKey } from "~CoreDataLake";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";


export type Command = {
    commandName: string,
    prettyName: string,
    singleArgument?: boolean
    command: (commandFunctions: {
        itemGetSetter: TransformedDataAndSetter,
        searchedItemId: string,
        currentItemId: string,
        focusItem: (id: string) => void,
        transformedDataAndSetter: TransformedDataAndSetter
    }) => void
}

export const commands: Command[] = [
    {
        commandName: "g",
        prettyName: "Jump to item",
        command: (commandFunctions) => {
            commandFunctions.focusItem(commandFunctions.searchedItemId);
        }
    },
    {
        commandName: "l",
        prettyName: "Add sibling with link to...",
        command: (commandFunctions) => {
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const currentItem = transformedData.keyedNodes[commandFunctions.currentItemId]
                const parentItemId = transformedData.parentById[commandFunctions.currentItemId];
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
            commandFunctions.focusItem(commandFunctions.currentItemId);
        },
    },
    {
        commandName: "lc",
        prettyName: "Add child with link to...",
        command: (commandFunctions) => {
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const currentItem = transformedData.keyedNodes[commandFunctions.currentItemId]
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
            commandFunctions.focusItem(commandFunctions.currentItemId);
        },
    },
    {
        commandName: "lu",
        prettyName: "Link this item under another...",
        command: (commandFunctions) => {
            const newNode: ItemTreeNode = {
                id: makeNewUniqueKey(),
                data: `[LN: ${commandFunctions.currentItemId}]`,
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
            commandFunctions.focusItem(newNode.id);
        },
    },
    {
        commandName: "csl",
        prettyName: "Copy as symlink",
        singleArgument: true,
        command: (commandFunctions) => {
            const newId = makeNewUniqueKey();
            commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
                const thisItem = transformedData.keyedNodes[commandFunctions.currentItemId];
                let linkId = commandFunctions.currentItemId;
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
                const parentId = transformedData.parentById[commandFunctions.currentItemId]
                const parentItem = transformedData.keyedNodes[parentId];
                const currentIdx = parentItem.children.map(i => i.id).indexOf(commandFunctions.currentItemId)
                parentItem.children.splice(currentIdx+1, 0, newNode);
                return {
                    [parentItem.id]: parentItem,
                    [newNode.id]: newNode
                }
            })
            commandFunctions.focusItem(newId);
        },
    }
]