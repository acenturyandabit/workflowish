import * as React from "react";
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";
import Item, { FocusActions, ItemRef, ItemStyleParams } from ".";
import { ControllerActions, makeItemActions } from "../mvc/controller"
import { FocusedActionReceiver } from "~Workflowish/mvc/focusedActionReceiver";
import { TreePath, DFSFocusManager, FocusRequest } from "~Workflowish/mvc/DFSFocus";

export const ChildItems = (props: {
    shouldUncollapse: boolean,
    item: ItemTreeNode,
    treePath: TreePath,
    focusManager: React.RefObject<DFSFocusManager>,
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
    if (props.styleParams.symlinkedParents.indexOf(props.item.id) != -1) {
        childrenToRender = [{
            data: "Infinite loop...",
            lastModifiedUnixMillis: 0,
            id: "",
            children: [],
            collapsed: true,
            searchHighlight: []
        }]
    }

    const itemToFocus = React.useRef<FocusRequest | undefined>();
    React.useEffect(() => {
        if (itemToFocus.current) {
            props.focusManager.current?.focusItem(itemToFocus.current);
            itemToFocus.current = undefined;
        }
    })


    return <>
        {props.shouldUncollapse ?
            <div style={{
                paddingLeft: "5px",
                borderLeft: "1px solid white",
                marginLeft: "0.5em"
            }}>
                {childrenToRender.map((item, childIdx) => {
                    const treePath = props.focusManager.current?.childPath(props.treePath, childIdx) || [];
                    return <Item
                        key={childIdx}
                        item={item}
                        styleParams={{
                            showId: props.styleParams.showId,
                            symlinkedParents: props.item.symlinkedNode ? [...props.styleParams.symlinkedParents, props.item.id] : props.styleParams.symlinkedParents
                        }}
                        setThisAsFocused={props.setThisAsFocused}
                        actions={makeItemActions({
                            thisItem: item,
                            thisPossiblySymlinkedParent: props.item,
                            treePath,
                            focusManager: props.focusManager,
                            setToFocusAfterUpdate: (focusRequest: FocusRequest) => { itemToFocus.current = focusRequest },
                            model: props.model
                        })}
                        treePath={treePath}
                        focusManager={props.focusManager}
                        model={props.model}
                        pushRef={props.pushRef}
                    ></Item>
                })}
            </div > : null
        }
    </>
};