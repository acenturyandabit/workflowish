
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import sanitizeHtml from "sanitize-html"
import * as React from "react";
import { ItemTreeNode } from "../mvc/model";
import { ITEM_CONTEXT_MENU_ID } from "../Subcomponents/ContextMenu";
import { ControllerActions } from '~Workflowish/mvc/controller';
import { ItemStyleParams } from '.';
import { FocusedActionReceiver } from '~Workflowish/mvc/focusedActionReceiver';
import { TriggerEvent, useContextMenu } from 'react-contexify';
import { BulletPoint } from './BulletPoint';

const linkSymbol = "🔗:";

export const EditableSection = (props: {
    item: ItemTreeNode,
    _ref: React.MutableRefObject<HTMLElement | null>,
    shouldUncollapse: boolean,
    actions: ControllerActions,
    styleParams: ItemStyleParams,
    focusedActionReceiver: FocusedActionReceiver,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    onFocusClick: () => void
}) => {
    const onKeyDown = (evt: React.KeyboardEvent) => {
        props.focusedActionReceiver.keyCommand(evt,evt);
    }

    const sanitizeConf = {
        allowedTags: ["b", "i", "a", "p"],
        allowedAttributes: { a: ["href"] }
    };
    const onContentChange = (evt: ContentEditableEvent) => {
        const itemsToFetch = [props.item.id];
        if (props.item.symlinkedNode) {
            itemsToFetch.push(props.item.symlinkedNode.id);
        }
        props.actions.getSetItems(itemsToFetch, (items: ItemTreeNode[]) => {
            const currentItem = Object.assign({},items[0]);
            const newData: string = sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf);
            const returnNodes: ItemTreeNode[] = [];
            if (currentItem.symlinkedNode) {
                const isStillALink = newData.startsWith(linkSymbol);
                if (isStillALink) {
                    const symlinkedItem = Object.assign({},items[1]);
                    symlinkedItem.data = newData.slice(linkSymbol.length);
                    returnNodes.push(symlinkedItem);
                } else {
                    currentItem.data=`[LN: ${currentItem.symlinkedNode.id}`;
                    returnNodes.push(currentItem);
                }
            }else{
                currentItem.data = newData;
                returnNodes.push(currentItem);
            }
            returnNodes.forEach(i=>i.lastModifiedUnixMillis=Date.now());
            return returnNodes;
        })
    } // Not sure why we used to use useCallback... --> delete this comment next revision

    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            props._ref.current = contenteditableElement;
        }
        , []);

    let htmlToShow = props.item.data;
    if (props.item.symlinkedNode) {
        htmlToShow = linkSymbol + props.item.symlinkedNode.data;
    }

    return <span style={{ background: props.item.searchHighlight == "SEARCH_TARGET" ? "blue" : "" }}
        onContextMenu={contextEventHandler(props.actions)}>
        <BulletPoint
            item={props.item}
            actions={props.actions}
            styleParams={props.styleParams}
            raiseContextCopyIdEvent={props.raiseContextCopyIdEvent}
            shouldUncollapse={props.shouldUncollapse}
        ></BulletPoint>
        {/* The contentEditable needs to persist regardless of whether it is a symlink in order for focus to work correctly */}
        <ContentEditable
            innerRef={memoizedInnerRef}
            html={htmlToShow}
            onChange={onContentChange}
            onKeyDown={onKeyDown}
            onClick={props.onFocusClick}
            style={{ flex: "1 1 auto" }}
        ></ContentEditable>
    </span>
}


const contextEventHandler = (actions: ControllerActions): React.MouseEventHandler<HTMLDivElement> => {
    const { show } = useContextMenu({
        id: ITEM_CONTEXT_MENU_ID,
    });
    return (event) => {
        event.preventDefault = () => {
            // prevent default context menu from being hidden
        }
        actions.getSetSiblingArray((siblings: ItemTreeNode[]) => {
            show({ event, props: siblings })
            return siblings;
        })
    }
}
