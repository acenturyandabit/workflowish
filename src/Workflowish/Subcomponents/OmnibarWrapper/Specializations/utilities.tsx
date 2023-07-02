import { ItemRef } from "~Workflowish/Item";
import { ItemTreeNode, TransformedDataAndSetter, virtualRootId } from "~Workflowish/mvc/model";

export const expandParentsAndFocusItem = (
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, ItemRef>,
    itemToReveal: string
) => {
    transformedDataAndSetter.setItemsByKey((transformedData) => {
        const itemsToReveal = [];
        let treeClimbItem = itemToReveal;
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
    setTimeout(() => itemsRefDictionary[itemToReveal]?.focusThis(), 1);
};
