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
        focusThis: () => void,
    };

export const dummyFocusedActionReceiver = {
    keyCommand: () => {
        // Set by children
    },
    focusThis: () => {
        // set by children
    }
}

let expectedFARId: string | undefined;

export const makeFocusedActionReceiver = (props: {
    actions: ControllerActions,
    itemsRefArray: React.MutableRefObject<(FocusActions | null)[]>
    itemRef: React.RefObject<ItemTreeNode>,
    raiseContextCopyIdEvent: (event: TriggerEvent) => void,
    jumpToSymlink: () => boolean,
    focusThis: () => void,
    treePath: TreePath
}): FocusedActionReceiver => {
    return {
        keyCommand: (evt, rawEvent) => {
            const currentItem = props.itemRef.current;
            if (currentItem) {
                if (evt.repeat && expectedFARId && currentItem.id != expectedFARId) return;
                expectedFARId = undefined;
                if (evt.key == "Enter") {
                    if (evt.shiftKey) {
                        const newId = props.actions.createNewChild();
                        props.actions.focusItemAfterUpdate({ id: newId, treePathHint: props.treePath });
                    } else if (evt.altKey) {
                        const currentSelection = window.getSelection();
                        if (currentSelection
                            && currentSelection.anchorOffset == currentSelection.focusOffset
                            && currentSelection.anchorNode == currentSelection.focusNode
                        ) {
                            const halfToKeep = currentItem.data.slice(0, currentSelection.anchorOffset);
                            const halfToGiveToChild = currentItem.data.slice(currentSelection.anchorOffset);
                            if (evt.shiftKey) {
                                const newId = props.actions.createNewChild(halfToGiveToChild);
                                props.actions.focusItemAfterUpdate({ id: newId, treePathHint: props.treePath });
                                props.actions.editSelfContents(halfToKeep);
                            } else {
                                const newId = props.actions.createNewSibling(halfToGiveToChild);
                                props.actions.focusItemAfterUpdate({ id: newId, treePathHint: props.treePath });
                                props.actions.editSelfContents(halfToKeep);
                            }
                        }
                    } else {
                        const newId = props.actions.createNewSibling();
                        props.actions.focusItemAfterUpdate({ id: newId, treePathHint: props.treePath });
                    }
                    if (evt.preventDefault) evt.preventDefault();
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
                        props.actions.focusItemAfterUpdate({ id: currentItem.id, treePathHint: [...props.treePath.slice(0, props.treePath.length - 1), props.treePath[props.treePath.length - 1] - 1] });
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
                        props.actions.focusItemAfterUpdate({ id: currentItem.id, treePathHint: [...props.treePath.slice(0, props.treePath.length - 1), props.treePath[props.treePath.length - 1] + 1] });
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
        focusThis: props.focusThis,
    }
}