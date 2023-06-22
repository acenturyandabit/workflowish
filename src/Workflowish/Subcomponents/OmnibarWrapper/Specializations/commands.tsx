import * as React from 'react'
import { ItemTreeNode, TransformedDataAndSetter } from "../../../mvc/model"
import { OmniBarState } from '../States'
import { SpecializedPropsFactory } from '.'
import { ItemRef } from '~Workflowish/Item'
import { getDefaultOmnibarState } from '..'
import { expandParentsAndFocusItem } from './utilities'
import { makeNewUniqueKey } from '~CoreDataLake'

type Command = {
    commandName: string,
    prettyName: string,
    command: (commandFunctions: {
        itemGetSetter: TransformedDataAndSetter,
        searchedItemId: string,
        currentItemId: string,
        focusItem: (id: string) => void,
        transformedDataAndSetter: TransformedDataAndSetter
    }) => void,
}

const commands: Command[] = [
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
    }
]

export const commandPropsFactory: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, ItemRef>
) => {
    const focusOriginalItem = () => itemsRefDictionary[omniBarState.preOmnibarFocusItemId || ""]?.focusThis();
    const { matchedCommand, matchingNodes } = getMatchedCommandAndMatchingNodes(omniBarState, transformedDataAndSetter);
    return {
        omnibarKeyHandler: (evt: React.KeyboardEvent) => {
            if (evt.key == "ArrowUp") {
                setOmniBarState((oldState) => ({ ...oldState, selectionIdx: oldState.selectionIdx - 1 }))
            } else if (evt.key == "ArrowDown") {
                setOmniBarState((oldState) => ({ ...oldState, selectionIdx: oldState.selectionIdx + 1 }))
            } else if (evt.key == "Enter") {
                if (matchedCommand) {
                    matchedCommand.command({
                        itemGetSetter: transformedDataAndSetter,
                        searchedItemId: matchingNodes[omniBarState.selectionIdx].id,
                        currentItemId: omniBarState.preOmnibarFocusItemId || "",
                        focusItem: (id: string) => expandParentsAndFocusItem(transformedDataAndSetter, itemsRefDictionary, id),
                        transformedDataAndSetter
                    })
                    setOmniBarState(getDefaultOmnibarState());
                }
            } else if (evt.key == "Escape") {
                setOmniBarState(getDefaultOmnibarState());
                focusOriginalItem();
            }
        },
        rootNode: transformedDataAndSetter.transformedData.rootNode,
        extraAnnotations: <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", bottom: 0 }}>
                {/* TODO: Use non-breaking reflow: https://stackoverflow.com/questions/2147303/how-can-i-send-an-inner-div-to-the-bottom-of-its-parent-div */}
                <div className="command-hints-container">
                    <CommandHints omniBarState={omniBarState} matchingNodes={matchingNodes} matchedCommand={matchedCommand} />
                </div>
            </div>
        </div>
    }
}

const getMatchedCommandAndMatchingNodes = (omniBarState: OmniBarState, transformedDataAndSetter: TransformedDataAndSetter) => {
    const omniBarContents = omniBarState.barContents;
    const commandEngaged = omniBarContents.includes(":");
    let matchingNodes: ItemTreeNode[] = [];
    let matchedCommand: Command | null = null;
    if (commandEngaged) {
        const contentParts = omniBarContents.split(":");
        const commandPart = contentParts.shift();
        if (commandPart) {
            matchedCommand = commands.filter((command) => commandMatchesFilter(command, commandPart.slice(">".length)))[0];
            const searchPart = contentParts.join(":");
            matchingNodes = Object.values(transformedDataAndSetter.transformedData.keyedNodes).filter(node => node.data.toLowerCase().includes(searchPart.toLowerCase()));
        }
    }
    return {
        matchingNodes,
        matchedCommand
    }
}


const commandMatchesFilter = (command: Command, omniBarContents: string): boolean => {
    return omniBarContents == command.commandName;
}

export const CommandHints = (props: { omniBarState: OmniBarState, matchingNodes: ItemTreeNode[], matchedCommand: Command | null }) => {
    let elementToReturn: React.ReactElement;
    if (props.matchedCommand) {
        elementToReturn = <>
            <p className="selected-command">{props.matchedCommand.commandName}: {props.matchedCommand.prettyName}</p>
            {props.matchingNodes.map((node, idx) => (<p className={idx == props.omniBarState.selectionIdx ? "selected" : ""} key={idx}>{node.data}</p>))}
        </>
    } else {
        const matchingCommands = commands.filter((command) => commandPartiallyMatchesFilter(command, props.omniBarState.barContents.slice(">".length)));
        if (matchingCommands.length) {
            elementToReturn = <>
                {matchingCommands.map((command, idx) => (<p key={idx}>{command.commandName}: {command.prettyName}</p>))}
            </>
        } else {
            elementToReturn = <p>No matching command</p>
        }
    }
    return elementToReturn;
}

const commandPartiallyMatchesFilter = (command: Command, omniBarContents: string): boolean => {
    return (command.commandName && omniBarContents.startsWith(command.commandName))
        || command.prettyName.includes(omniBarContents);
}