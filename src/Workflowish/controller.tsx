import * as React from "react";
import { ItemRef } from "./Item";
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
    unindentChild: (child: ItemTreeNode) => void
}

export const makeListActions = (props: {
    currentSiblingIdx: number,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void,
    siblingItemRefs: React.RefObject<(ItemRef | null)[]>,
    unindentCaller: () => void,
    thisActions: ItemRef
}): ControllerActions => ({
    createNewItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx + 1, 0, makeNewItem());
            // New items won't be created yet, so delay the setfocus
            setTimeout(() => props.siblingItemRefs.current?.[props.currentSiblingIdx + 1]?.focusThis());
            return newSiblingArray;
        })
    },
    deleteThisItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            if (siblingArray.length > 0) {
                const newSiblingArray = [...siblingArray];
                newSiblingArray.splice(props.currentSiblingIdx, 1);
                if (props.currentSiblingIdx - 1 >= 0) {
                    props.siblingItemRefs.current?.[props.currentSiblingIdx - 1]?.focusThisEnd()
                } else {
                    props.thisActions.focusThisEnd();
                }
                return newSiblingArray;
            } else {
                return siblingArray
            }
        })
    },
    focusMyNextSibling: () => {
        const siblingItemsRef = props.siblingItemRefs.current;
        if (siblingItemsRef) {
            if (props.currentSiblingIdx >= siblingItemsRef.length - 1) {
                props.thisActions.focusMyNextSibling()
            } else {
                siblingItemsRef[props.currentSiblingIdx + 1]?.triggerFocusFromAbove()
            }
        }
    },
    focusMyPrevSibling: () => {
        const siblingItemsRef = props.siblingItemRefs.current;
        if (siblingItemsRef) {
            if (props.currentSiblingIdx <= 0) {
                props.thisActions.focusThis()
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
                props.siblingItemRefs.current?.[props.currentSiblingIdx - 1]?.focusThis();
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
                props.siblingItemRefs.current?.[props.currentSiblingIdx + 1]?.focusThis();
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
                props.siblingItemRefs.current?.[props.currentSiblingIdx - 1]?.focusRecentlyIndentedItem();
                return newSiblingArray;
            } else {
                return siblingArray;
            }
        })
    },
    unindentSelf: props.unindentCaller,
    unindentChild: (child: ItemTreeNode) => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx, 0, child);
            props.siblingItemRefs.current?.[props.currentSiblingIdx]?.focusThis();
            return newSiblingArray;
        })
    },
    getSetSelf: (getSetter: TreeNodeGetSetter) => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray[props.currentSiblingIdx] = getSetter(newSiblingArray[props.currentSiblingIdx]);
            return newSiblingArray;
        })
    }
});