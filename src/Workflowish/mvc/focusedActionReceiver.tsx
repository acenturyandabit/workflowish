import { FocusActions } from "~Workflowish/Item";
import { ItemTreeNode } from "./model";
import { ControllerActions } from "./controller";
import { TriggerEvent } from "react-contexify";
import { MOBILE_ACTION_1 } from "~Workflowish/Subcomponents/FloatyButtons";
import { TreePath } from "./DFSFocus";

export type FocusedActionReceiver =
    {
        // wrapping required because of the way setState interprets a function - cannot pass a function directly
        keyCommand: (
            evt: {
                key: string,
                shiftKey?: boolean,
                altKey?: boolean,
                ctrlKey?: boolean,
                metaKey?: boolean,
                repeat?: boolean
                preventDefault?: () => void
            },
            rawEvent?: TriggerEvent
        ) => void,
        refocusSelf: () => void,
    };

export const dummyFocusedActionReceiver = {
    keyCommand: () => {
        // Set by children
    },
    refocusSelf: () => {
        // set by children
    }
}

let expectedFARId: string | undefined;

export const makeFocusedActionReceiver = (props: {
    actions: ControllerActions,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>
    item: React.RefObject<ItemTreeNode>,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    jumpToSymlink: () => boolean,
    focusThis: () => void,
    treePath: TreePath
}): FocusedActionReceiver => {
    return {
        keyCommand: (evt, rawEvent) => {
            const currentItem = props.item.current;
            if (currentItem) {
                if (evt.repeat && expectedFARId && currentItem.id != expectedFARId) return;
                expectedFARId = undefined;
                if (evt.key == "Enter") {
                    if (evt.shiftKey) {
                        props.actions.createNewChild();
                    } else if (evt.altKey) {
                        const currentSelection = window.getSelection();
                        if (currentSelection
                            && currentSelection.anchorOffset == currentSelection.focusOffset
                            && currentSelection.anchorNode == currentSelection.focusNode
                        ) {
                            const halfToKeep = currentItem.data.slice(0, currentSelection.anchorOffset);
                            const halfToGiveToChild = currentItem.data.slice(currentSelection.anchorOffset);
                            if (evt.shiftKey) {
                                props.actions.createNewChild(halfToGiveToChild);
                                props.actions.editSelfContents(halfToKeep);
                            } else {
                                props.actions.createNewSibling(halfToGiveToChild);
                                props.actions.editSelfContents(halfToKeep);
                            }
                        }
                    } else {
                        props.actions.createNewSibling();
                    }
                    if (evt.preventDefault) evt.preventDefault()
                }
                if (evt.key == "Tab") {
                    if (evt.shiftKey) {
                        props.actions.unindentSelf();
                        props.actions.focusItemAfterUpdate({ id: currentItem.id, treePathHint: props.treePath });
                    } else {
                        props.actions.indentSelf();
                        props.actions.focusItemAfterUpdate({ id: currentItem.id, treePathHint: props.treePath });
                    }
                    if (evt.preventDefault) evt.preventDefault()
                }
                if (evt.key == "ArrowUp") {
                    if (evt.altKey) {
                        expectedFARId = currentItem.id
                        props.actions.arrangeBeforePrev();
                        props.actions.focusItem({ id: currentItem.id });
                    } else if (evt.ctrlKey || evt.metaKey) {
                        props.actions.setSelfCollapsed(true);
                    } else {
                        props.actions.focusPreviousListItem();
                    }
                }
                if (evt.key == "ArrowDown") {
                    if (evt.altKey) {
                        expectedFARId = currentItem.id
                        props.actions.arrangeAfterNext();
                        props.actions.focusItem({ id: currentItem.id });
                    } else if (evt.ctrlKey || evt.metaKey) {
                        props.actions.setSelfCollapsed(false);
                    } else {
                        props.actions.focusNextListItem();
                    }
                }
                if (evt.key == "Backspace") {
                    if (currentItem.data.length == 0) {
                        props.actions.deleteSelf();
                        props.actions.focusPreviousListItem();
                        if (evt.preventDefault) evt.preventDefault();
                    }
                }
                if ((evt.key.toLowerCase() == "c" || evt.key == MOBILE_ACTION_1) && evt.altKey && evt.shiftKey && rawEvent) {
                    props.raiseContextCopyIdEvent(rawEvent);
                }
                if ((evt.key.toLowerCase() == "j" || evt.key == MOBILE_ACTION_1) && (evt.ctrlKey || evt.metaKey) && rawEvent) {
                    if (props.jumpToSymlink()) rawEvent.preventDefault();
                }
            }
        },
        refocusSelf: props.focusThis,
    }
}