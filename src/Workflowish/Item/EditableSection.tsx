
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
    parentActions: ControllerActions,
    styleParams: ItemStyleParams,
    focusedActionReceiver: FocusedActionReceiver,
    onFocusClick: () => void
}) => {
    let onKeyDown = (evt: React.KeyboardEvent) => {
        // TODO: inline this method
        props.focusedActionReceiver.keyCommand(evt);
    }
    if (props.styleParams.symlinkedParent) {
        onKeyDown = (evt: React.KeyboardEvent) => {
            evt.preventDefault();
            if ((evt.key == "ArrowUp" || evt.key == "ArrowDown") &&
                !(evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey)) {
                props.focusedActionReceiver.keyCommand({
                    key: evt.key,
                    altKey: false,
                    ctrlKey: false,
                    shiftKey: false,
                    metaKey: false,
                    preventDefault: () => {
                        // Ignore
                    }
                });
            }
        }
    }

    const onContentChange = React.useCallback((evt: ContentEditableEvent) => {
        const sanitizeConf = {
            allowedTags: ["b", "i", "a", "p"],
            allowedAttributes: { a: ["href"] }
        };
        props.parentActions.getSetSelf(oldSelf => ({
            // this needs to be a getsetter as the useEffect is run only once, and so 
            // the self item at construction time is outdated
            ...oldSelf,
            lastModifiedUnixMillis: Date.now(),
            data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
        }))
    }, [props.parentActions])

    const onContenteditableChange = (props.styleParams.symlinkedParent) ?
        (() => {/* read only*/ })
        : onContentChange;

    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            props._ref.current = contenteditableElement;
        }
        , []);

    const symlinkText = props.item.symlinkedNode ? <>
        &nbsp;
        <span
            onKeyDown={onKeyDown}
            onClick={props.onFocusClick}
            style={{ flex: "1 1 auto" }}
        >{props.item.symlinkedNode.data}</span>
    </> : null;

    return <span style={{ background: props.item.searchHighlight == "SEARCH_TARGET" ? "blue" : "" }}
        onContextMenu={contextEventHandler(props.parentActions)}>
        <BulletPoint
            item={props.item}
            parentActions={props.parentActions}
            styleParams={props.styleParams}
            shouldUncollapse={props.shouldUncollapse}
        ></BulletPoint>
        {/* The contentEditable needs to persist regardless of whether it is a symlink in order for focus to work correctly */}
        <ContentEditable
            innerRef={memoizedInnerRef}
            html={props.item.data}
            onChange={onContenteditableChange}
            onKeyDown={onKeyDown}
            onClick={props.onFocusClick}
            style={props.item.symlinkedNode ? { flex: "0 0 auto" } : { flex: "1 1 auto" }}
        ></ContentEditable>
        {symlinkText}
    </span>
}


const contextEventHandler = (parentActions: ControllerActions): React.MouseEventHandler<HTMLDivElement> => {
    const { show } = useContextMenu({
        id: ITEM_CONTEXT_MENU_ID,
    });
    return (event) => {
        event.preventDefault = () => {
            // prevent default context menu from being hidden
        }
        parentActions.getSetSiblingArray((siblings: ItemTreeNode[]) => {
            show({ event, props: siblings })
            return siblings;
        })
    }
}
