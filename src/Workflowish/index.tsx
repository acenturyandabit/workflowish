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
import { DFSFocusManager } from "./mvc/DFSFocus";

export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const transformedDataAndSetter = getTransformedDataAndSetter({ data: props.data, updateData: props.updateData });
    const [focusedActionReceiver, setFocusedActionReceiver] = React.useState<FocusedActionReceiver>(dummyFocusedActionReceiver);
    const itemsRefDictionary = React.useRef<Record<string, ItemRef>>({});
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
        itemRefsDictionary: Record<string, ItemRef>,
        transformedDataAndSetter: TransformedDataAndSetter,
        lastFocusedItem: string,
        setLastFocusedItem: React.Dispatch<React.SetStateAction<string>>
        showIds: boolean
    }
) => {
    const itemTree = React.useContext<ItemTreeNode>(ModelContext);

    // ref needed so that callbacks will not access old copies of dfsFocusManager, leading to new items being unselectable
    const focusManager = React.useRef(new DFSFocusManager());
    focusManager.current?.emptyThis();
    const setFocusedItem = (focusedActionReceiver: FocusedActionReceiver, focusItemKey: string) => {
        props.setFocusedActionReceiver(focusedActionReceiver);
        props.setLastFocusedItem(focusItemKey);
    }

    
    const itemToFocus = React.useRef<string | undefined>();
    React.useEffect(()=>{
        if (itemToFocus.current) {
            focusManager.current?.focusItem(itemToFocus.current);
            itemToFocus.current = undefined;
        }
    })

    const rootPath = [0];
    return <RenderTimeContext.Provider value={{
        currentFocusedItem: props.lastFocusedItem
    }}>{itemTree.children.map((item, ii) => {
        const treePath = focusManager.current?.childPath(rootPath, ii);
        return (<Item
            key={ii}
            styleParams={{
                showId: props.showIds,
                emptyList: itemTree.children.length == 1 && item.data == ""
            }}
            item={item}
            pushRef={(id: string, ref: ItemRef) => props.itemRefsDictionary[id] = ref}
            setThisAsFocused={setFocusedItem}
            actions={makeItemActions({
                focusManager: focusManager,
                treePath,
                disableDelete: () => (itemTree.children.length == 1),
                thisItem: item,
                setToFocusAfterUpdate: (id: string) => { itemToFocus.current = id },
                model: props.transformedDataAndSetter,
            })}
            focusManager={focusManager}
            treePath={treePath}
            model={props.transformedDataAndSetter}
        ></Item >)
    })}</RenderTimeContext.Provider>
}