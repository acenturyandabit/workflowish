import * as React from 'react';
import { ItemTreeNode } from './model';

export default (props: {
    searchText: string,
    setSearchText: React.Dispatch<React.SetStateAction<string>>
}) => {
    return <div style={{ display: "flex", padding: "10px 10px 0 10px" }}>
        <input placeholder={"🔍 Search"} value={props.searchText} onChange={(evt) => props.setSearchText(evt.target.value)} style={{ flex: "1 0 auto", padding: "2px" }}></input>
    </div>
}

export type SearchOptions = "NONE" | "SEARCH_UNCOLLAPSE" | "SEARCH_TARGET" | "DFS_PENDING" | "DFS_2ND_PASS"

export const searchTransform = (rootNode: ItemTreeNode, searchText: string): ItemTreeNode => {
    if (searchText.length > 0) {
        const nodeStack: Array<ItemTreeNode> = [rootNode];
        rootNode.searchHighlight = "DFS_PENDING";
        while (nodeStack.length) {
            const top: ItemTreeNode = nodeStack.pop() as ItemTreeNode;
            if (top.searchHighlight == "DFS_PENDING") {
                top.searchHighlight = "DFS_2ND_PASS";
                nodeStack.push(top);
                // Emit all my children to the stack
                top.children.forEach(child => child.searchHighlight = "DFS_PENDING");
                nodeStack.push(...top.children);
            } else if (top.searchHighlight == "DFS_2ND_PASS") {
                if (top.data.toLowerCase().includes(searchText.toLowerCase())) {
                    top.searchHighlight = "SEARCH_TARGET";
                } else {
                    const shouldUncollapse = top.children.reduce((should_uncollapse, child) => should_uncollapse
                        || child.searchHighlight == "SEARCH_UNCOLLAPSE"
                        || child.searchHighlight == "SEARCH_TARGET",
                        false);
                    if (shouldUncollapse) {
                        top.searchHighlight = "SEARCH_UNCOLLAPSE"
                    } else {
                        top.searchHighlight = "NONE"
                    }
                }
            }
        }
    }
    return rootNode;
}