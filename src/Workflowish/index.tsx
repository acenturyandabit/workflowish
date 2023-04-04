import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter } from "./controller";
import Item, { FocusActions, FocusedActionReceiver } from "./Item"
import { ItemTreeNode, transformData } from "./model"
import { isMobile } from '~util/isMobile';
import { FloatyButtons } from "./FloatyButtons";
import SearchBar, { searchTransform } from "./SearchBar";

export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const [searchText, setSearchText] = React.useState<string>("");
    const [unfilteredTodoItems, getSetTodoItems] = transformData({
        data: props.data,
        updateData: props.updateData,
    });

    const todoItems = searchTransform(unfilteredTodoItems, searchText);

    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>({
        keyCommand: () => {
            // Set by children
        },
        refocusSelf: () => {
            // set by children
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
                getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                    getSetTodoItems((virtualRoot: ItemTreeNode) => {
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
                    focusThis: () => itemsRefArray.current[ii]?.focusThis(),
                    focusThisEnd: topLevelTakeFocus,
                    focusRecentlyIndentedItem: topLevelTakeFocus,
                    focusMyNextSibling: () => {
                        if (ii < todoItems.children.length - 1) {
                            itemsRefArray.current[ii + 1]?.focusThis()
                        } else {
                            itemsRefArray.current[ii]?.focusThis()
                        }
                    },
                }
            })}
        ></Item >)
    })
    return <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
    }}>
        <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
        ></SearchBar>
        <div style={{ margin: "10px 5px", flex: "1 0 auto" }}>
            {itemsList}
        </div>
        {isMobile() ? <FloatyButtons focusedActionReceiver={focusedActionReceiver}></FloatyButtons> : null}
    </div>
};
