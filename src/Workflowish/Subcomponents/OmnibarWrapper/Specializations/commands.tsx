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
                    _lm: Date.now()
                }
                parentItem.children.splice(currentChildIdx + 1, 0, newNode);
                parentItem._lm = Date.now();
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
        commandName: "cl",
        prettyName: "Create link to [item] here",
        singleArgument: true,
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "clu",
        prettyName: "Create link to this item under...",
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "ml",
        prettyName: "Move this to [item] and make symlink here",
        command: (commandFunctions) => copySymlink(commandFunctions),
    },
    {
        commandName: "mla",
        prettyName: "Move this to [item] and make symlink here; keep focus here",
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
            _lm: Date.now()
        }
        const thisParentId = transformedData.parentById[commandFunctions.currentItem.id];
        const thisParentItem = transformedData.keyedNodes[thisParentId];
        const currentIdx = thisParentItem.children.map(i => i.id).indexOf(commandFunctions.currentItem.id)

        const modifiedItems: Record<string, ItemTreeNode> = {
            [newNode.id]: newNode
        }
        if (commandName.startsWith("m")) {
            // remove original item from parent and insert symlink
            thisParentItem.children.splice(currentIdx, 1, newNode);
            modifiedItems[thisParentItem.id] = thisParentItem;
            // insert into target
            const moveTarget = transformedData.keyedNodes[commandFunctions.searchedItemId];
            moveTarget.children.push(thisItem);
            modifiedItems[moveTarget.id] = moveTarget;
        } else {
            if (commandName == "cl") {
                thisParentItem.children.splice(currentIdx + 1, 0, newNode);
                modifiedItems[thisParentItem.id] = thisParentItem;
            } else {
                const newSymlinkParent = transformedData.keyedNodes[commandFunctions.searchedItemId];
                newSymlinkParent.children.push(newNode);
                modifiedItems[newSymlinkParent.id] = newSymlinkParent;
            }
        }
        return modifiedItems;
    })
    if (commandFunctions.currentCommand.commandName.length == 3) {
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
