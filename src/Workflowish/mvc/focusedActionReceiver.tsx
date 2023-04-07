import { FocusActions } from "~Workflowish/Item";
import { ItemTreeNode, makeNewItem } from ".";
import { ControllerActions } from "./controller";

export type FocusedActionReceiver =
    {
        // wrapping required because of the way setState interprets a function - cannot pass a function directly
        keyCommand: (
            evt: {
                key: string,
                shiftKey: boolean,
                altKey: boolean,
                ctrlKey: boolean,
                metaKey: boolean,
                preventDefault: () => void
            }
        ) => void,
        refocusSelf: () => void,
    };

export const dummyFocusedActionReciever = {
    keyCommand: () => {
        // Set by children
    },
    refocusSelf: () => {
        // set by children
    }
}

export const makeFocusedActionReceiver = (props: {
    parentActions: ControllerActions,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>
    item: React.MutableRefObject<ItemTreeNode>,
    focusThis: () => void
}): FocusedActionReceiver => (
    {
        keyCommand: (evt) => {
            if (evt.key == "Enter") {
                if (evt.shiftKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        children: [makeNewItem(), ...oldSelf.children]
                    }));
                    setTimeout(() => props.itemsRefArray.current?.[0]?.focusThis());
                } else {
                    props.parentActions.createNewItem();
                }
                evt.preventDefault()
            }
            if (evt.key == "Tab") {
                if (evt.shiftKey) {
                    props.parentActions.unindentSelf();
                } else {
                    props.parentActions.indentSelf();
                }
                evt.preventDefault()
            }
            if (evt.key == "ArrowUp") {
                if (evt.altKey) {
                    props.parentActions.putBeforePrev();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: true
                    }))
                } else {
                    props.parentActions.focusMyPrevSibling();
                }
            }
            if (evt.key == "ArrowDown") {
                if (evt.altKey) {
                    props.parentActions.putAfterNext();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: false
                    }))
                } else {
                    const childrenArray = props.itemsRefArray.current;
                    if (!props.item.current.collapsed && childrenArray && childrenArray.length) {
                        childrenArray[0]?.triggerFocusFromAbove();
                    } else {
                        props.parentActions.focusMyNextSibling();
                    }
                }
            }
            if (evt.key == "Backspace") {
                if (props.item.current.data.length == 0) {
                    props.parentActions.deleteThisItem();
                    evt.preventDefault();
                }
            }
        },
        refocusSelf: props.focusThis,
    }
)