import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions } from "./controller";
import Item, { ItemRef } from "./Item"
import { transformData } from "./model"


export default (props: {
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {

    const [todoItems, setTodoItems] = transformData(props);
    const itemsRefArray = React.useRef<Array<ItemRef | null>>([])
    while (itemsRefArray.current.length < todoItems.length) {
        itemsRefArray.current.push(null);
    }
    const topLevelTakeFocus = () => {
        // Top level cannot take focus
    }
    const itemsList = todoItems.map((i, ii) => {

        return (<Item
            key={ii}
            emptyList={todoItems.length == 1 && i.data == ""}
            item={i}
            pushRef={(ref: ItemRef) => itemsRefArray.current[ii] = ref}
            parentActions={makeListActions({
                siblingItemRefs: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: setTodoItems,
                unindentCaller: () => {
                    // cannot unindent at root level
                },
                thisActions: {
                    triggerFocusFromAbove: topLevelTakeFocus,
                    triggerFocusFromBelow: topLevelTakeFocus,
                    focusThis: topLevelTakeFocus,
                    focusThisEnd: topLevelTakeFocus,
                    focusRecentlyIndentedItem: topLevelTakeFocus,
                    focusMyNextSibling: topLevelTakeFocus,
                }
            })}
        ></Item >)
    })
    return <div style={{ margin: "10px" }}>
        {itemsList}
    </div>
};