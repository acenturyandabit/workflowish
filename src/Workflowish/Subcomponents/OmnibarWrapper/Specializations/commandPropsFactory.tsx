import * as React from 'react'
import { ItemTreeNode, TransformedDataAndSetter } from "../../../mvc/model"
import { OmniBarState } from '../States'
import { SpecializedPropsFactory } from '.'
import { ItemRef } from '~Workflowish/Item'
import { getDefaultOmnibarState } from '..'
import { expandParentsAndFocusItem } from './utilities'
import { Command, commands } from './commands'



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
    let matchingNodes: ItemTreeNode[] = [];
    let matchedCommand: Command | null = null;
    const contentParts = omniBarContents.split(":");
    const commandPart = contentParts.shift();
    if (commandPart) {
        matchedCommand = commands.filter((command) => commandMatchesFilter(command, commandPart.slice(">".length)))[0];
        let searchPart = contentParts.join(":");
        searchPart = searchPart.replace(/^\s+/,"");
        matchingNodes = Object.values(transformedDataAndSetter.transformedData.keyedNodes).filter(node => node.data.toLowerCase().includes(searchPart.toLowerCase()));
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
        const matchedItems = props.matchingNodes.map((node, idx) => (<p className={idx == props.omniBarState.selectionIdx ? "selected" : ""} key={idx}>{node.data}</p>))
        elementToReturn = <>
            <p className="selected-command">{props.matchedCommand.commandName}: {props.matchedCommand.prettyName}</p>
            {props.matchedCommand.singleArgument ? null : matchedItems}
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
    return (command.commandName && command.commandName.startsWith(omniBarContents))
        || command.prettyName.includes(omniBarContents);
}