import { BaseStoreDataType } from "~CoreDataLake";
import * as React from 'react';
import { BaseItemType } from "~CoreDataLake";
import getDiffsAndResolvedItems from "~CoreDataLake/getResolvedItems";
import stringify from 'json-stable-stringify';
import { FlatItemData } from "~Workflowish/mvc/model";
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
                script: props.script,
                setData: setStoredRecords
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
                    if (!oldItem || stringify(userModifiedItems[key]) != stringify(oldItem)) {
                        newData[key] = { ...userModifiedItems[key], lastModifiedUnixMillis: Date.now() }
                        modifiedKeysList.push(key);
                    }
                }
                if (modifiedKeysList.length) {
                    props.setData(newData);
                }
                return newData;
            })
        }else{
            setStoredRecords(props.data);
        }
    }, [props.data])
    return <></>
}

type UserScriptHandles = {
    updateItems: (incomingDiffs: BaseStoreDataType) => BaseStoreDataType
}

type UpdateItemHandler = (id: string, data: BaseItemType) => void;

const getHandlersFromUserScript = (props: {
    script: string,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}): UserScriptHandles => {
    let updatesStash: BaseStoreDataType = {};
    const handlerArrays = {
        updateItems: [] as UpdateItemHandler[]
    }
    const handlers: UserScriptHandles = {
        updateItems: (incomingDiffs: BaseStoreDataType): BaseStoreDataType => {
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
            updateItem: (id: string, data: BaseItemType) => {
                updatesStash[id] = {
                    ...data
                }
            }
        },
        workflowish: {
            reparentItem: (id: string, newParent: string) => {
                props.setData((data) => {
                    const childItem = data[id] as FlatItemData;
                    if (childItem) {
                        const lastParent = childItem.lastRememberedParent;
                        if (lastParent != newParent){
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