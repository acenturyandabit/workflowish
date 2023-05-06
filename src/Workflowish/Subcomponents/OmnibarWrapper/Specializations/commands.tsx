import * as React from 'react'
import { ItemTreeNode, TransformedDataAndSetter } from "../../../mvc/model"
import { OmniBarState } from '../States'
import { SpecializedPropsFactory } from '.'
import { FocusActions } from '~Workflowish/Item'
import { getDefaultOmnibarState } from '..'
import { expandParentsAndFocusItem } from './utilities'

type Command = {
    shortcut?: string,
    fullName: string,
    command: (commandFunctions: {
        itemGetSetter: TransformedDataAndSetter,
        searchedItemId: string,
        focusItem: (id: string) => void
    }) => void
}

const commands: Command[] = [
    {
        shortcut: "g",
        fullName: "Jump to item",
        command: (commandFunctions) => {
            commandFunctions.focusItem(commandFunctions.searchedItemId);
        }
    }
]

export const commandPropsFactory: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, FocusActions>
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
                        focusItem: (id: string) => expandParentsAndFocusItem(transformedDataAndSetter, itemsRefDictionary, id)
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
    return (command.shortcut && omniBarContents.startsWith(command.shortcut))
        || command.fullName.includes(omniBarContents);
}

export const CommandHints = (props: { omniBarState: OmniBarState, matchingNodes: ItemTreeNode[], matchedCommand: Command | null }) => {
    let elementToReturn: React.ReactElement;
    if (props.matchedCommand) {
        elementToReturn = <>
            <p className="selected-command">{props.matchedCommand.shortcut}: {props.matchedCommand.fullName}</p>
            {props.matchingNodes.map((node, idx) => (<p className={idx == props.omniBarState.selectionIdx ? "selected" : ""} key={idx}>{node.data}</p>))}
        </>
    } else {
        const matchingCommands = commands.filter((command) => commandMatchesFilter(command, props.omniBarState.barContents.slice(">".length)));
        if (matchingCommands.length) {
            elementToReturn = <>
                {matchingCommands.map((command, idx) => (<p key={idx}>{command.shortcut}: {command.fullName}</p>))}
            </>
        } else {
            elementToReturn = <p>No matching command</p>
        }
    }
    return elementToReturn;
}