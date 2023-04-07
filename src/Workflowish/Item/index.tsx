import * as React from "react";
import { ControllerActions } from "../mvc/controller";
import { FocusedActionReceiver, makeFocusedActionReceiver } from "../mvc/focusedActionReceiver";
import { ItemTreeNode } from "../mvc";
import { EditableSection } from "./EditableSection";
import "./index.css"
import { ChildItems, makeParentFocusActions } from "./ChildItems";

export type FocusActions = {
    triggerFocusFromAbove: () => void;
    triggerFocusFromBelow: () => void;
    focusThis: () => void;
    focusThisEnd: () => void;
    focusRecentlyIndentedItem: () => void;
    focusMyNextSibling: () => void;
}

export type ItemStyleParams = {
    emptyList?: boolean,
    showId: boolean
}

const Item = (props: {
    styleParams: ItemStyleParams,
    item: ItemTreeNode,
    pushRef: (ref: FocusActions) => void,
    parentActions: ControllerActions,
    setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>
}) => {
    const item = React.useRef(props.item);
    React.useEffect(() => {
        item.current = props.item
    }, [props.item]);
    const itemsRefArray = React.useRef<Array<FocusActions | null>>([])
    const thisContentEditable = React.useRef<HTMLElement | null>(null);
    while (itemsRefArray.current.length < props.item.children.length) {
        itemsRefArray.current.push(null);
    }
    while (itemsRefArray.current.length > props.item.children.length) {
        itemsRefArray.current.pop();
    }

    const shouldUncollapse = !props.item.collapsed || props.item.searchHighlight == "SEARCH_UNCOLLAPSE";


    const focusThis = () => {
        thisContentEditable.current?.focus();
        props.setFocusedActionReceiver(focusedActionReceiver);
    }


    const focusedActionReceiver = makeFocusedActionReceiver({
        parentActions: props.parentActions,
        itemsRefArray,
        item,
        focusThis
    })

    const parentFocusActions = makeParentFocusActions(
        focusThis,
        shouldUncollapse,
        itemsRefArray,
        thisContentEditable,
        props.parentActions
    );
    props.pushRef(parentFocusActions);


    return <span className="itemWrapperClass">
        <EditableSection
            _ref={thisContentEditable}
            focusedActionReceiver={focusedActionReceiver}
            item={props.item}
            onFocusClick={focusThis}
            parentActions={props.parentActions}
            shouldUncollapse={shouldUncollapse}
            styleParams={props.styleParams}
        ></EditableSection>
        <ChildItems
            children={props.item.children}
            itemsRefArray={itemsRefArray}
            parentFocusActions={parentFocusActions}
            setFocusedActionReceiver={props.setFocusedActionReceiver}
            parentActions={props.parentActions}
            shouldUncollapse={shouldUncollapse}
            styleParams={props.styleParams}
        ></ChildItems>

    </span >
}


export default Item;
