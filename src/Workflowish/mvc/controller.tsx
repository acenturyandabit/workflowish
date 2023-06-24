import { makeNewUniqueKey } from "~CoreDataLake";
import { ItemTreeNode, TransformedDataAndSetter } from "./model";
import { TreePath, DFSFocusManager } from "~Workflowish/mvc/DFSFocus";

export type ControllerActions = {
    editSelfContents: (newContents: string) => void,
    createNewChild: (newContents?: string) => Promise<string>,
    createNewSibling: (newContents?: string) => Promise<string>,
    deleteSelf: () => void
    focusItem: (id: string) => void
    focusPreviousListItem: () => void
    focusNextListItem: () => void
    arrangeBeforePrev: () => void
    arrangeAfterNext: () => void
    indentSelf: () => void,
    unindentSelf: () => void
    setSelfCollapsed: (collapsed: boolean) => void;
}

export const linkSymbol = "🔗:";

export const makeItemActions = (props: {
    disableDelete?: () => boolean,
    thisItem: ItemTreeNode,
    treePath: TreePath,
    focusManager: DFSFocusManager,
    model: TransformedDataAndSetter,
}): ControllerActions => ({
    // Note: All these methods are symlink aware.
    editSelfContents: (newContents: string) => {
        props.model.setItemsByKey((transformedData) => {
            if (props.thisItem.symlinkedNode) {
                const isStillALink = newContents.startsWith(linkSymbol);
                if (isStillALink) {
                    transformedData.keyedNodes[props.thisItem.symlinkedNode.id].data = newContents.slice(linkSymbol.length);
                    return {
                        [props.thisItem.symlinkedNode.id]: transformedData.keyedNodes[props.thisItem.symlinkedNode.id]
                    }
                } else {
                    const brokenLink = `[LN: ${props.thisItem.symlinkedNode.id}`;
                    transformedData.keyedNodes[props.thisItem.id].data = brokenLink;
                    return {
                        [props.thisItem.id]: transformedData.keyedNodes[props.thisItem.id]
                    }
                }
            } else {
                transformedData.keyedNodes[props.thisItem.id].data = newContents;
                return {
                    [props.thisItem.id]: transformedData.keyedNodes[props.thisItem.id]
                }
            }
        })
    },
    createNewChild: async (newContents?: string) => {
        return new Promise<string>((resolve) => {
            const newId = makeNewUniqueKey();
            props.model.setItemsByKey((transformedData) => {
                const newTreeNode: ItemTreeNode = {
                    id: newId,
                    lastModifiedUnixMillis: Date.now(),
                    data: newContents || "",
                    children: [],
                    collapsed: false,
                    searchHighlight: []
                };
                transformedData.keyedNodes[props.thisItem.id].children.unshift(newTreeNode);
                setTimeout(() => resolve(newId));
                return {
                    [newId]: newTreeNode,
                    [props.thisItem.id]: transformedData.keyedNodes[props.thisItem.id]
                }
            })
        })
    },
    createNewSibling: async (newContents?: string) => {
        return new Promise<string>((resolve) => {
            const newId = makeNewUniqueKey();
            props.model.setItemsByKey((transformedData) => {
                const thisParentId = transformedData.parentById[props.thisItem.id];
                const siblings = transformedData.keyedNodes[thisParentId].children;
                const currentSiblingIdx = siblings.map(i => i.id).indexOf(props.thisItem.id);
                const newTreeNode: ItemTreeNode = {
                    id: newId,
                    lastModifiedUnixMillis: Date.now(),
                    data: newContents || "",
                    children: [],
                    collapsed: false,
                    searchHighlight: []
                };
                siblings.splice(currentSiblingIdx + 1, 0, newTreeNode);
                setTimeout(() => resolve(newId));
                return {
                    [newId]: newTreeNode,
                    [thisParentId]: transformedData.keyedNodes[thisParentId]
                }
            })
        })
    },
    deleteSelf: () => {
        if (!props.disableDelete || props.disableDelete() == false) {
            props.model.setItemsByKey(() => {
                const itemsToDelete: Record<string, ItemTreeNode> = {};
                const cleanupQueue = [props.thisItem];
                while (cleanupQueue.length) {
                    const front = cleanupQueue.shift();
                    if (front){
                        front.markedForCleanup=true;
                        itemsToDelete[front.id] = front;
                        front.children.forEach(child => cleanupQueue.push(child));
                    }
                }
                return itemsToDelete
            })
        }
    },
    setSelfCollapsed: (collapsed: boolean) => {
        props.model.setItemsByKey((transformedData) => {
            transformedData.keyedNodes[props.thisItem.id].collapsed = collapsed;
            return {
                [props.thisItem.id]: transformedData.keyedNodes[props.thisItem.id]
            }
        })
    },
    focusItem: props.focusManager.focusItem,
    focusPreviousListItem: () => {
        props.focusManager.focusPrev(props.treePath);
    },
    focusNextListItem: () => {
        props.focusManager.focusNext(props.treePath);
    },
    arrangeBeforePrev: () => {
        props.model.setItemsByKey((transformedData) => {
            const thisParentId = transformedData.parentById[props.thisItem.id];
            const parentItem = transformedData.keyedNodes[thisParentId];
            const currentSiblingIdx = parentItem.children.map(i => i.id).indexOf(props.thisItem.id);
            if (currentSiblingIdx > 0) {
                parentItem.children.splice(currentSiblingIdx, 1);
                parentItem.children.splice(currentSiblingIdx - 1, 0, props.thisItem);
            }
            return {
                [parentItem.id]: parentItem
            }
        })
    },
    arrangeAfterNext: () => {
        props.model.setItemsByKey((transformedData) => {
            const thisParentId = transformedData.parentById[props.thisItem.id];
            const parentItem = transformedData.keyedNodes[thisParentId];
            const currentSiblingIdx = parentItem.children.map(i => i.id).indexOf(props.thisItem.id);
            if (currentSiblingIdx < parentItem.children.length - 1) {
                parentItem.children.splice(currentSiblingIdx, 1);
                parentItem.children.splice(currentSiblingIdx + 1, 0, props.thisItem);
            }
            return {
                [parentItem.id]: parentItem
            }
        })
    },
    indentSelf: () => {
        props.model.setItemsByKey((transformedData) => {
            const thisParentId = transformedData.parentById[props.thisItem.id];
            const parentItem = transformedData.keyedNodes[thisParentId];
            const currentSiblingIdx = parentItem.children.map(i => i.id).indexOf(props.thisItem.id);
            if (currentSiblingIdx > 0) {
                parentItem.children.splice(currentSiblingIdx, 1);
                const previousSibling = parentItem.children[currentSiblingIdx - 1];
                previousSibling.children.push(props.thisItem);
                return {
                    [parentItem.id]: parentItem,
                    [previousSibling.id]: previousSibling
                }
            } else {
                return {}
            }
        })
    },
    unindentSelf: () => {
        props.model.setItemsByKey((transformedData) => {
            const returnItem: Record<string, ItemTreeNode> = {};
            const thisParentId = transformedData.parentById[props.thisItem.id];
            const parentItem = transformedData.keyedNodes[thisParentId];
            if (parentItem) {
                const thisGrandParentId = transformedData.parentById[parentItem.id];
                const grandParentItem = transformedData.keyedNodes[thisGrandParentId];
                if (grandParentItem) {
                    const currentSiblingIdx = parentItem.children.map(i => i.id).indexOf(props.thisItem.id);
                    parentItem.children.splice(currentSiblingIdx, 1);
                    const parentSiblingIdx = grandParentItem.children.map(i => i.id).indexOf(parentItem.id);
                    grandParentItem.children.splice(parentSiblingIdx + 1, 0, props.thisItem);
                    returnItem[grandParentItem.id] = grandParentItem;
                    returnItem[parentItem.id] = parentItem;
                }
            }
            return returnItem;
        })
    }
});
