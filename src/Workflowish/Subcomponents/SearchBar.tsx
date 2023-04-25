import * as React from 'react';
import { ItemTreeNode, TodoItemsGetSetterWithKeyedNodes, virtualRootId } from '../mvc/model';
import { ModelContext } from '~Workflowish/mvc/context';
import { FocusActions } from '~Workflowish/Item';
import "./SearchBar.css"

type SearchParams = {
    searchText: string,
    // TODO: Change this to use DFS ordering
    searchSelectionIdx: number
}

export default (props: {
    children: React.ReactElement,
    itemRefsDictionary: Record<string, FocusActions>,
    getSetTodoItems: TodoItemsGetSetterWithKeyedNodes
}) => {
    const [searchParams, setSearchParams] = React.useState<SearchParams>({
        searchText: "",
        searchSelectionIdx: 0
    });
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);
    const { rootNode, nMatches, currentMatchId, currentMatchParentChain } = searchTransform(itemTree, searchParams, setSearchParams);
    const focusOnCurrentItem = () => {
        setSearchParams({ searchText: "", searchSelectionIdx: 0 });
        props.getSetTodoItems((oldRoot, oldKeyedNodes) => {
            currentMatchParentChain.forEach(itemKey => {
                oldKeyedNodes[itemKey].collapsed = false;
                oldKeyedNodes[itemKey].lastModifiedUnixMillis = Date.now();
            })
            return oldRoot;
        })
        props.itemRefsDictionary[currentMatchId].focusThis();
    }
    const scrollToCurrentItem = () => {
        props.itemRefsDictionary[currentMatchId].scrollThisIntoView();
    }
    return <>
        <SearchBar 
            searchParams={searchParams} 
            setSearchParams={setSearchParams} 
            nMatches={nMatches} 
            focusOnCurrentItem={focusOnCurrentItem}
            scrollToCurrentItem={scrollToCurrentItem}
        ></SearchBar>
        <ModelContext.Provider value={rootNode}>
            {props.children}
        </ModelContext.Provider>
    </>
}

const SearchBar = (props: {
    searchParams: SearchParams,
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>,
    focusOnCurrentItem: () => void,
    scrollToCurrentItem: () => void,
    nMatches: number
}) => {
    const inputReference = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        const listenForCtrlF = (e: KeyboardEvent) => {
            if (e.key == "f" && (e.ctrlKey || e.metaKey)) {
                const userIsAlreadyInSearchBar = (inputReference.current == document.activeElement);
                if (!userIsAlreadyInSearchBar) {
                    e.preventDefault();
                    inputReference.current?.focus();
                }
            }
        }
        window.addEventListener("keydown", listenForCtrlF);
        return () => window.removeEventListener("keydown", listenForCtrlF);
    }, [inputReference.current]);

    const matchMessage = props.nMatches > 0 ? `${props.searchParams.searchSelectionIdx + 1} / ${props.nMatches} matches` : "No matches"

    return <div className="search-bar">
        <input ref={inputReference}
            placeholder={"🔍 Search"}
            value={props.searchParams.searchText}
            onChange={(evt) => props.setSearchParams({ searchText: evt.target.value, searchSelectionIdx: 0 })}
            onKeyDown={(evt) => {
                if (evt.key == "ArrowUp") {
                    props.setSearchParams(searchParams => ({ ...searchParams, searchSelectionIdx: searchParams.searchSelectionIdx - 1 }))
                    window.setTimeout(props.scrollToCurrentItem,1);
                } else if (evt.key == "ArrowDown") {
                    props.setSearchParams(searchParams => ({ ...searchParams, searchSelectionIdx: searchParams.searchSelectionIdx + 1 }));
                    window.setTimeout(props.scrollToCurrentItem,1);
                } else if (evt.key == "Enter") {
                    props.focusOnCurrentItem();
                }else{
                    // Search query was changed
                    window.setTimeout(props.scrollToCurrentItem,1);
                }
            }}
            style={{ flex: "1 0 auto", padding: "2px" }}></input>
        {props.searchParams.searchText.length > 0 ?
            <span>{matchMessage}</span> :
            null
        }
    </div>
}

export type HighlightStates = "SEARCH_UNCOLLAPSE" | "SEARCH_MATCH" | "SEARCH_SELECTED"

export const searchTransform = (rootNode: ItemTreeNode,
    searchParams: SearchParams,
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>
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
        }else if (searchParams.searchSelectionIdx > searchMatchArray.length - 1) {
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
