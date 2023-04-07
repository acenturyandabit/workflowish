
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import sanitizeHtml from "sanitize-html"
import * as React from "react";
import { ItemTreeNode } from "../mvc";
import { ITEM_CONTEXT_MENU_ID, SIDECLIP_CONTEXT_MENU_ID } from "../Subcomponents/ContextMenu";
import { ControllerActions } from '~Workflowish/mvc/controller';
import { ItemStyleParams } from '.';
import { FocusedActionReceiver } from '~Workflowish/mvc/focusedActionReceiver';
import { useContextMenu } from 'react-contexify';


export const EditableSection = (props: {
    item: ItemTreeNode,
    _ref: React.MutableRefObject<HTMLElement | null>,
    shouldUncollapse: boolean,
    parentActions: ControllerActions,
    styleParams: ItemStyleParams,
    focusedActionReceiver: FocusedActionReceiver,
    onFocusClick: ()=>void
}) => {
    const onKeyDown = (evt: React.KeyboardEvent) => {
        // TODO: inline this method
        props.focusedActionReceiver.keyCommand(evt);
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


    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            props._ref.current = contenteditableElement;
        }
        , []);


    const bulletPoint = <span style={{
        paddingLeft: props.item.children.length ? "0px" : "0.2em",
        color: props.item.searchHighlight == "SEARCH_UNCOLLAPSE" ? "orange" : "white"
    }}
        onClick={() => props.parentActions.getSetSelf((self: ItemTreeNode) => ({
            ...self,
            collapsed: !self.collapsed
        }))}
    >{(() => {
        let bullet = "\u25CF";
        if (props.styleParams.emptyList) bullet = ">";
        else if (props.item.children.length) {
            if (props.shouldUncollapse) bullet = "\u25bc";
            else bullet = "\u25b6";
        }
        return bullet;
    })()}
        {props.styleParams.showId ?
            <span style={{
                fontSize: "10px", cursor: "pointer"
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


    return <span style={{ background: props.item.searchHighlight == "SEARCH_TARGET" ? "blue" : "" }}
        onContextMenu={contextEventHandler(props.parentActions)}>
        {bulletPoint}<ContentEditable
            innerRef={memoizedInnerRef}
            html={props.item.data}
            onChange={onContentChange}
            onKeyDown={onKeyDown}
            onClick={props.onFocusClick}
            style={{ flex: "1 1 auto" }}
        ></ContentEditable>
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
