import * as React from "react";
import { makeListActions } from "./controller";
import Item, { ItemRef } from "./Item"
import { useSavedItems } from "./model"
export default () => {

    const [todoItems, setTodoItems] = useSavedItems();
    const itemsRefArray = React.useRef<Array<ItemRef | null>>([])
    while (itemsRefArray.current.length < todoItems.length) {
        itemsRefArray.current.push(null);
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
                unindentThis: () => {
                    // cannot unindent at root level
                },
                parentFocus: {
                    focusThis: () => {
                        itemsRefArray.current?.[ii]?.triggerFocusFromBelow();
                    },
                    focusMyNextSibling: () => {
                        // Cannot focus next at root level
                    }
                }
            })}
        ></Item >)
    })
    return <div style={{ margin: "10px" }}>
        {itemsList}
    </div>
};