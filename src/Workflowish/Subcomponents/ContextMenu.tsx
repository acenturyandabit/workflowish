import * as React from 'react';
import { Menu, Item } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import './ContextMenu.css'
import { ItemTreeNode, TransformedDataAndSetter } from '../mvc/model';

export const ITEM_CONTEXT_MENU_ID = "workflowish_ctx_menu"
export const SIDECLIP_CONTEXT_MENU_ID = "sideclip_ctx_menu"
export default () => {
    return <>
        <Menu className={ITEM_CONTEXT_MENU_ID} id={ITEM_CONTEXT_MENU_ID} animation={""}>
            <Item id="exportToList" onClick={exportToList}>Copy with siblings and children</Item>
        </Menu>
        <Menu className={SIDECLIP_CONTEXT_MENU_ID} id={SIDECLIP_CONTEXT_MENU_ID} animation={"flip"}>
            <Item>📋</Item>
        </Menu>
    </>
}


interface ItemParams {
    id?: string,
    props?: {
        thisItem: ItemTreeNode,
        model: TransformedDataAndSetter
    },
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | KeyboardEvent;
}

const exportToList = (args: ItemParams) => {
    const argProps = args.props;
    if (argProps) {
        const parentId = argProps.model.transformedData.parentById[argProps.thisItem.id];
        const siblings = argProps.model.transformedData.keyedNodes[parentId].children;
        const itemAndSiblingAsMarkdown = (siblings.map((i: ItemTreeNode) => toBullets(i)) || []).join("\n");
        navigator.clipboard.writeText(itemAndSiblingAsMarkdown).then(() => console.log("yay"), console.log);
    }
}

const toBullets = (rootNode: ItemTreeNode): string => {
    const outputLines: Array<{ data: string, indent: number }> = [];
    type ItemDepthPair = [ItemTreeNode, number]
    const nodeStack: Array<ItemDepthPair> = [[rootNode, 0]];
    while (nodeStack.length) {
        const top: ItemDepthPair = nodeStack.pop() as ItemDepthPair;
        nodeStack.push(...(
            [...top[0].children].reverse().map(i => [i, top[1] + 1] as ItemDepthPair)
        ));
        outputLines.push({ data: top[0].data, indent: top[1] })
    }
    return outputLines
        .map((itm: { data: string, indent: number }) => {
            return "  ".repeat(itm.indent) + "- " + itm.data;
        }).join("\n")
}