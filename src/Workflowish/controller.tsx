import * as React from "react";
import { FocusActions } from "./Item";
import { ItemTreeNode, makeNewItem } from "./model";

type TreeNodeGetSetter = (oldValue: ItemTreeNode) => ItemTreeNode;
export type TreeNodeArrayGetSetter = (oldValue: ItemTreeNode[]) => ItemTreeNode[];

export type ControllerActions = {
    getSetSelf: (getSetter: TreeNodeGetSetter) => void,
    createNewItem: () => void,
    deleteThisItem: () => void
    focusMyPrevSibling: () => void
    focusMyNextSibling: () => void
    putBeforePrev: () => void
    putAfterNext: () => void
    indentSelf: () => void,
    unindentSelf: () => void,
    unindentGrandchild: (grandChildIdx: number) => void,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void
}

export const makeListActions = (props: {
    currentSiblingIdx: number,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void,
    siblingsFocusActions: React.RefObject<(FocusActions | null)[]>,
    unindentCaller: () => void,
    parentFocusActions: FocusActions
}): ControllerActions => ({
    createNewItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx + 1, 0, makeNewItem());
            // New items won't be created yet, so delay the setfocus
            setTimeout(() => props.siblingsFocusActions.current?.[props.currentSiblingIdx + 1]?.focusThis());
            return newSiblingArray;
        })
    },
    deleteThisItem: () => {
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
        props.getSetSiblingArray((siblingArray) => {
            if (props.currentSiblingIdx > 0) {
                const newSiblingArray = [...siblingArray];
                const [thisItem] = newSiblingArray.splice(props.currentSiblingIdx, 1);
                newSiblingArray[props.currentSiblingIdx - 1].children.push(thisItem);
                newSiblingArray[props.currentSiblingIdx - 1].lastModifiedUnixMillis = Date.now()
                newSiblingArray[props.currentSiblingIdx - 1].collapsed = false
                props.siblingsFocusActions.current?.[props.currentSiblingIdx - 1]?.focusRecentlyIndentedItem();
                return newSiblingArray;
            } else {
                return siblingArray;
            }
        })
    },
    unindentSelf: props.unindentCaller,
    unindentGrandchild: (grandChildIdx: number) => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];

            const child = newSiblingArray[props.currentSiblingIdx].children[grandChildIdx];
            newSiblingArray[props.currentSiblingIdx].children.splice(grandChildIdx, 1);
            newSiblingArray[props.currentSiblingIdx].lastModifiedUnixMillis = Date.now();

            newSiblingArray.splice(props.currentSiblingIdx, 0, child);
            child.lastModifiedUnixMillis = Date.now();

            props.siblingsFocusActions.current?.[props.currentSiblingIdx]?.focusThis();
            return newSiblingArray;
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
    getSetSiblingArray: props.getSetSiblingArray
});