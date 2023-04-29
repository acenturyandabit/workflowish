import * as React from 'react';
import { ItemTreeNode, virtualRootId } from '~Workflowish/mvc/model';
import { OmniBarState, SearchPartialState } from './States';

export type SearchState = SearchPartialState & {
    searchText: string
}

export const resetSearchState = (): SearchPartialState => ({
    searchSelectionIdx: 0
})

export type HighlightStates = "SEARCH_UNCOLLAPSE" | "SEARCH_MATCH" | "SEARCH_SELECTED"

export const searchTransformFromOmnibarState = (
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
    const omniBarStateToSearchState = (omniBarState: OmniBarState): SearchState => ({
        ...omniBarState.searchState,
        searchText: omniBarState.barContents
    });
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
                    searchState: searchPartialState as SearchPartialState
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
    rootNode.searchHighlight = [];
    let nMatches = 0;
    let currentMatchId = "";
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
                child.searchHighlight = [];
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
        if (searchParams.searchSelectionIdx < 0) {
            setSearchParams({ ...searchParams, searchSelectionIdx: 0 });
        } else if (searchParams.searchSelectionIdx > searchMatchArray.length - 1) {
            setSearchParams({ ...searchParams, searchSelectionIdx: searchMatchArray.length - 1 });
        } else {
            searchMatchArray[searchParams.searchSelectionIdx].node.searchHighlight.push("SEARCH_SELECTED");
            currentMatchId = searchMatchArray[searchParams.searchSelectionIdx].node.id;
            currentMatchParentChain = searchMatchArray[searchParams.searchSelectionIdx].parentChain;
        }
    }

    return {
        rootNode: { ...rootNode },
        nMatches,
        currentMatchId,
        currentMatchParentChain
    };
}
