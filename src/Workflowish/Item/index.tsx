import * as React from "react";
import { ControllerActions } from "../mvc/controller";
import { FocusedActionReceiver, makeFocusedActionReceiver } from "../mvc/focusedActionReceiver";
import { ItemTreeNode, TransformedDataAndSetter } from "../mvc/model";
import { EditableSection } from "./EditableSection";
import "./index.css"
import { ChildItems } from "./ChildItems";
import { SIDECLIP_CONTEXT_MENU_ID } from '~Workflowish/Subcomponents/ContextMenu';
import { TriggerEvent, useContextMenu } from 'react-contexify';


export type FocusActions = {
    triggerFocusFromAbove: () => void;
    triggerFocusFromBelow: () => void;
    focusThis: () => void;
    scrollThisIntoView: () => void;
    focusThisEnd: () => void;
    focusRecentlyIndentedItem: () => void;
}

export type ItemStyleParams = {
    emptyList?: boolean,
    showId: boolean,
    symlinkedParent?: string
}

const shouldBeUncollapsed = (item: ItemTreeNode): boolean => !item.collapsed || item.searchHighlight.includes("SEARCH_UNCOLLAPSE");

const Item = (props: {
    styleParams: ItemStyleParams,
    item: ItemTreeNode,
    actions: ControllerActions,
    model: TransformedDataAndSetter,
    pushRef: (id: string, ref: ItemRef) => void
    setThisAsFocused: (focusedActionReceiver: FocusedActionReceiver, focusItemKey: string) => void
}) => {
    const itemsRefArray = React.useRef<Array<FocusActions | null>>([])
    const thisContentEditable = React.useRef<HTMLElement | null>(null);
    while (itemsRefArray.current.length < props.item.children.length) {
        itemsRefArray.current.push(null);
    }
    while (itemsRefArray.current.length > props.item.children.length) {
        itemsRefArray.current.pop();
    }

    const shouldUncollapse = shouldBeUncollapsed(props.item);


    const focusThis = () => {
        thisContentEditable.current?.focus();
        props.setThisAsFocused(focusedActionReceiver, props.item.id);
    }

    const { show: showSideclipContextMenu, hideAll } = useContextMenu({
        id: SIDECLIP_CONTEXT_MENU_ID,
    });

    const raiseContextCopyIdEvent = (event: TriggerEvent) => {
        showSideclipContextMenu({ event });
        setTimeout(hideAll, 400);
        navigator.clipboard.writeText(props.item.id);
    };

    const jumpToSymlink = () => {
        if (props.item.symlinkedNode) {
            props.actions.focusItem(props.item.symlinkedNode.id);
            return true;
        } else {
            return false;
        }
    }

    const focusedActionReceiver = makeFocusedActionReceiver({
        actions: props.actions,
        itemsRefArray,
        item: props.item,
        raiseContextCopyIdEvent,
        jumpToSymlink,
        focusThis
    })

    props.pushRef(props.item.id, {
        focusThis,
        scrollThisIntoView: ()=>{
            thisContentEditable.current?.scrollIntoView()
        }
    })


    return <span className="itemWrapperClass">
        <EditableSection
            _ref={thisContentEditable}
            focusedActionReceiver={focusedActionReceiver}
            item={props.item}
            model={props.model}
            onFocusClick={focusThis}
            actions={props.actions}
            shouldUncollapse={shouldUncollapse}
            raiseContextCopyIdEvent={raiseContextCopyIdEvent}
            styleParams={props.styleParams}
        ></EditableSection>
        <ChildItems
            item={props.item}
            itemsRefArray={itemsRefArray}
            setThisAsFocused={props.setThisAsFocused}
            actions={props.actions}
            shouldUncollapse={shouldUncollapse}
            styleParams={props.styleParams}
            model={props.model}
            pushRef={props.pushRef}
        ></ChildItems>

    </span >
}

export type ItemRef = {
    focusThis: () => void,
    scrollThisIntoView: () => void
}

export default Item;
