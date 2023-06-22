
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
        const itemsToFetch = [props.item.id];
        if (props.item.symlinkedNode) {
            itemsToFetch.push(props.item.symlinkedNode.id);
        }
        props.actions.editSelfContents(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf));
    }

    const setInnerRef = (contenteditableElement: HTMLElement) => {
        props._ref.current = contenteditableElement;
        if (contenteditableElement) {
            contenteditableElement.onkeydown = (evt: KeyboardEvent) => props.focusedActionReceiver.keyCommand(evt, evt);
        }
    }

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
