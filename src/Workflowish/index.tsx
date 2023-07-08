import * as React from "react";
import { BaseStoreDataType } from "~CoreDataLake";
import { makeItemActions } from "./mvc/controller";
import { FocusedActionReceiver, dummyFocusedActionReceiver } from "./mvc/focusedActionReceiver"
import Item, { ItemRef } from "./Item"
import { ItemTreeNode, getTransformedDataAndSetter, TransformedDataAndSetter } from "./mvc/model"
import { isMobile } from '~util/isMobile';
import { FloatyButtons } from "./Subcomponents/FloatyButtons";
import OmnibarWrapper from "./Subcomponents/OmnibarWrapper";
import ContextMenu from "./Subcomponents/ContextMenu";
import { ModelContext, RenderTimeContext } from "./mvc/context";
import { DFSFocusManager, FocusRequest, IdAndFocusPath } from "./mvc/DFSFocus";

export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const transformedDataAndSetter = getTransformedDataAndSetter({ data: props.data, updateData: props.updateData });
    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>(dummyFocusedActionReceiver);
    const itemsRefDictionary = React.useRef<Record<string, ItemRef>>({});
    const [lastFocusedItem, setLastFocusedItem] = React.useState<IdAndFocusPath>({ id: "", treePath: [] });

    // ref needed so that callbacks will not access old copies of dfsFocusManager, leading to new items being unselectable
    const focusManager = React.useRef(new DFSFocusManager(setLastFocusedItem));
    focusManager.current.updateSetLastFocusedItem(setLastFocusedItem); // needed otherwise setLastFocusedItem gets outdated when alt-up used

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
    if (transformedDataAndSetter.readyForEdits) {
        return <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <ContextMenu></ContextMenu>
            <ModelContext.Provider value={transformedDataAndSetter.transformedData.rootNode}>
                <div style={{ margin: "0 5px 10px 5px", flex: "1 0 auto" }}>
                    <OmnibarWrapper
                        itemRefsDictionary={itemsRefDictionary.current}
                        transformedDataAndSetter={transformedDataAndSetter}
                        lastFocusedItem={lastFocusedItem}
                        dfsFocusManager={focusManager.current}
                    >
                        <ItemsList
                            showIds={showIds}
                            itemRefsDictionary={itemsRefDictionary.current}
                            setFocusedActionReceiver={setFocusedActionReceiver}
                            lastFocusedItem={lastFocusedItem}
                            setLastFocusedItem={setLastFocusedItem}
                            dfsFocusManager={focusManager}
                            transformedDataAndSetter={transformedDataAndSetter}
                        ></ItemsList>
                    </OmnibarWrapper>
                </div>
            </ModelContext.Provider>
            {isMobile() ? <FloatyButtons focusedActionReceiver={focusedActionReceiver}></FloatyButtons> : null}
        </div>
    } else {
        return <div>Loading...</div>
    }
};


const ItemsList = (
    props: {
        setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>,
        itemRefsDictionary: Record<string, ItemRef>,
        transformedDataAndSetter: TransformedDataAndSetter,
        lastFocusedItem: IdAndFocusPath,
        dfsFocusManager: React.MutableRefObject<DFSFocusManager>,
        setLastFocusedItem: React.Dispatch<React.SetStateAction<IdAndFocusPath>>
        showIds: boolean
    }
) => {
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);
    const focusManager = props.dfsFocusManager;

    focusManager.current?.emptyThis();
    const setFocusedItem = (focusedActionReceiver: FocusedActionReceiver, focusItemKey: IdAndFocusPath) => {
        props.setFocusedActionReceiver(focusedActionReceiver);
        props.setLastFocusedItem(focusItemKey);
    }


    const itemToFocus = React.useRef<FocusRequest | undefined>();
    React.useEffect(() => {
        if (itemToFocus.current) {
            focusManager.current?.focusItem(itemToFocus.current);
            itemToFocus.current = undefined;
        }
    })

    const rootPath = [0];
    return <RenderTimeContext.Provider value={{
        currentFocusedItem: props.lastFocusedItem
    }}>{itemTree.children.map((item, ii) => {
        const treePath = focusManager.current.childPath(rootPath, ii);
        return (<Item
            key={ii}
            styleParams={{
                showId: props.showIds,
                emptyList: itemTree.children.length == 1 && item.data == "",
                symlinkedParents: []
            }}
            item={item}
            pushRef={(id: string, ref: ItemRef) => props.itemRefsDictionary[id] = ref}
            setThisAsFocused={setFocusedItem}
            actions={makeItemActions({
                focusManager: focusManager,
                treePath,
                disableDelete: () => (itemTree.children.length == 1),
                thisItem: item,
                thisPossiblySymlinkedParent: itemTree,
                setToFocusAfterUpdate: (focusRequest: FocusRequest) => { itemToFocus.current = focusRequest },
                model: props.transformedDataAndSetter,
            })}
            focusManager={focusManager}
            treePath={treePath}
            model={props.transformedDataAndSetter}
        ></Item >)
    })}</RenderTimeContext.Provider>
}