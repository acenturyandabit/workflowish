import * as React from "react";
import { FocusActions } from "../Item";
import { ItemTreeNode, makeNewItem } from "./model";

export type TreeNodeGetSetter = (oldValue: ItemTreeNode) => ItemTreeNode;
export type TreeNodesGetSetter = (oldValue: ItemTreeNode[]) => ItemTreeNode[];
export type TreeNodeArrayGetSetter = (oldValue: ItemTreeNode[]) => ItemTreeNode[];

export type ControllerActions = {
    getSetSelf: (getSetter: TreeNodeGetSetter) => void,
    createNewItem: () => void,
    deleteThisItem: () => void
    focusMyPrevSibling: () => void
    focusMyNextSibling: () => void
    focusItem: (id: string) => void,
    putBeforePrev: () => void
    putAfterNext: () => void
    indentSelf: () => void,
    unindentSelf: () => void,
    unindentGrandchild: (grandChildIdx: number) => void,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void,
    getSetItems: (keys: string[], getSetter: TreeNodesGetSetter) => void
}

export const makeListActions = (props: {
    currentSiblingIdx: number,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void,
    siblingsFocusActions: React.RefObject<(FocusActions | null)[]>,
    unindentCaller: () => void,
    parentFocusActions: FocusActions
    disableDelete?: () => boolean,
    getSetItems: (keys: string[], getSetter: TreeNodesGetSetter) => void,
    thisItem: ItemTreeNode,
    focusItem: (id: string) => void
}): ControllerActions => ({
    createNewItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx + 1, 0, makeNewItem());
            // New items won't be created yet, so delay the setfocus
            setTimeout(() => props.siblingsFocusActions.current?.[props.currentSiblingIdx + 1]?.focusThis(),1);
            return newSiblingArray;
        })
    },
    deleteThisItem: () => {
        if (!props.disableDelete || props.disableDelete() == false) {
            props.getSetSiblingArray((siblingArray) => {
                if (siblingArray.length > 0) {
                    const newSiblingArray = [...siblingArray];
                    newSiblingArray[props.currentSiblingIdx].markedForCleanup = true;
                    if (props.currentSiblingIdx - 1 >= 0) {
                        props.siblingsFocusActions.current?.[props.currentSiblingIdx - 1]?.focusThisEnd()
                    } else {
                        props.parentFocusActions.focusThisEnd();
                    }
                    return newSiblingArray;
                } else {
                    return siblingArray
                }
            })
        }
    },
    focusMyNextSibling: () => {
        const siblingItemsRef = props.siblingsFocusActions.current;
        if (siblingItemsRef) {
            if (props.currentSiblingIdx >= siblingItemsRef.length - 1) {
                props.parentFocusActions.focusMyNextSibling()
            } else {
                siblingItemsRef[props.currentSiblingIdx + 1]?.triggerFocusFromAbove()
            }
        }
    },
    focusMyPrevSibling: () => {
        const siblingItemsRef = props.siblingsFocusActions.current;
        if (siblingItemsRef) {
            if (props.currentSiblingIdx <= 0) {
                props.parentFocusActions.focusThis()
            } else {
                siblingItemsRef[props.currentSiblingIdx - 1]?.triggerFocusFromBelow()
            }
        }
    },
    focusItem: props.focusItem,
    putBeforePrev: () => {
        if (props.currentSiblingIdx > 0) {
            props.getSetSiblingArray((siblingArray) => {
                const newSiblingArray = [...siblingArray];
                const [thisItem] = newSiblingArray.splice(props.currentSiblingIdx, 1);
                newSiblingArray.splice(props.currentSiblingIdx - 1, 0, thisItem);
                props.siblingsFocusActions.current?.[props.currentSiblingIdx - 1]?.focusThis();
                return newSiblingArray;
            })
        }
    },
    putAfterNext: () => {
        props.getSetSiblingArray((siblingArray) => {
            if (props.currentSiblingIdx < siblingArray.length - 1) {
                const newSiblingArray = [...siblingArray];
                const [thisItem] = newSiblingArray.splice(props.currentSiblingIdx, 1);
                newSiblingArray.splice(props.currentSiblingIdx + 1, 0, thisItem);
                // Changing the list does not change the item refs; so focus on the next item
                props.siblingsFocusActions.current?.[props.currentSiblingIdx + 1]?.focusThis();
                return newSiblingArray;
            } else {
                return siblingArray
            }
        })
    },
    indentSelf: () => {
        if (props.currentSiblingIdx > 0) {
            props.getSetItems([props.thisItem.id], ([thisItem]) => {
                const changedItems = [thisItem];
                let oldSiblingArray: ItemTreeNode[];
                if (thisItem.symlinkedNode) {
                    oldSiblingArray = thisItem.symlinkedNode.children;
                    thisItem.symlinkedNode.lastModifiedUnixMillis = Date.now();
                    changedItems.push(thisItem.symlinkedNode);
                } else {
                    oldSiblingArray = thisItem.children;
                    thisItem.lastModifiedUnixMillis = Date.now();
                }
                const newSiblingArray = [...oldSiblingArray];
                const child = newSiblingArray[props.currentSiblingIdx];
                let newParentSibling = newSiblingArray[props.currentSiblingIdx - 1];
                if (newParentSibling.symlinkedNode) {
                    newParentSibling = newParentSibling.symlinkedNode;
                }
                changedItems.push(newParentSibling);
                newParentSibling.lastModifiedUnixMillis = Date.now();
                newParentSibling.children.push(child);

                oldSiblingArray.splice(props.currentSiblingIdx, 1);

                props.siblingsFocusActions.current?.[props.currentSiblingIdx - 1]?.focusRecentlyIndentedItem();
                return changedItems;
            })
        }
    },
    unindentSelf: props.unindentCaller,
    unindentGrandchild: (grandChildIdx: number) => {
        props.getSetItems([props.thisItem.id], ([thisItem]) => {
            const changedItems = [thisItem];
            let oldSiblingArray: ItemTreeNode[];
            if (thisItem.symlinkedNode) {
                oldSiblingArray = thisItem.symlinkedNode.children;
                thisItem.symlinkedNode.lastModifiedUnixMillis = Date.now();
                changedItems.push(thisItem.symlinkedNode);
            } else {
                oldSiblingArray = thisItem.children;
                thisItem.lastModifiedUnixMillis = Date.now();
            }
            const newSiblingArray = [...oldSiblingArray];
            let child = newSiblingArray[props.currentSiblingIdx];
            if (child.symlinkedNode) {
                child = child.symlinkedNode;
            }
            changedItems.push(child);
            const [grandChild] = child.children.splice(grandChildIdx, 1);
            child.lastModifiedUnixMillis = Date.now();

            oldSiblingArray.splice(props.currentSiblingIdx + 1, 0, grandChild);
            setTimeout(() => {
                props.siblingsFocusActions.current?.[props.currentSiblingIdx + 1]?.focusThis();
            })
            return changedItems;
        })
    },
    getSetSelf: (getSetter: TreeNodeGetSetter) => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            const newItemWithoutTimeUpdate = getSetter(newSiblingArray[props.currentSiblingIdx]);
            newSiblingArray[props.currentSiblingIdx] = {
                ...newItemWithoutTimeUpdate,
                lastModifiedUnixMillis: Date.now()
            }
            return newSiblingArray;
        })
    },
    getSetItems: props.getSetItems,
    getSetSiblingArray: props.getSetSiblingArray
    // Todo: Do not expose the getSetSiblingArray - this encourages breaking separation of concerns
});
