import * as React from "react";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";
import Item, { FocusActions, ItemRef, ItemStyleParams } from ".";
import { ControllerActions, makeItemActions } from "../mvc/controller"
import { FocusedActionReceiver } from "~Workflowish/mvc/focusedActionReceiver";

export const ChildItems = (props: {
    shouldUncollapse: boolean,
    item: ItemTreeNode,
    styleParams: ItemStyleParams,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>,
    setThisAsFocused: (focusedActionReceiver: FocusedActionReceiver, focusItemKey: string) => void,
    actions: ControllerActions,
    pushRef: (id: string, ref: ItemRef) => void,
    model: TransformedDataAndSetter
}) => {
    let childrenToRender: ItemTreeNode[] = props.item.symlinkedNode ?
        props.item.symlinkedNode.children :
        props.item.children;
    if (props.item.id == props.styleParams.symlinkedParent) {
        childrenToRender = [{
            data: "Infinite loop...",
            lastModifiedUnixMillis: 0,
            id: "",
            children: [],
            collapsed: true,
            searchHighlight: []
        }]
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
                    setThisAsFocused={props.setThisAsFocused}
                    actions={makeItemActions({
                        thisItem: item,
                        focusItem: props.actions.focusItem,
                        model: props.model
                    })}
                    model={props.model}
                    pushRef={props.pushRef}
                ></Item>))}
            </div > : null
        }
    </>
};