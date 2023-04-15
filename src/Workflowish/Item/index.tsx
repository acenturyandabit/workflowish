import * as React from "react";
import { ControllerActions } from "../mvc/controller";
import { FocusedActionReceiver, makeFocusedActionReceiver } from "../mvc/focusedActionReceiver";
import { ItemTreeNode } from "../mvc/model";
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
    showId: boolean,
    symlinkedParent?: string
}

const shouldBeUncollapsed = (item: ItemTreeNode): boolean => !item.collapsed || item.searchHighlight == "SEARCH_UNCOLLAPSE";

const Item = (props: {
    styleParams: ItemStyleParams,
    item: ItemTreeNode,
    pushRef: (ref: FocusActions) => void,
    actions: ControllerActions,
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

    const shouldUncollapse = shouldBeUncollapsed(props.item);


    const focusThis = () => {
        thisContentEditable.current?.focus();
        props.setFocusedActionReceiver(focusedActionReceiver);
    }


    const focusedActionReceiver = makeFocusedActionReceiver({
        actions: props.actions,
        itemsRefArray,
        item,
        focusThis
    })

    const parentFocusActions = makeParentFocusActions(
        focusThis,
        shouldUncollapse,
        itemsRefArray,
        thisContentEditable,
        props.actions
    );
    props.pushRef(parentFocusActions);


    return <span className="itemWrapperClass">
        <EditableSection
            _ref={thisContentEditable}
            focusedActionReceiver={focusedActionReceiver}
            item={props.item}
            onFocusClick={focusThis}
            actions={props.actions}
            shouldUncollapse={shouldUncollapse}
            styleParams={props.styleParams}
        ></EditableSection>
        <ChildItems
            item={props.item}
            itemsRefArray={itemsRefArray}
            parentFocusActions={parentFocusActions}
            setFocusedActionReceiver={props.setFocusedActionReceiver}
            actions={props.actions}
            shouldUncollapse={shouldUncollapse}
            styleParams={props.styleParams}
        ></ChildItems>

    </span >
}


export default Item;
