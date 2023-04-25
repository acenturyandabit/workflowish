import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter, TreeNodesGetSetter } from "./mvc/controller";
import { FocusedActionReceiver, dummyFocusedActionReciever } from "./mvc/focusedActionReceiver"
import Item, { FocusActions } from "./Item"
import { ItemTreeNode, TodoItemsGetSetterWithKeyedNodes, transformData, virtualRootId } from "./mvc/model"
import { isMobile } from '~util/isMobile';
import { FloatyButtons } from "./Subcomponents/FloatyButtons";
import SearchBarWrapper from "./Subcomponents/SearchBar";
import ContextMenu from "./Subcomponents/ContextMenu";
import { ModelContext } from "./mvc/context";


export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const [unfileredRootNode, keyedNodes, getSetTodoItems] = transformData(props);
    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>(dummyFocusedActionReciever);
    const itemsRefDictionary = React.useRef<Record<string, FocusActions>>({});

    const [showIds, setShowIds] = React.useState<boolean>(false);
    React.useEffect(AltShouldToggleShowIds(setShowIds), []);

    return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ContextMenu></ContextMenu>
        <ModelContext.Provider value={unfileredRootNode}>
            <div style={{ margin: "0 5px 10px 5px", flex: "1 0 auto" }}>
                <SearchBarWrapper itemRefsDictionary={itemsRefDictionary.current} getSetTodoItems={getSetTodoItems}>
                    <ItemsList
                        showIds={showIds}
                        itemRefsDictionary={itemsRefDictionary.current}
                        setFocusedActionReceiver={setFocusedActionReceiver}
                        getSetTodoItems={getSetTodoItems}
                        keyedNodes={keyedNodes}
                    ></ItemsList>
                </SearchBarWrapper>
            </div>
        </ModelContext.Provider>
        {isMobile() ? <FloatyButtons focusedActionReceiver={focusedActionReceiver}></FloatyButtons> : null}
    </div>
};

const AltShouldToggleShowIds = (setShowIds: React.Dispatch<React.SetStateAction<boolean>>) => {
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
}

const ItemsList = (
    props: {
        setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>,
        itemRefsDictionary: Record<string, FocusActions>,
        getSetTodoItems: TodoItemsGetSetterWithKeyedNodes,
        keyedNodes: Record<string, ItemTreeNode>,
        showIds: boolean
    }
) => {
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);
    const nullSizedArrayForRefs = Array(itemTree.children.length).fill(null);
    const topLevelNullFunction = () => {
        // Top level cannot take focus
    }
    const itemsRefArray = React.useRef<Array<FocusActions | null>>(nullSizedArrayForRefs);
    return <>{itemTree.children.map((item, ii) => {
        return (<Item
            key={ii}
            styleParams={{
                showId: props.showIds,
                emptyList: itemTree.children.length == 1 && item.data == ""
            }}
            item={item}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            pushRefGlobal={(ref: FocusActions, id: string) => { props.itemRefsDictionary[id] = ref }}
            setFocusedActionReceiver={props.setFocusedActionReceiver}
            actions={makeListActions({
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
                focusItem: (id: string) => {
                    props.itemRefsDictionary[id].focusThis();
                },
                parentFocusActions: {
                    triggerFocusFromAbove: topLevelNullFunction,
                    triggerFocusFromBelow: topLevelNullFunction,
                    focusThis: () => itemsRefArray.current[ii]?.focusThis(),
                    focusThisEnd: topLevelNullFunction,
                    focusRecentlyIndentedItem: topLevelNullFunction,
                    focusMyNextSibling: () => {
                        if (ii < itemTree.children.length - 1) {
                            itemsRefArray.current[ii + 1]?.focusThis()
                        } else {
                            itemsRefArray.current[ii]?.focusThis()
                        }
                    },
                    scrollThisIntoView: topLevelNullFunction
                },
                disableDelete: () => (itemTree.children.length == 1),
                getSetItems: (keys: string[], getSetter: TreeNodesGetSetter) => {
                    props.getSetTodoItems((_, keyedNodes) => {
                        const oldItems = keys.map(key => keyedNodes[key])
                        const newNodes = getSetter(oldItems);
                        const newRootNode = mergeKeyedNodesAndTree(newNodes, keyedNodes[virtualRootId]);
                        return newRootNode;
                    });
                },
                thisItem: itemTree
            })}
        ></Item >)
    })}</>
}

// TODO: move this function into the Model class, so that we can optimize it with the memory of the parents
const mergeKeyedNodesAndTree = (newNodes: ItemTreeNode[], oldRoot: ItemTreeNode): ItemTreeNode => {
    const newNodesByKey: Record<string, ItemTreeNode> = newNodes.reduce((nodesByKey, current) => {
        nodesByKey[current.id] = current;
        return nodesByKey;
    }, {} as Record<string, ItemTreeNode>)

    const newRootNode = newNodesByKey[virtualRootId] || oldRoot;

    const DFSStack: ItemTreeNode[] = [newRootNode];
    const cycleDetectionSet: Set<string> = new Set([virtualRootId]);
    while (DFSStack.length > 0) {
        const top = DFSStack.pop();
        if (top) {
            top.children = top.children.map((child) =>
                newNodesByKey[child.id] || child
            );
            top.children.forEach(child => {
                if (!cycleDetectionSet.has(child.id)) {
                    cycleDetectionSet.add(child.id);
                    DFSStack.push(child)
                }
            });
        }
    }
    return newRootNode;
}
