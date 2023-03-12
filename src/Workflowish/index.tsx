import * as React from "react";
import { makeListActions } from "./controller";
import Item from "./Item"
import { useSavedItems } from "./model"
export default () => {

    const [todoItems, setTodoItems] = useSavedItems();
    const itemsRefArray = React.useRef<Array<HTMLElement | null>>([])
    while (itemsRefArray.current.length < todoItems.length) {
        itemsRefArray.current.push(null);
    }
    const itemsList = todoItems.map((i, ii) => {

        return (<Item
            key={ii}
            emptyList={todoItems.length == 1 && i.data == ""}
            item={i}
            pushRef={(ref: HTMLElement) => itemsRefArray.current[ii] = ref}
            actions={makeListActions({
                siblingItemRefs: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: setTodoItems,
                unindentThis: () => {
                    // cannot unindent at root level
                }
            })}
        ></Item >)
    })
    return <div style={{ margin: "10px" }}>
        {itemsList}
    </div>
};