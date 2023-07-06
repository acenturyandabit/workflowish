
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import sanitizeHtml from "sanitize-html"
import * as React from "react";
import { ItemTreeNode, TransformedDataAndSetter } from "../mvc/model";
import { ITEM_CONTEXT_MENU_ID } from "../Subcomponents/ContextMenu";
import { ControllerActions, linkSymbol } from '~Workflowish/mvc/controller';
import { ItemStyleParams } from '.';
import { FocusedActionReceiver } from '~Workflowish/mvc/focusedActionReceiver';
import { TriggerEvent, useContextMenu } from 'react-contexify';
import { BulletPoint } from './BulletPoint';
import { RenderTimeContext } from '~Workflowish/mvc/context';


export const EditableSection = (props: {
    item: ItemTreeNode,
    model: TransformedDataAndSetter,
    _ref: React.MutableRefObject<HTMLElement | null>,
    shouldUncollapse: boolean,
    actions: ControllerActions,
    styleParams: ItemStyleParams,
    focusedActionReceiver: FocusedActionReceiver,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    onFocusClick: () => void
}) => {

    const sanitizeConf = {
        allowedTags: ["b", "i", "a", "p"],
        allowedAttributes: { a: ["href"] }
    };
    const onContentChange = (evt: ContentEditableEvent) => {
        props.actions.editSelfContents(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf));
    }

    // Must use a callback otherwise setInnerRef invalidates and will cause a re-render, causing caret to jump
    // https://github.com/lovasoa/react-contenteditable/blob/ec221521e0da0d6d96ea32e6b8ed54666957824a/src/react-contenteditable.tsx#L58
    const setInnerRef = React.useCallback((contenteditableElement: HTMLElement) => {
        props._ref.current = contenteditableElement;
        if (contenteditableElement) {
            if (renderTimeContext.currentFocusedItem == props.item.id){
                contenteditableElement.focus();
            }
            contenteditableElement.onkeydown = (evt: KeyboardEvent) => props.focusedActionReceiver.keyCommand(evt, evt);
        }

    }, [props.item.id]);
    const classNameToForceReRenderOnItemDeletion = props.item.id;
    let htmlToShow = props.item.data;
    if (props.item.symlinkedNode) {
        htmlToShow = linkSymbol + props.item.symlinkedNode.data;
    }

    const renderTimeContext = React.useContext<RenderTimeContext>(RenderTimeContext)
    let searchHighlightBackground = "";
    if (props.item.searchHighlight.includes("SEARCH_SELECTED")) {
        searchHighlightBackground = "blue";
    } else if (renderTimeContext.currentFocusedItem == props.item.id) {
        searchHighlightBackground = "#b36200";
    } else if (props.item.searchHighlight.includes("SEARCH_MATCH")) {
        searchHighlightBackground = "darkslateblue";
    }


    return <span style={{ background: searchHighlightBackground }}
        onContextMenu={() => contextEventHandler(props.item, props.model)}>
        <BulletPoint
            item={props.item}
            actions={props.actions}
            styleParams={props.styleParams}
            raiseContextCopyIdEvent={props.raiseContextCopyIdEvent}
            shouldUncollapse={props.shouldUncollapse}
        ></BulletPoint>
        {/* The contentEditable needs to persist regardless of whether it is a symlink in order for focus to work correctly */}
        <ContentEditable
            innerRef={setInnerRef}
            data-testid={[...props.styleParams.symlinkedParents, props.item.id].join("@")}
            className={"__editable_" + classNameToForceReRenderOnItemDeletion}
            html={htmlToShow}
            onChange={onContentChange}
            onClick={props.onFocusClick}
            style={{
                flex: "1 1 auto",
                scrollMarginTop: "100px"
            }}
        ></ContentEditable>
    </span>
}


const contextEventHandler = (thisItem: ItemTreeNode, model: TransformedDataAndSetter): React.MouseEventHandler<HTMLDivElement> => {
    const { show } = useContextMenu({
        id: ITEM_CONTEXT_MENU_ID,
    });
    return (event) => {
        event.preventDefault = () => {
            // override prevent default to allow default context menu to still show up
        }
        show({
            event,
            props: {
                thisItem,
                model
            }
        })
    }
}
