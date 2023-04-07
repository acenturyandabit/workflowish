import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter } from "./mvc/controller";
import { FocusedActionReceiver, dummyFocusedActionReciever } from "./mvc/focusedActionReceiver"
import Item, { FocusActions } from "./Item"
import { ItemTreeNode, transformData } from "./mvc"
import { isMobile } from '~util/isMobile';
import { FloatyButtons } from "./Subcomponents/FloatyButtons";
import SearchBar, { searchTransform } from "./Subcomponents/SearchBar";
import ContextMenu from "./Subcomponents/ContextMenu";


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

    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>(dummyFocusedActionReciever);

    const [showIds, setShowIds] = React.useState<boolean>(false);
    React.useEffect(() => {
        const altModifyToggle = (evt: KeyboardEvent) => {
            setShowIds(evt.altKey && evt.shiftKey);
            if (evt.key == "Alt") evt.preventDefault();
        }
        window.addEventListener("keydown", altModifyToggle);
        window.addEventListener("keyup", altModifyToggle);
        return () => {
            window.removeEventListener("keydown", altModifyToggle);
            window.removeEventListener("keyup", altModifyToggle);
        }
    }, [])
    return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
        ></SearchBar>
        <ContextMenu></ContextMenu>
        <div style={{ margin: "10px 5px", flex: "1 0 auto" }}>
            <ItemsList
                showIds={showIds}
                todoItems={todoItems}
                setFocusedActionReceiver={setFocusedActionReceiver}
                getSetTodoItems={getSetTodoItems}
            ></ItemsList>
        </div>
        {isMobile() ? <FloatyButtons focusedActionReceiver={focusedActionReceiver}></FloatyButtons> : null}
    </div>
};

const ItemsList = (
    props: {
        todoItems: ItemTreeNode,
        setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>,
        getSetTodoItems: React.Dispatch<React.SetStateAction<ItemTreeNode>>,
        showIds: boolean
    }
) => {
    const nullSizedArrayForRefs = Array(props.todoItems.children.length).fill(null);
    const topLevelTakeFocus = () => {
        // Top level cannot take focus
    }
    const itemsRefArray = React.useRef<Array<FocusActions | null>>(nullSizedArrayForRefs);
    return <>{props.todoItems.children.map((item, ii) => {
        return (<Item
            key={ii}
            styleParams={{
                showId: props.showIds,
                emptyList: props.todoItems.children.length == 1 && item.data == ""
            }}
            item={item}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            setFocusedActionReceiver={props.setFocusedActionReceiver}
            parentActions={makeListActions({
                siblingsFocusActions: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                    props.getSetTodoItems((virtualRoot: ItemTreeNode) => {
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
                        if (ii < props.todoItems.children.length - 1) {
                            itemsRefArray.current[ii + 1]?.focusThis()
                        } else {
                            itemsRefArray.current[ii]?.focusThis()
                        }
                    },
                },
                disableDelete: () => (props.todoItems.children.length == 1)
            })}
        ></Item >)
    })}</>
}