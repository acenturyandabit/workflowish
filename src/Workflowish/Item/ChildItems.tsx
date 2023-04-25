import * as React from "react";
import { ItemTreeNode } from "~Workflowish/mvc/model";
import Item, { FocusActions, ItemStyleParams } from ".";
import { ControllerActions, makeListActions, TreeNodeArrayGetSetter } from "../mvc/controller"
import { FocusedActionReceiver } from "~Workflowish/mvc/focusedActionReceiver";

export const ChildItems = (props: {
    shouldUncollapse: boolean,
    item: ItemTreeNode,
    styleParams: ItemStyleParams,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>,
    setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>,
    actions: ControllerActions,
    parentFocusActions: ReturnType<typeof makeParentFocusActions>,
    pushRefGlobal: (ref: FocusActions, id: string) => void
}) => {
    let childrenToRender: ItemTreeNode[] = props.item.symlinkedNode ?
        props.item.symlinkedNode.children :
        props.item.children;
    if (props.item.id == props.styleParams.symlinkedParent){
        childrenToRender = [{
            data: "Infinite loop...",
            lastModifiedUnixMillis: 0,
            id: "",
            children:[],
            collapsed: true,
            searchHighlight: []
        }]
    }

    let getSetSiblingArray = (t: TreeNodeArrayGetSetter) => {
        props.actions.getSetSelf((item) => ({
            ...item,
            children: t(item.children)
        }))
    };
    if (props.item.symlinkedNode){
        const symlinkedNode = props.item.symlinkedNode;
        getSetSiblingArray = (t: TreeNodeArrayGetSetter) => {
            props.actions.getSetItems([symlinkedNode.id], (items) => items.map(item => ({
                ...item,
                lastModifiedUnixMillis: Date.now(),
                children: t(item.children)
            })))
        };
    }


    return <>
        {props.shouldUncollapse ?
            <div style={{
                paddingLeft: "5px",
                borderLeft: "1px solid white",
                marginLeft: "0.5em"
            }}>
                {childrenToRender.map((item, ii) => (<Item
                    key={ii}
                    item={item}
                    styleParams={{
                        showId: props.styleParams.showId,
                        symlinkedParent: props.item.symlinkedNode ? props.item.id : props.styleParams.symlinkedParent
                    }}
                    pushRef={(ref: FocusActions) => props.itemsRefArray.current[ii] = ref}
                    pushRefGlobal={props.pushRefGlobal}
                    setFocusedActionReceiver={props.setFocusedActionReceiver}
                    actions={makeListActions({
                        siblingsFocusActions: props.itemsRefArray,
                        currentSiblingIdx: ii,
                        getSetSiblingArray,
                        unindentCaller: () => {
                            props.actions.unindentGrandchild(ii);
                        },
                        parentFocusActions: props.parentFocusActions,
                        getSetItems: props.actions.getSetItems,
                        thisItem: props.item,
                        focusItem: props.actions.focusItem
                    })}
                ></Item>))}
            </div > : null
        }
    </>
};

export const makeParentFocusActions = (
    focusThis: () => void,
    scrollThisIntoView: ()=> void,
    shouldUncollapse: boolean,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>,
    thisContentEditable: React.MutableRefObject<HTMLElement | null>,
    actions: ControllerActions
): FocusActions => ({
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
    scrollThisIntoView,
    focusMyNextSibling: actions.focusMyNextSibling,
    focusRecentlyIndentedItem: () => {
        setTimeout(() => {
            itemsRefArray.current?.[itemsRefArray.current.length - 1]?.focusThis();
        })
    }
});