import { FocusActions } from "~Workflowish/Item";
import { ItemTreeNode, makeNewItem } from "./model";
import { ControllerActions } from "./controller";
import { TriggerEvent } from "react-contexify";
import { MOBILE_ACTION_1 } from "~Workflowish/Subcomponents/FloatyButtons";

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
            },
            rawEvent: TriggerEvent
        ) => void,
        refocusSelf: () => void
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
    actions: ControllerActions,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>
    item: React.MutableRefObject<ItemTreeNode>,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    jumpToSymlink: () => boolean,
    focusThis: () => void,
}): FocusedActionReceiver => (
    {
        keyCommand: (evt, rawEvent) => {
            if (evt.key == "Enter") {
                if (evt.shiftKey) {
                    props.actions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        children: [makeNewItem(), ...oldSelf.children]
                    }));
                    setTimeout(() => props.itemsRefArray.current?.[0]?.focusThis());
                } else {
                    props.actions.createNewItem();
                }
                evt.preventDefault()
            }
            if (evt.key == "Tab") {
                if (evt.shiftKey) {
                    props.actions.unindentSelf();
                } else {
                    props.actions.indentSelf();
                }
                evt.preventDefault()
            }
            if (evt.key == "ArrowUp") {
                if (evt.altKey) {
                    props.actions.putBeforePrev();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.actions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: true
                    }))
                } else {
                    props.actions.focusMyPrevSibling();
                }
            }
            if (evt.key == "ArrowDown") {
                if (evt.altKey) {
                    props.actions.putAfterNext();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.actions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: false
                    }))
                } else {
                    const childrenArray = props.itemsRefArray.current;
                    if (!props.item.current.collapsed && childrenArray && childrenArray.length) {
                        childrenArray[0]?.triggerFocusFromAbove();
                    } else {
                        props.actions.focusMyNextSibling();
                    }
                }
            }
            if (evt.key == "Backspace") {
                if (props.item.current.data.length == 0) {
                    props.actions.deleteThisItem();
                    evt.preventDefault();
                }
            }
            if ((evt.key.toLowerCase() == "c" || evt.key == MOBILE_ACTION_1) && evt.altKey && evt.shiftKey) {
                props.raiseContextCopyIdEvent(rawEvent);
            }
            if ((evt.key.toLowerCase() == "j" || evt.key == MOBILE_ACTION_1) && (evt.ctrlKey || evt.metaKey)) {
                if (props.jumpToSymlink()) rawEvent.preventDefault();
            }
        },
        refocusSelf: props.focusThis,
    }
)