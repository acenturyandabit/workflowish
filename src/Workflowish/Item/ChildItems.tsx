import * as React from "react";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";
import Item, { FocusActions, ItemRef, ItemStyleParams } from ".";
import { ControllerActions, makeItemActions } from "../mvc/controller"
import { FocusedActionReceiver } from "~Workflowish/mvc/focusedActionReceiver";
import { TreePath, DFSFocusManager } from "~Workflowish/mvc/DFSFocus";

export const ChildItems = (props: {
    shouldUncollapse: boolean,
    item: ItemTreeNode,
    treePath: TreePath,
    focusManager: DFSFocusManager,
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
                {childrenToRender.map((item, childIdx) => (<Item
                    key={childIdx}
                    item={item}
                    styleParams={{
                        showId: props.styleParams.showId,
                        symlinkedParent: props.item.symlinkedNode ? props.item.id : props.styleParams.symlinkedParent
                    }}
                    setThisAsFocused={props.setThisAsFocused}
                    actions={makeItemActions({
                        thisItem: item,
                        treePath: props.focusManager.childPath(props.treePath, childIdx),
                        focusManager: props.focusManager,
                        model: props.model
                    })}
                    treePath={props.focusManager.childPath(props.treePath, childIdx)}
                    focusManager={props.focusManager}
                    model={props.model}
                    pushRef={props.pushRef}
                ></Item>))}
            </div > : null
        }
    </>
};