import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeListActions, TreeNodeArrayGetSetter, TreeNodesGetSetter } from "./mvc/controller";
import { FocusedActionReceiver, dummyFocusedActionReciever } from "./mvc/focusedActionReceiver"
import Item, { FocusActions } from "./Item"
import { ItemTreeNode, getTransformedDataAndSetter, TransformedDataAndSetter, virtualRootId, TransformedData, makeNewItem } from "./mvc/model"
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
    }, []);

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
                                let foundDuplicate = false;
                                const noDuplicateChildren = top.children.map((child): ItemTreeNode => {
                                    if (child.id in flatTree) {
                                        console.error(`Duplicate node ${top.id}! Making into a symlink and moving on.`);
                                        const newItem = makeNewItem();
                                        newItem.data = `[LN: ${child.id}]`;
                                        foundDuplicate = true;
                                        flatTree[newItem.id] = newItem;
                                        return newItem;
                                    } else {
                                        flatTree[child.id] = child;
                                        nodeStack.push({ ...child, markedForCleanup: top.markedForCleanup || child.markedForCleanup })
                                        return child;
                                    }
                                });
                                if (foundDuplicate) {
                                    flatTree[top.id] = {
                                        ...flatTree[top.id],
                                        children: noDuplicateChildren,
                                        lastModifiedUnixMillis: Date.now()
                                    }
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
                            // another implicit constraint that the _ENTIRE TREE_ shall also be updated
                            const nodeStack = [node];
                            while (nodeStack.length) {
                                const top = nodeStack.shift()
                                if (top && top.children) {
                                    const subtreeUniquenessRecord: Record<string, boolean> = {};
                                    let foundDuplicate = false;
                                    const noDuplicateChildren = top.children.map((child): ItemTreeNode => {
                                        if (child.id in subtreeUniquenessRecord) {
                                            console.error(`Duplicate node ${top.id}! Making into a symlink and moving on.`);
                                            const newItem = makeNewItem();
                                            newItem.data = `[LN: ${child.id}]`;
                                            nodeDict[newItem.id] = newItem;
                                            foundDuplicate = true;
                                            return newItem;
                                        } else {
                                            nodeDict[child.id] = child;
                                            subtreeUniquenessRecord[child.id] = true;
                                            nodeStack.push({ ...child, markedForCleanup: top.markedForCleanup || child.markedForCleanup })
                                            return child;
                                        }
                                    });
                                    if (foundDuplicate) {
                                        top.children = noDuplicateChildren;
                                        top.lastModifiedUnixMillis = Date.now();
                                    }
                                }
                            }
                            return nodeDict;
                        }, {} as Record<string, ItemTreeNode>);
                    });
                },
                thisItem: itemTree
            })}
        ></Item >)
    })}</RenderTimeContext.Provider>
}