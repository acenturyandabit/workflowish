import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter, TreeNodesGetSetter } from "./mvc/controller";
import { FocusedActionReceiver, dummyFocusedActionReciever } from "./mvc/focusedActionReceiver"
import Item, { FocusActions } from "./Item"
import { ItemTreeNode, getTransformedDataAndSetter, TransformedDataAndSetter, virtualRootId, TransformedData } from "./mvc/model"
import { isMobile } from '~util/isMobile';
import { FloatyButtons } from "./Subcomponents/FloatyButtons";
import OmnibarWrapper from "./Subcomponents/OmnibarWrapper";
import ContextMenu from "./Subcomponents/ContextMenu";
import { ModelContext, RenderTimeContext } from "./mvc/context";

export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const transformedDataAndSetter = getTransformedDataAndSetter({ data: props.data, updateData: props.updateData });
    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>(dummyFocusedActionReciever);
    const itemsRefDictionary = React.useRef<Record<string, FocusActions>>({});
    const [lastFocusedItem, setLastFocusedItem] = React.useState<string>("");

    const [showIds, setShowIds] = React.useState<boolean>(false);
    React.useEffect(AltShouldToggleShowIds(setShowIds), []);

    return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <ContextMenu></ContextMenu>
        <ModelContext.Provider value={transformedDataAndSetter.transformedData.rootNode}>
            <div style={{ margin: "0 5px 10px 5px", flex: "1 0 auto" }}>
                <OmnibarWrapper
                    itemRefsDictionary={itemsRefDictionary.current}
                    transformedDataAndSetter={transformedDataAndSetter}
                    lastFocusedItem={lastFocusedItem}
                >
                    <ItemsList
                        showIds={showIds}
                        itemRefsDictionary={itemsRefDictionary.current}
                        setFocusedActionReceiver={setFocusedActionReceiver}
                        lastFocusedItem={lastFocusedItem}
                        setLastFocusedItem={setLastFocusedItem}
                        transformedDataAndSetter={transformedDataAndSetter}
                    ></ItemsList>
                </OmnibarWrapper>
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
        transformedDataAndSetter: TransformedDataAndSetter,
        lastFocusedItem: string,
        setLastFocusedItem: React.Dispatch<React.SetStateAction<string>>
        showIds: boolean
    }
) => {
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);
    const nullSizedArrayForRefs = Array(itemTree.children.length).fill(null);
    const topLevelNullFunction = () => {
        // Top level cannot take focus
    }

    const setFocusedItem = (focusedActionReceiver: FocusedActionReceiver, focusItemKey: string) => {
        props.setFocusedActionReceiver(focusedActionReceiver);
        props.setLastFocusedItem(focusItemKey);
    }

    const itemsRefArray = React.useRef<Array<FocusActions | null>>(nullSizedArrayForRefs);
    return <RenderTimeContext.Provider value={{
        currentFocusedItem: props.lastFocusedItem
    }}>{itemTree.children.map((item, ii) => {
        return (<Item
            key={ii}
            styleParams={{
                showId: props.showIds,
                emptyList: itemTree.children.length == 1 && item.data == ""
            }}
            item={item}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            pushRefGlobal={(ref: FocusActions, id: string) => { props.itemRefsDictionary[id] = ref }}
            setThisAsFocused={setFocusedItem}
            actions={makeListActions({
                siblingsFocusActions: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                    props.transformedDataAndSetter.setItemsByKey((oldData: TransformedData) => {
                        const newChildren = t(oldData.rootNode.children);
                        // There was an implicit constraint that the _ENTIRE TREE_ shall also be updated
                        // in the old fromTree-based getSetSiblingArray. When we delete getSetSiblingArray
                        // we should also delete this.
                        const nodeStack: ItemTreeNode[] = newChildren;
                        // initialize flatTree with the top level children + the virtualRoot
                        const flatTree: Record<string, ItemTreeNode> = newChildren.reduce((aggregate, itm) =>
                            ({ ...aggregate, [itm.id]: itm }), {} as Record<string, ItemTreeNode>);
                        flatTree[virtualRootId] = { ...oldData.rootNode, children: [...newChildren] }
                        while (nodeStack.length) {
                            const top = nodeStack.shift()
                            if (top) {
                                const noDuplicateChildren = top.children.filter(child => {
                                    if (child.id in flatTree) {
                                        // Log an error and ignore the duplicate
                                        console.error(`Duplicate node ${top.id}! Removing from this parent and moving on.`);
                                        return false;
                                    } else {
                                        flatTree[child.id] = child;
                                        nodeStack.push({ ...child, markedForCleanup: top.markedForCleanup || child.markedForCleanup })
                                        return true;
                                    }
                                });
                                if (noDuplicateChildren.length != top.children.length) {
                                    top.children = noDuplicateChildren;
                                    top.lastModifiedUnixMillis = Date.now();
                                }
                            }
                        }
                        return flatTree;
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
                    props.transformedDataAndSetter.setItemsByKey((oldData: TransformedData) => {
                        // TODO: Remove all instances of this getSetItems interface and replace it with just setItemsByKey
                        const oldItems = keys.map(key => oldData.keyedNodes[key])
                        const newNodes = getSetter(oldItems);
                        return newNodes.reduce((nodeDict, node) => {
                            nodeDict[node.id] = node;
                            return nodeDict;
                        }, {} as Record<string, ItemTreeNode>);
                    });
                },
                thisItem: itemTree
            })}
        ></Item >)
    })}</RenderTimeContext.Provider>
}