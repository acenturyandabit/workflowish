import * as React from 'react';
import { ItemTreeNode } from '../mvc/model';
import { useRef, useEffect } from "react";

export default (props: {
    focusRef: string; // focus ref as props
    searchText: string,
    setSearchText: React.Dispatch<React.SetStateAction<string>>
}) => {
    const inputReference = useRef(null);
      useEffect(() => {
        inputReference.current.focus();
      }, [props.focusRef]);
    return <div style={{ display: "flex", padding: "10px 10px 0 10px" }}>
        <input ref={inputReference} /* focus ref to change the focus */ placeholder={"🔍 Search"} value={props.searchText} onChange={(evt) => props.setSearchText(evt.target.value)} style={{ flex: "1 0 auto", padding: "2px" }}></input>
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
                    const shouldUncollapse = top.children.reduce((shouldUncollapse, child) => shouldUncollapse
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
