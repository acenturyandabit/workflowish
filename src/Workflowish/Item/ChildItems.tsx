import * as React from "react";
import { ItemTreeNode } from "~Workflowish/mvc";
import Item, { FocusActions, ItemStyleParams } from ".";
import { ControllerActions, makeListActions, TreeNodeArrayGetSetter } from "../mvc/controller"
import { FocusedActionReceiver } from "~Workflowish/mvc/focusedActionReceiver";

export const makeParentFocusActions = (
    focusThis: () => void,
    shouldUncollapse: boolean,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>,
    thisContentEditable: React.MutableRefObject<HTMLElement | null>,
    parentActions: ControllerActions
) => ({
    focusThis,
    triggerFocusFromAbove: () => {
        focusThis()
    },
    triggerFocusFromBelow: () => {
        const currentChildItemsRef = itemsRefArray.current;
        if (shouldUncollapse && currentChildItemsRef && currentChildItemsRef.length) {
            currentChildItemsRef[currentChildItemsRef.length - 1]?.triggerFocusFromBelow();
        } else {
            focusThis()
        }
    },
    focusThisEnd: () => {
        const _thisContentEditable = thisContentEditable.current;
        if (_thisContentEditable) {
            const length = _thisContentEditable.innerText.length;
            _thisContentEditable.focus();
            if (_thisContentEditable.lastChild != null) {
                const sel = window.getSelection();
                sel?.collapse(_thisContentEditable.firstChild, length);
            }
        }
    },
    focusMyNextSibling: parentActions.focusMyNextSibling,
    focusRecentlyIndentedItem: () => {
        setTimeout(() => {
            itemsRefArray.current?.[itemsRefArray.current.length - 1]?.focusThis();
        })
    }
});

export const ChildItems = (props: {
    shouldUncollapse: boolean,
    children: ItemTreeNode[],
    styleParams: ItemStyleParams,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>,
    setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>,
    parentActions: ControllerActions,
    parentFocusActions: ReturnType<typeof makeParentFocusActions>
}) => {
    return <>
        {props.shouldUncollapse ?
            <div style={{
                paddingLeft: "5px",
                borderLeft: "1px solid white",
                marginLeft: "0.5em"
            }}>
                {props.children.map((item, ii) => (<Item
                    key={ii}
                    item={item}
                    styleParams={{
                        showId: props.styleParams.showId
                    }}
                    pushRef={(ref: FocusActions) => props.itemsRefArray.current[ii] = ref}
                    setFocusedActionReceiver={props.setFocusedActionReceiver}
                    parentActions={makeListActions({
                        siblingsFocusActions: props.itemsRefArray,
                        currentSiblingIdx: ii,
                        getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                            props.parentActions.getSetSelf((item) => ({
                                ...item,
                                children: t(item.children)
                            }))
                        },
                        unindentCaller: () => {
                            props.parentActions.unindentGrandchild(ii);
                        },
                        parentFocusActions: props.parentFocusActions
                    })}
                ></Item>))}
            </div > : null
        }
    </>
};
