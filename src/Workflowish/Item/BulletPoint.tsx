import * as React from 'react';
import { ItemTreeNode } from "~Workflowish/mvc/model";
import { ControllerActions } from "~Workflowish/mvc/controller";
import { ItemStyleParams } from ".";
import { useContextMenu } from 'react-contexify';
import { SIDECLIP_CONTEXT_MENU_ID } from '~Workflowish/Subcomponents/ContextMenu';

export const BulletPoint = (props: {
    item: ItemTreeNode,
    actions: ControllerActions,
    styleParams: ItemStyleParams,
    shouldUncollapse: boolean
}) => {
    let color = "white";
    if (props.item.searchHighlight == "SEARCH_UNCOLLAPSE") color = "orange";
    if (props.item.symlinkedNode || props.styleParams.symlinkedParent) color = "cyan";

    const hasOrSymlinkedToChildren = (props.item.children.length > 0) ||
        (props.item.symlinkedNode && props.item.symlinkedNode.children.length > 0);
    return <span style={{
        paddingLeft: hasOrSymlinkedToChildren ? "0px" : "0.2em",
        userSelect: 'none',
        cursor: "pointer",
        color
    }}
    ><span onClick={() => props.actions.getSetSelf((self: ItemTreeNode) => ({
        ...self,
        collapsed: !self.collapsed
    }))}
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
            <span style={{
                fontSize: "10px"
            }}
                onClick={(event) => {
                    const { show, hideAll } = useContextMenu({
                        id: SIDECLIP_CONTEXT_MENU_ID,
                    });
                    show({ event });
                    setTimeout(hideAll, 400);
                    navigator.clipboard.writeText(props.item.id);

                }}
            >{props.item.id}</span>
            : null}</span >;
}
