import { makeNewUniqueKey } from "~CoreDataLake";
import { FocusRequest, TreePath } from "~Workflowish/mvc/DFSFocus";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";


type CommandFunctionsBundle = {
    currentCommand: Command,
    itemGetSetter: TransformedDataAndSetter,
    searchedItemId: string,
    currentItem: { id: string, treePath: TreePath },
    focusItem: (focusRequest: FocusRequest) => void,
    transformedDataAndSetter: TransformedDataAndSetter
};

export type Command = {
    commandName: string,
    prettyName: string,
    singleArgument?: boolean
    command: (commandFunctions: CommandFunctionsBundle) => void
}

export const commands: Command[] = [
    {
        commandName: "g",
        prettyName: "Jump to item",
        command: (commandFunctions) => {
            commandFunctions.focusItem({ id: commandFunctions.searchedItemId, treePathHint: commandFunctions.currentItem.treePath });
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
        commandName: "m",
        prettyName: "Move current item under...",
        command: (commandFunctions) => {
            moveItem(commandFunctions);
            commandFunctions.focusItem({ id: commandFunctions.currentItem.id });
        },
    },
    {
        commandName: "ma",
        prettyName: "Move away current item under... (Doesn't focus after move)",
        command: (commandFunctions) => {
            moveItem(commandFunctions);
            commandFunctions.focusItem({ treePathHint: commandFunctions.currentItem.treePath });
        },
    },
    {
        commandName: "lc",
        prettyName: "Add child with link to...",
        command: (commandFunctions) => {
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
            commandFunctions.focusItem({ id: newNode.id, treePathHint: commandFunctions.currentItem.treePath });
        },
    },
    {
        commandName: "csl",
        prettyName: "Copy as symlink here",
        singleArgument: true,
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "cslu",
        prettyName: "Copy as symlink under...",
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "msl",
        prettyName: "Keep symlink here but move away to...",
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "msla",
        prettyName: "Keep symlink here and move this away under...",
        command: (commandFunctions) => copySymlink(commandFunctions),
    }
]

const copySymlink = (commandFunctions: CommandFunctionsBundle) => {
    const newId = makeNewUniqueKey();
    const commandName = commandFunctions.currentCommand.commandName;
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
        const thisParentId = transformedData.parentById[commandFunctions.currentItem.id];
        const thisParentItem = transformedData.keyedNodes[thisParentId];
        const symlinkParentId = commandName == "csl" ? thisParentId : commandFunctions.searchedItemId
        const symlinkParentItem = transformedData.keyedNodes[symlinkParentId];
        const currentIdx = symlinkParentItem.children.map(i => i.id).indexOf(commandFunctions.currentItem.id)
        const modifiedItems: Record<string, ItemTreeNode> = {
            [newNode.id]: newNode
        }
        if (commandName != "cslu") {
            const removeItemFromThisParent = () => {
                const shouldRemoveItem = commandName.startsWith("m") ? 1 : 0;
                thisParentItem.children.splice(currentIdx + 1, shouldRemoveItem, newNode);
                modifiedItems[thisParentItem.id] = thisParentItem;
            };
            removeItemFromThisParent();
        }
        const itemAlreadyAddedToOldParent = (commandName == "csl");
        if (!itemAlreadyAddedToOldParent) {
            symlinkParentItem.children.push(newNode);
            modifiedItems[symlinkParentItem.id] = symlinkParentItem;
        }
        return modifiedItems;
    })
    if (commandFunctions.currentCommand.commandName.length == 4) {
        commandFunctions.focusItem({ treePathHint: commandFunctions.currentItem.treePath });
    } else {
        commandFunctions.focusItem({ id: newId, treePathHint: commandFunctions.currentItem.treePath });
    }
}

const moveItem = (commandFunctions: CommandFunctionsBundle) => {
    commandFunctions.transformedDataAndSetter.setItemsByKey((transformedData) => {
        const currentItem = transformedData.keyedNodes[commandFunctions.currentItem.id]
        const currentParentItemId = transformedData.parentById[commandFunctions.currentItem.id];
        const currentParentItem = transformedData.keyedNodes[currentParentItemId];
        const currentChildIdx = currentParentItem.children.indexOf(currentItem);
        currentParentItem.children.splice(currentChildIdx, 1);

        const newParentItem = transformedData.keyedNodes[commandFunctions.searchedItemId];
        newParentItem.children.push(currentItem);
        return {
            [currentParentItemId]: currentParentItem,
            [newParentItem.id]: newParentItem,
        }
    })
}
