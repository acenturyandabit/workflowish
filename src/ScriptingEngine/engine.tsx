import { BaseStoreDataType, makeNewUniqueKey } from "~CoreDataLake";
import * as React from 'react';
import { BaseItemType } from "~CoreDataLake";
import getDiffsAndResolvedItems from "~CoreDataLake/getResolvedItems";
import stringify from 'json-stable-stringify';
import { FlatItemBlob, FlatItemData, ItemTreeNode, TransformedData, flattenItemNode} from "~Workflowish/mvc/model";
import { transformData as workflowishTransformData } from "~Workflowish/mvc/model";
export const ScriptEngineInstance = (props: {
    script: string,
    lastActivateTime?: number,
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const [, setStoredRecords] = React.useState(props.data);

    const handlers: UserScriptHandles | undefined = React.useMemo(() => {
        const userHasPressedRunButton = (props.lastActivateTime != undefined);
        if (userHasPressedRunButton) {
            return getHandlersFromUserScript({
                data: props.data,
                script: props.script,
                getSetData: setStoredRecords
            })
        } else {
            return undefined
        }
    }, [
        props.lastActivateTime
    ])
    React.useEffect(() => {
        if (handlers) {
            setStoredRecords((storedRecords) => {
                const { incomingDiffs } = getDiffsAndResolvedItems(props.data, storedRecords)
                const copiedIncomingDiffs = JSON.parse(JSON.stringify(incomingDiffs))
                const userModifiedItems = handlers.updateItems(copiedIncomingDiffs);
                const newData = { ...props.data };
                const modifiedKeysList: string[] = [];
                for (const key in userModifiedItems) {
                    const oldItem = props.data[key];
                    let concreteUserModifiedItems: BaseItemType = userModifiedItems[key] as BaseItemType
                    if (typeof userModifiedItems[key] == "function") {
                        const updateFunction = userModifiedItems[key] as ((oldData: BaseItemType) => BaseItemType);
                        concreteUserModifiedItems = updateFunction(oldItem);
                    }
                    if (!oldItem || stringify(concreteUserModifiedItems) != stringify(oldItem)) {
                        newData[key] = { ...concreteUserModifiedItems, lastModifiedUnixMillis: Date.now() }
                        modifiedKeysList.push(key);
                    }
                }
                if (modifiedKeysList.length) {
                    props.setData(newData);
                }
                return newData;
            })
        } else {
            setStoredRecords(props.data);
        }
    }, [props.data])
    return <></>
}

type UserScriptHandles = {
    updateItems: (incomingDiffs: BaseStoreDataType) => Record<string, DataUpdateOrFunction>
}

type DataUpdateOrFunction = BaseItemType | ((oldData: BaseItemType) => BaseItemType)
type UpdateItemHandler = (id: string, data: BaseItemType) => void;

const getHandlersFromUserScript = (props: {
    data: BaseStoreDataType,
    script: string,
    getSetData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}): UserScriptHandles => {
    let updatesStash: Record<string, DataUpdateOrFunction> = {};
    const handlerArrays = {
        updateItems: [] as UpdateItemHandler[]
    }
    const handlers: UserScriptHandles = {
        updateItems: (incomingDiffs: BaseStoreDataType): Record<string, DataUpdateOrFunction> => {
            for (const key in incomingDiffs) {
                handlerArrays.updateItems.forEach(handler => {
                    try {
                        handler(key, incomingDiffs[key]);
                    } catch (e) {
                        console.error(e);
                    }
                })
            }
            const _updatesStash = updatesStash;
            updatesStash = {};
            return _updatesStash;
        }
    }



    const scriptGlobals = {
        instance: {
            on: (eventUserListensTo: string, handler: UpdateItemHandler) => {
                if (eventUserListensTo == "updateItem") {
                    handlerArrays.updateItems.push(handler);
                }
            },
            updateItem: (id: string, dataOrFunction: DataUpdateOrFunction) => {
                updatesStash[id] = dataOrFunction
            },
            makeNewUniqueKey: makeNewUniqueKey
        },
        workflowish: {
            reparentItem: (id: string, newParent: string) => {
                props.getSetData((data) => {
                    const transformedData = workflowishTransformData(data as FlatItemBlob);
                    const childItem = data[id] as FlatItemData;
                    if (childItem) {
                        const lastParent = transformedData.parentById[id];
                        if (lastParent != newParent) {
                            if (lastParent) {
                                const oldParentItem = JSON.parse(JSON.stringify(data[lastParent])) as FlatItemData
                                oldParentItem.children.splice(oldParentItem.children.indexOf(id), 1);
                                updatesStash[lastParent] = oldParentItem;
                            }
                            const currentNewParentItem = data[newParent] as FlatItemData;
                            if (currentNewParentItem && currentNewParentItem.children) {
                                const newParentItem = JSON.parse(JSON.stringify(currentNewParentItem)) as FlatItemData;
                                newParentItem.children.push(id);
                                updatesStash[newParent] = newParentItem;
                            }
                        }
                    }
                    return data;
                })
            },
            createItem: (args: { text: string, parent?: string, id?: string }) => {
                props.getSetData((data) => {
                    const id = args.id || makeNewUniqueKey();
                    const newItem: FlatItemData = {
                        lastModifiedUnixMillis: Date.now(),
                        data: args.text,
                        children: [],
                        collapsed: false,
                    }
                    if (args.parent) {
                        const currentParentItem = data[args.parent] as FlatItemData;
                        if (currentParentItem && currentParentItem.children) {
                            const newParentItem = JSON.parse(JSON.stringify(currentParentItem)) as FlatItemData;
                            newParentItem.children.push(id);
                            updatesStash[args.parent] = newParentItem;
                        }
                    }
                    updatesStash[id] = newItem;
                    return data;
                });
            },
            setItemsByKey: (itemsToSet: Record<string, ItemTreeNode> | ((transformedData: TransformedData) => Record<string, ItemTreeNode>)) => {
                props.getSetData((data) => {
                    const transformedData = workflowishTransformData(data as FlatItemBlob);
                    let newItemsToSet: Record<string, ItemTreeNode>;
                    if (itemsToSet instanceof Function) {
                        newItemsToSet = itemsToSet(transformedData);
                    } else {
                        newItemsToSet = itemsToSet;
                    }
                    for (const key in newItemsToSet) {
                        updatesStash[key] = flattenItemNode(newItemsToSet[key]);
                    }
                    return data;
                })
            },
            makeRawItem: () => {
                const id = makeNewUniqueKey();
                const newItem: ItemTreeNode = {
                    id,
                    lastModifiedUnixMillis: Date.now(),
                    data: "",
                    children: [],
                    collapsed: false,
                    searchHighlight: []
                }
                return newItem;
            }
        }
    }
    const orderedGlobals = Object.entries(scriptGlobals);
    // This is optimised for easy access to some 'script globals'. IT IS NOT DESIGNED FOR SAFETY.
    const wrapped = `(function factory(${orderedGlobals.map(i => i[0]).join(",")}){
    ${props.script}
})`;
    try {
        const factoryFunction = window.eval(wrapped);
        factoryFunction(...Object.values(orderedGlobals.map(i => i[1])));
    } catch (e) {
        console.error(e);
    }
    return handlers;
}