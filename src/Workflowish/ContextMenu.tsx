import * as React from 'react';
import { Menu, Item } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import './ContextMenu.css'
import { ItemTreeNode } from './model';

export default (props: {
    menuId: string
}) => {
    return <Menu id={props.menuId} animation={""}>
        <Item id="exportToList" onClick={exportToList}>Copy with siblings and children</Item>
    </Menu>
}
export const CONTEXT_MENU_ID = "workflowish_ctx_menu"


interface ItemParams {
    id?: string,
    props?: ItemTreeNode[],
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | KeyboardEvent;
}

const exportToList = (args: ItemParams) => {
    const itemAndSiblingAsMarkdown = (args.props?.map((i: ItemTreeNode) => toBullets(i)) || []).join("\n");
    navigator.clipboard.writeText(itemAndSiblingAsMarkdown).then(() => console.log("yay"), console.log);
}

const toBullets = (rootNode: ItemTreeNode): string => {
    const outputLines: Array<{ data: string, indent: number }> = [];
    type ItemDepthPair = [ItemTreeNode, number]
    const nodeStack: Array<ItemDepthPair> = [[rootNode, 0]];
    while (nodeStack.length) {
        const top: ItemDepthPair = nodeStack.pop() as ItemDepthPair;
        nodeStack.push(...(
            top[0].children.map(i => [i, top[1] + 1] as ItemDepthPair)
        ));
        outputLines.push({ data: top[0].data, indent: top[1] })
    }
    return outputLines
        .map((itm: { data: string, indent: number }) => {
            return "  ".repeat(itm.indent) + "- " + itm.data;
        }).join("\n")
}