import { DFSFocusManager, FocusRequest } from "~Workflowish/mvc/DFSFocus";
import { ItemTreeNode, TransformedDataAndSetter, virtualRootId } from "~Workflowish/mvc/model";

export const expandParentsAndFocusItem = (
    transformedDataAndSetter: TransformedDataAndSetter,
    focusManager: DFSFocusManager,
    focusRequest: FocusRequest
) => {
    transformedDataAndSetter.setItemsByKey((transformedData) => {
        const itemsToReveal = [];
        let treeClimbItem = focusRequest.id;
        while (treeClimbItem && treeClimbItem != virtualRootId) {
            treeClimbItem = transformedData.parentById[treeClimbItem];
            itemsToReveal.push(treeClimbItem);
        }
        const itemsToUpdate: Record<string, ItemTreeNode> = {}
        if (treeClimbItem) {
            itemsToReveal.forEach(key => {
                itemsToUpdate[key] = {
                    ...transformedData.keyedNodes[key],
                    collapsed: false,
                    lastModifiedUnixMillis: Date.now()
                }
            })
        }
        return itemsToUpdate;
    });
    setTimeout(() => focusManager.focusItem(focusRequest), 1);
};
