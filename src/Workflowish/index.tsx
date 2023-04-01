import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter } from "./controller";
import Item, { FocusActions, FocusedActionReceiver } from "./Item"
import { ItemTreeNode, transformData } from "./model"
import { isMobile } from 'react-device-detect';
import { FloatyButtons } from "./FloatyButtons";

export default (props: {
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const [todoItems, getSetTodoItems] = transformData({
        data: props.data,
        setData: props.setData
    });
    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>({
        wrappedFunction: () => {
            // Set by children
        }
    });
    const nullSizedArrayForRefs = Array(todoItems.children.length).fill(null);
    const itemsRefArray = React.useRef<Array<FocusActions | null>>(nullSizedArrayForRefs);

    const topLevelTakeFocus = () => {
        // Top level cannot take focus
    }
    const itemsList = todoItems.children.map((item, ii) => {

        return (<Item
            key={ii}
            emptyList={todoItems.children.length == 1 && item.data == ""}
            item={item}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            setFocusedActionReceiver={setFocusedActionReceiver}
            parentActions={makeListActions({
                siblingsFocusActions: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: (t: TreeNodeArrayGetSetter)=>{
                    getSetTodoItems((virtualRoot: ItemTreeNode)=>{
                        const newChildren = t(virtualRoot.children);
                        return {
                            ...virtualRoot,
                            lastModifiedUnixMillis: Date.now(),
                            children: newChildren
                        }
                    })
                },
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
        {isMobile ? <FloatyButtons focusedActionReceiver={focusedActionReceiver}></FloatyButtons> : null}
    </div>
};
