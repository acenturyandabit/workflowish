import * as React from 'react';
import { ItemTreeNode } from "~Workflowish/mvc/model";
import { ControllerActions } from "~Workflowish/mvc/controller";
import { ItemStyleParams } from ".";
import { TriggerEvent } from 'react-contexify';

export const BulletPoint = (props: {
    item: ItemTreeNode,
    actions: ControllerActions,
    styleParams: ItemStyleParams,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    shouldUncollapse: boolean
}) => {
    let color = "white";
    if (props.item.symlinkedNode || props.styleParams.symlinkedParents.length) color = "cyan";

    const hasOrSymlinkedToChildren = (props.item.children.length > 0) ||
        (props.item.symlinkedNode && props.item.symlinkedNode.children.length > 0);
    return <span style={{
        paddingLeft: hasOrSymlinkedToChildren ? "0px" : "0.2em",
        userSelect: 'none',
        cursor: "pointer",
        color
    }}
    ><span onClick={() => props.actions.setSelfCollapsed(!props.item.collapsed)}
    >{(() => {
        let bullet = "\u25CF";
        if (props.styleParams.emptyList) bullet = ">";
        else if (hasOrSymlinkedToChildren) {
            if (props.shouldUncollapse) bullet = "\u25bc";
            else bullet = "\u25b6";
        }
        return bullet;
    })()}</span>
        {props.styleParams.showId ?
            <span style={{ fontSize: "10px" }}
                onClick={props.raiseContextCopyIdEvent}
            >{props.item.id}</span>
            : null}</span >;
}
