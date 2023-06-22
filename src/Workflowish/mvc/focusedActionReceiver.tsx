import { FocusActions } from "~Workflowish/Item";
import { ItemTreeNode } from "./model";
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
    actions: ControllerActions,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>
    item: ItemTreeNode,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    jumpToSymlink: () => boolean,
    focusThis: () => void,
}): FocusedActionReceiver => {
    return {
        keyCommand: (evt, rawEvent) => {
            if (evt.key == "Enter") {
                if (evt.shiftKey) {
                    (async () => {
                        const childId = await props.actions.createNewChild();
                        props.actions.focusItem(childId);
                    })();
                } else if (evt.altKey) {
                    const currentSelection = window.getSelection();
                    if (currentSelection
                        && currentSelection.anchorOffset == currentSelection.focusOffset
                        && currentSelection.anchorNode == currentSelection.focusNode
                    ) {
                        const halfToKeep = props.item.data.slice(currentSelection.anchorOffset);
                        const halfToGiveToChild = props.item.data.slice(0, currentSelection.anchorOffset);
                        if (evt.shiftKey) {
                            (async () => {
                                const childId = await props.actions.createNewChild(halfToGiveToChild);
                                props.actions.editSelfContents(halfToKeep);
                                props.actions.focusItem(childId);
                            })();
                        } else {
                            (async () => {
                                const childId = await props.actions.createNewSibling(halfToGiveToChild);
                                props.actions.editSelfContents(halfToKeep);
                                props.actions.focusItem(childId);
                            })();
                        }
                    }
                } else {
                    (async () => {
                        const childId = await props.actions.createNewSibling();
                        props.actions.focusItem(childId);
                    })();
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
                    props.actions.arrangeBeforePrev();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.actions.setSelfCollapsed(true);
                } else {
                    props.actions.focusPreviousListItem();
                }
            }
            if (evt.key == "ArrowDown") {
                if (evt.altKey) {
                    props.actions.arrangeAfterNext();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.actions.setSelfCollapsed(false);
                } else {
                    props.actions.focusNextListItem();
                }
            }
            if (evt.key == "Backspace") {
                if (props.item.data.length == 0) {
                    props.actions.deleteSelf();
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
}