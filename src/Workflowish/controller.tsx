import * as React from "react";
import { ItemTreeNode, makeNewUniqueKey } from "./model";

type TreeNodeGetSetter = (oldValue: ItemTreeNode) => ItemTreeNode;
export type TreeNodeArrayGetSetter = (oldValue: ItemTreeNode[]) => ItemTreeNode[];

export type ControllerActions = {
    getSetSelf: (getSetter: TreeNodeGetSetter) => void,
    createNewItem: () => void,
    deleteThisItem: () => void
    focusPrev: () => void
    focusNext: () => void
    putBeforePrev: () => void
    putAfterNext: () => void
    indentSelf: () => void,
    unindentSelf: () => void,
    unindentChild: (child: ItemTreeNode) => void
}

export const makeListActions = (props: {
    currentSiblingIdx: number,
    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => void,
    siblingItemRefs: React.RefObject<(HTMLElement | null)[]>,
    unindentThis: () => void
}): ControllerActions => ({
    createNewItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx, 0, {
                id: makeNewUniqueKey(),
                data: "",
                children: []
            });
            return newSiblingArray;
        })
    },
    deleteThisItem: () => {
        props.getSetSiblingArray((siblingArray) => {
            if (siblingArray.length > 1) {
                const newSiblingArray = [...siblingArray];
                newSiblingArray.splice(props.currentSiblingIdx, 1);
                return newSiblingArray;
            } else {
                return siblingArray
            }
        })
    },
    focusNext: () => {
        props.siblingItemRefs.current?.[props.currentSiblingIdx + 1]?.focus()
    },
    focusPrev: () => {
        props.siblingItemRefs.current?.[props.currentSiblingIdx - 1]?.focus()
    },
    putBeforePrev: () => {
        if (props.currentSiblingIdx > 0) {
            props.getSetSiblingArray((siblingArray) => {
                const newSiblingArray = [...siblingArray];
                const [thisItem] = newSiblingArray.splice(props.currentSiblingIdx, 1);
                newSiblingArray.splice(props.currentSiblingIdx - 1, 0, thisItem);
                props.siblingItemRefs.current?.[props.currentSiblingIdx - 1]?.focus();
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
                props.siblingItemRefs.current?.[props.currentSiblingIdx + 1]?.focus();
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
                return newSiblingArray;
            } else {
                return siblingArray;
            }
        })
    },
    unindentSelf: props.unindentThis,
    unindentChild: (child: ItemTreeNode) => {
        props.getSetSiblingArray((siblingArray) => {
            const newSiblingArray = [...siblingArray];
            newSiblingArray.splice(props.currentSiblingIdx, 0, child);
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