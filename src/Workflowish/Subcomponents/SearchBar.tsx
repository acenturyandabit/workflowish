import * as React from 'react';
import { ItemTreeNode } from '../mvc/model';
import { ModelContext } from '~Workflowish/mvc/context';

export default (props: {
    children: React.ReactElement
}) => {
    const [searchText, setSearchText] = React.useState<string>("");
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);
    const { rootNode, nMatches } = searchTransform(itemTree, searchText);
    return <>
        <SearchBar searchText={searchText} setSearchText={setSearchText} nMatches={nMatches}></SearchBar>
        <ModelContext.Provider value={rootNode}>
            {props.children}
        </ModelContext.Provider>
    </>
}

const SearchBar = (props: {
    searchText: string,
    setSearchText: React.Dispatch<React.SetStateAction<string>>,
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

    const matchMessage = props.nMatches > 0 ? `Found ${props.nMatches} matches` : "No matches"

    return <div style={{ display: "flex", padding: "10px 10px 0 10px" }}>
        <input ref={inputReference}
            placeholder={"🔍 Search"}
            value={props.searchText}
            onChange={(evt) => props.setSearchText(evt.target.value)}
            style={{ flex: "1 0 auto", padding: "2px" }}></input>
        {props.searchText.length > 0 ?
            <span>{matchMessage}</span> :
            null
        }
    </div>
}

export type HighlightStates = "SEARCH_UNCOLLAPSE" | "SEARCH_TARGET"

export const searchTransform = (rootNode: ItemTreeNode, searchText: string): {
    rootNode: ItemTreeNode,
    nMatches: number
} => {
    // TODO: room for optimization here to omit the DFS if there is no search text, but be careful!
    const nodeStack: Array<ItemTreeNode> = [rootNode];
    type SeenState = "FIRST_PASS" | "SECOND_PASS"
    const dfsSeenList: Record<string, SeenState> = { [rootNode.id]: "FIRST_PASS" };
    rootNode.searchHighlight = [];
    let nMatches = 0;
    while (nodeStack.length) {
        const top: ItemTreeNode = nodeStack.pop() as ItemTreeNode;
        if (dfsSeenList[top.id] == "FIRST_PASS") {
            dfsSeenList[top.id] = "SECOND_PASS";
            nodeStack.push(top);
            // Emit all my children to the stack
            top.children.forEach(child => {
                dfsSeenList[child.id] = "FIRST_PASS"
                child.searchHighlight = [];
            });
            nodeStack.push(...top.children);
        } else if (dfsSeenList[top.id] == "SECOND_PASS") {
            if (searchText.length > 0 && top.data.toLowerCase().includes(searchText.toLowerCase())) {
                top.searchHighlight.push("SEARCH_TARGET");
                nMatches++;
            }
            const shouldUncollapse = top.children.reduce((shouldUncollapse, child) => shouldUncollapse
                || child.searchHighlight.includes("SEARCH_UNCOLLAPSE")
                || child.searchHighlight.includes("SEARCH_TARGET"),
                false);
            if (shouldUncollapse) {
                top.searchHighlight.push("SEARCH_UNCOLLAPSE");
            }
        }
    }
    return {
        rootNode: { ...rootNode },
        nMatches
    };
}
