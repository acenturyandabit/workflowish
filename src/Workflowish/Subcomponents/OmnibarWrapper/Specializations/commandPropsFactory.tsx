import * as React from 'react'
import { ItemTreeNode, TransformedDataAndSetter } from "../../../mvc/model"
import { OmniBarState } from '../States'
import { SpecializedPropsFactory } from '.'
import { getDefaultOmnibarState } from '..'
import { expandParentsAndFocusItem } from './utilities'
import { Command, commands } from './commands'
import { DFSFocusManager, FocusRequest } from '~Workflowish/mvc/DFSFocus'
import { ItemRef } from '~Workflowish/Item'



export const commandPropsFactory: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, ItemRef>,
    dfsFocusManager: DFSFocusManager
) => {
    let focusOriginalItem = () => {
        // if no selected item, do nothing
    };
    if (omniBarState.preOmnibarFocusItem) {
        const prevFocusItem = omniBarState.preOmnibarFocusItem;
        focusOriginalItem = () => dfsFocusManager.focusItem({ id: prevFocusItem.id, treePathHint: prevFocusItem.treePath });
    }
    const { matchedCommand, matchingNodes } = getMatchedCommandAndMatchingNodes(omniBarState, transformedDataAndSetter);
    return {
        omnibarKeyHandler: (evt: { key: string }) => {
            if (evt.key == "ArrowUp") {
                setOmniBarState((oldState) => ({ ...oldState, selectionIdx: Math.max(oldState.selectionIdx - 1, 0) }))
            } else if (evt.key == "ArrowDown") {
                setOmniBarState((oldState) => ({ ...oldState, selectionIdx: Math.min(oldState.selectionIdx + 1, matchingNodes.length - 1) }))
            } else if (evt.key == "Enter") {
                if (matchedCommand) {
                    matchedCommand.command({
                        currentCommand: matchedCommand,
                        itemGetSetter: transformedDataAndSetter,
                        searchedItemId: matchingNodes[omniBarState.selectionIdx].id,
                        currentItem: omniBarState.preOmnibarFocusItem ?? { id: "", treePath: [] },
                        focusItem: (focusRequest: FocusRequest) => expandParentsAndFocusItem(transformedDataAndSetter, dfsFocusManager, focusRequest),
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
    const candidateSeparators = [":", ","]; // comma is more easy to reach on mobile
    const separatorIndices = candidateSeparators.map(sep => ({ sep, idx: omniBarContents.indexOf(sep) })).filter(sep_pair => sep_pair.idx > 0);
    if (separatorIndices.length > 0) {
        const separator = separatorIndices.sort((a, b) => a.idx - b.idx)[0].sep;
        const contentParts = omniBarContents.split(separator);
        const commandPart = contentParts.shift();
        if (commandPart) {
            matchedCommand = commands.filter((command) => commandMatchesFilter(command, commandPart.slice(">".length)))[0];
            let searchPart = contentParts.join(separator);
            searchPart = searchPart.replace(/^\s+/, "");
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