import * as React from "react";
import { ControllerActions } from "../mvc/controller";
import { FocusedActionReceiver, makeFocusedActionReceiver } from "../mvc/focusedActionReceiver";
import { ItemTreeNode, TransformedDataAndSetter } from "../mvc/model";
import { EditableSection } from "./EditableSection";
import "./index.css"
import { ChildItems } from "./ChildItems";
import { SIDECLIP_CONTEXT_MENU_ID } from '~Workflowish/Subcomponents/ContextMenu';
import { TriggerEvent, useContextMenu } from 'react-contexify';
import { DFSFocusManager, IdAndFocusPath, TreePath } from "~Workflowish/mvc/DFSFocus";


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
    symlinkedParents: string[]
}

const shouldBeUncollapsed = (item: ItemTreeNode): boolean => !item.collapsed || item.searchHighlight.includes("SEARCH_UNCOLLAPSE");

const Item = (props: {
    styleParams: ItemStyleParams,
    item: ItemTreeNode,
    treePath: TreePath,
    focusManager: React.RefObject<DFSFocusManager>,
    actions: ControllerActions,
    model: TransformedDataAndSetter,
    pushRef: (id: string, ref: ItemRef) => void
    setThisAsFocused: (focusedActionReceiver: FocusedActionReceiver, focusItemKey: IdAndFocusPath) => void
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
    const itemRef = React.useRef(props.item);
    React.useEffect(() => {
        // Force the focusedActionReceiver to look at the current item  otherwise it will fail to update
        itemRef.current = props.item
    });

    const focusThis = (end?: boolean) => {
        const currentElement = thisContentEditable.current;
        if (currentElement) {
            currentElement.focus();
            if (end) {
                const textNode = [...currentElement.childNodes].filter(i => i.nodeType == document.TEXT_NODE)[0];
                if (textNode && textNode.textContent) {
                    const range = document.createRange();
                    range.setStart(textNode, textNode.textContent.length)
                    range.setEnd(textNode, textNode.textContent.length)
                    const selection = window.getSelection();
                    if (selection) {
                        selection.removeAllRanges()
                        selection.addRange(range);
                    }
                }
            }
        }
        props.setThisAsFocused(focusedActionReceiver, { id: props.item.id, treePath: props.treePath });
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
            props.actions.focusItem({ id: props.item.symlinkedNode.id });
            return true;
        } else {
            return false;
        }
    }

    const focusedActionReceiver = makeFocusedActionReceiver({
        actions: props.actions,
        itemsRefArray,
        item: itemRef,
        raiseContextCopyIdEvent,
        jumpToSymlink,
        focusThis,
        treePath: props.treePath
    })

    props.pushRef(props.item.id, {
        focusThis,
        scrollThisIntoView: () => {
            thisContentEditable.current?.scrollIntoView()
        }
    })

    props.focusManager.current?.registerChild(props.treePath, props.item.id, {
        focus: focusThis
    })


    return <span className="itemWrapperClass">
        <EditableSection
            _ref={thisContentEditable}
            focusedActionReceiver={focusedActionReceiver}
            item={props.item}
            treePath={props.treePath}
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
            treePath={props.treePath}
            focusManager={props.focusManager}
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
