import * as React from 'react';
import { ItemTreeNode, TransformedDataAndSetter, virtualRootId } from '~Workflowish/mvc/model';
import { OmniBarState } from '../States';
import { SpecializedPropsFactory } from '.';
import { ItemRef } from '~Workflowish/Item';
import { getDefaultOmnibarState } from '..';
import { expandParentsAndFocusItem } from './utilities';

type SearchState = {
    searchText: string,
    selectionIdx: number
}

const HighlightStatesArray = ["SEARCH_UNCOLLAPSE", "SEARCH_MATCH", "SEARCH_SELECTED"] as const;
export type HighlightStates = typeof HighlightStatesArray[number];
export const NO_MATCH = "";


export const searchPropsFactory: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, ItemRef>
) => {
    const { rootNode, nMatches, currentMatchId } = searchTransformFromOmnibarState(transformedDataAndSetter.transformedData.rootNode, omniBarState, setOmniBarState);
    const matchMessage = nMatches > 0 ? `${omniBarState.selectionIdx + 1} / ${nMatches} matches` : "No matches"
    const scrollToCurrentItem = () => itemsRefDictionary[currentMatchId]?.scrollThisIntoView();
    const focusOriginalItem = () => itemsRefDictionary[omniBarState.preOmnibarFocusItemId || ""]?.focusThis();
    const expandCurrentItem = () => {
        if (currentMatchId != NO_MATCH) {
            expandParentsAndFocusItem(transformedDataAndSetter, itemsRefDictionary, currentMatchId);
        }
    };
    return {
        omnibarKeyHandler: makeSearchKeyEventHandler(
            setOmniBarState,
            scrollToCurrentItem,
            focusOriginalItem,
            expandCurrentItem
        ),
        rootNode,
        extraAnnotations: omniBarState.barContents.length ? <span>{matchMessage}</span> : <></>
    }
}


const searchTransformFromOmnibarState = (
    rootNode: ItemTreeNode,
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>
): ReturnType<typeof searchTransform> => {
    const { searchState, setSearchState } = omniBarStateProxy(omniBarState, setOmniBarState);
    return searchTransform(rootNode, searchState, setSearchState);
}


const omniBarStateProxy = (
    omniBarState: OmniBarState,
    setOmnibarState: React.Dispatch<React.SetStateAction<OmniBarState>>
): {
    searchState: SearchState,
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>
} => {
    const omniBarStateToSearchState = (omniBarState: OmniBarState): SearchState => {
        let searchText = omniBarState.barContents;
        if (searchText.startsWith(">")) {
            searchText = "";
        }
        return {
            selectionIdx: omniBarState.selectionIdx,
            searchText
        }
    };
    return {
        searchState: omniBarStateToSearchState(omniBarState),
        setSearchState: (newSearchStateOrSetter: SearchState | ((old: SearchState) => SearchState)) => {
            setOmnibarState((omniBarState: OmniBarState): OmniBarState => {
                let searchStateToSet: SearchState = omniBarStateToSearchState(omniBarState);
                if (typeof newSearchStateOrSetter == "function") {
                    searchStateToSet = newSearchStateOrSetter(searchStateToSet);
                } else {
                    searchStateToSet = newSearchStateOrSetter;
                }
                const searchPartialState: Partial<SearchState> = searchStateToSet;
                delete searchPartialState.searchText; // TODO: Surely there's a more idiomatic way to delete one property of an item to convert it into another
                return {
                    ...omniBarState,
                    barContents: searchStateToSet.searchText,
                    selectionIdx: searchStateToSet.selectionIdx
                }
            })
        }
    };
}


const searchTransform = (rootNode: ItemTreeNode,
    searchParams: SearchState,
    setSearchParams: React.Dispatch<React.SetStateAction<SearchState>>
): {
    rootNode: ItemTreeNode,
    nMatches: number,
    currentMatchId: string,
    currentMatchParentChain: string[]
} => {
    // TODO: room for optimization here to omit the DFS if there is no search text, but be careful!
    const nodeStack: Array<ItemTreeNode> = [rootNode];
    type DFSMetadata = {
        passCount: number
        node: ItemTreeNode,
        isMatch: boolean,
        dfsOrder: number,
        parentChain: string[]
    }
    let dfsOrder = 0;
    const dfsSeenList: Record<string, DFSMetadata> = {
        [rootNode.id]: {
            passCount: 1,
            node: rootNode,
            isMatch: false,
            dfsOrder,
            parentChain: [rootNode.id]
        }
    };
    rootNode.searchHighlight = rootNode.searchHighlight.filter(state => !HighlightStatesArray.includes(state as HighlightStates));
    let nMatches = 0;
    let currentMatchId = NO_MATCH;
    let currentMatchParentChain: string[] = [];
    while (nodeStack.length) {
        const top: ItemTreeNode = nodeStack.pop() as ItemTreeNode;
        if (dfsSeenList[top.id].passCount == 1) {
            dfsSeenList[top.id].passCount++;
            dfsSeenList[top.id].dfsOrder = dfsOrder;
            dfsOrder++;
            nodeStack.push(top);
            // Emit all my children to the stack
            top.children.forEach(child => {
                dfsSeenList[child.id] = {
                    passCount: 1,
                    node: child,
                    isMatch: false,
                    dfsOrder: -1,
                    parentChain: [...dfsSeenList[top.id].parentChain, child.id]
                }
                child.searchHighlight = child.searchHighlight.filter(state => !HighlightStatesArray.includes(state as HighlightStates));
            });
            const reversedChildrenForDFS = [...top.children].reverse();
            nodeStack.push(...reversedChildrenForDFS);
        } else if (dfsSeenList[top.id].passCount == 2) {
            if (searchParams.searchText.length > 0 && top.data.toLowerCase().includes(searchParams.searchText.toLowerCase())) {
                top.searchHighlight.push("SEARCH_MATCH");
                if (top.id != virtualRootId) {
                    dfsSeenList[top.id].isMatch = true;
                }
                nMatches++;
            }
            const shouldUncollapse = top.children.reduce((shouldUncollapse, child) => shouldUncollapse
                || child.searchHighlight.includes("SEARCH_UNCOLLAPSE")
                || child.searchHighlight.includes("SEARCH_MATCH"),
                false);
            if (shouldUncollapse) {
                top.searchHighlight.push("SEARCH_UNCOLLAPSE");
            }
        }
    }
    const searchMatchArray = Object.values(dfsSeenList)
        .sort((a: DFSMetadata, b: DFSMetadata) => a.dfsOrder - b.dfsOrder)
        .filter((i: DFSMetadata) => i.isMatch);
    if (searchMatchArray.length > 0) {
        if (searchParams.selectionIdx < 0) {
            setSearchParams({ ...searchParams, selectionIdx: 0 });
        } else if (searchParams.selectionIdx > searchMatchArray.length - 1) {
            setSearchParams({ ...searchParams, selectionIdx: searchMatchArray.length - 1 });
        } else {
            searchMatchArray[searchParams.selectionIdx].node.searchHighlight.push("SEARCH_SELECTED");
            currentMatchId = searchMatchArray[searchParams.selectionIdx].node.id;
            currentMatchParentChain = searchMatchArray[searchParams.selectionIdx].parentChain;
        }
    }

    return {
        rootNode: { ...rootNode },
        nMatches,
        currentMatchId,
        currentMatchParentChain
    };
}


export const makeSearchKeyEventHandler = (
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    scrollToCurrentItem: () => void,
    focusOriginalItem: () => void,
    expandParentsAndFocusItem: () => void
) => {
    return (evt: React.KeyboardEvent) => {
        if (evt.key == "ArrowUp") {
            setOmniBarState((oldState) => ({ ...oldState, selectionIdx: oldState.selectionIdx - 1 }))
            window.setTimeout(scrollToCurrentItem, 1);
        } else if (evt.key == "ArrowDown") {
            setOmniBarState((oldState) => ({ ...oldState, selectionIdx: oldState.selectionIdx + 1 }))
            window.setTimeout(scrollToCurrentItem, 1);
        } else if (evt.key == "Enter") {
            setOmniBarState(getDefaultOmnibarState());
            expandParentsAndFocusItem()
        } else if (evt.key == "Escape") {
            // Todo: This seems common to the command specialization - do some code dedup
            setOmniBarState(getDefaultOmnibarState());
            focusOriginalItem();
        } else {
            // Search query was changed
            window.setTimeout(scrollToCurrentItem, 1);
        }
    }
}