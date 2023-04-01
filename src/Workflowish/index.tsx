import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions } from "./controller";
import Item, { FocusActions } from "./Item"
import { transformData } from "./model"


export default (props: {
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const [todoItems, getSetTodoItems] = transformData({
        data: props.data,
        setData: props.setData
    });

    const nullSizedArrayForRefs = Array(todoItems.length).fill(null);
    const itemsRefArray = React.useRef<Array<FocusActions | null>>(nullSizedArrayForRefs);

    const topLevelTakeFocus = () => {
        // Top level cannot take focus
    }
    const itemsList = todoItems.map((i, ii) => {

        return (<Item
            key={ii}
            emptyList={todoItems.length == 1 && i.data == ""}
            item={i}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            parentActions={makeListActions({
                siblingsFocusActions: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: getSetTodoItems,
                unindentCaller: () => {
                    // cannot unindent at root level
                },
                parentFocusActions: {
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
    return <div style={{ margin: "10px 5px" }}>
        {itemsList}
    </div>
};