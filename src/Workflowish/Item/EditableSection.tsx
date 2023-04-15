
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import sanitizeHtml from "sanitize-html"
import * as React from "react";
import { ItemTreeNode } from "../mvc/model";
import { ITEM_CONTEXT_MENU_ID } from "../Subcomponents/ContextMenu";
import { ControllerActions } from '~Workflowish/mvc/controller';
import { ItemStyleParams } from '.';
import { FocusedActionReceiver } from '~Workflowish/mvc/focusedActionReceiver';
import { useContextMenu } from 'react-contexify';
import { BulletPoint } from './BulletPoint';


export const EditableSection = (props: {
    item: ItemTreeNode,
    _ref: React.MutableRefObject<HTMLElement | null>,
    shouldUncollapse: boolean,
    actions: ControllerActions,
    styleParams: ItemStyleParams,
    focusedActionReceiver: FocusedActionReceiver,
    onFocusClick: () => void
}) => {
    const onKeyDown = (evt: React.KeyboardEvent) => {
        props.focusedActionReceiver.keyCommand(evt);
    }

    const sanitizeConf = {
        allowedTags: ["b", "i", "a", "p"],
        allowedAttributes: { a: ["href"] }
    };
    const onContentChange = (evt: ContentEditableEvent) => {
        props.actions.getSetSelf(oldSelf => ({
            // this needs to be a getsetter as the useEffect is run only once, and so 
            // the self item at construction time is outdated
            ...oldSelf,
            lastModifiedUnixMillis: Date.now(),
            data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
        }))
    } // Not sure why we used to use useCallback... --> delete this comment next revision

    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            props._ref.current = contenteditableElement;
        }
        , []);

    let symlinkElement: React.ReactElement | null = null;
    if (props.item.symlinkedNode) {
        const symlinkedNode = props.item.symlinkedNode;
        const onSymlinkContenteditableChange = (evt: ContentEditableEvent) => {
            const sanitizeConf = {
                allowedTags: ["b", "i", "a", "p"],
                allowedAttributes: { a: ["href"] }
            };
            props.actions.getSetItems([symlinkedNode.id], oldSelfs => oldSelfs.map(oldSelf=>({
                // this needs to be a getsetter as the useEffect is run only once, and so 
                // the self item at construction time is outdated
                ...oldSelf,
                lastModifiedUnixMillis: Date.now(),
                data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
            })));
        };
        symlinkElement = <>
            &nbsp;
            <ContentEditable
                onKeyDown={onKeyDown}
                html={props.item.symlinkedNode.data}
                onChange={onSymlinkContenteditableChange}
                style={{ flex: "1 1 auto" }}
            ></ContentEditable>
        </>;
    }

    return <span style={{ background: props.item.searchHighlight == "SEARCH_TARGET" ? "blue" : "" }}
        onContextMenu={contextEventHandler(props.actions)}>
        <BulletPoint
            item={props.item}
            actions={props.actions}
            styleParams={props.styleParams}
            shouldUncollapse={props.shouldUncollapse}
        ></BulletPoint>
        {/* The contentEditable needs to persist regardless of whether it is a symlink in order for focus to work correctly */}
        <ContentEditable
            innerRef={memoizedInnerRef}
            html={props.item.data}
            onChange={onContentChange}
            onKeyDown={onKeyDown}
            onClick={props.onFocusClick}
            style={props.item.symlinkedNode ? { flex: "0 0 auto" } : { flex: "1 1 auto" }}
        ></ContentEditable>
        {symlinkElement}
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
