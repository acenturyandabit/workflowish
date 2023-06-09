import * as React from 'react';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import getDiffsAndResolvedItems from './getResolvedItems';
import { generateFirstTimeWorkflowishDoc } from '~Workflowish/mvc/firstTimeDoc';
import { fromTree } from '~Workflowish/mvc/model';
export type BaseItemType = {
    lastModifiedUnixMillis: number,
    [key: string]: unknown
}
export type BaseStoreDataType = {
    [key: string]: BaseItemType
}

export type DataAndLoadState = {
    data: BaseStoreDataType,
    loaded: boolean,
    changed: boolean
}

export const generateFirstTimeDoc = (): BaseStoreDataType => {
    return fromTree(generateFirstTimeWorkflowishDoc());
}

let uniqueCounter = 0;
export const makeNewUniqueKey = (): string => {
    uniqueCounter++;
    return Date.now().toString() + `_${uniqueCounter}`;
}

export const setToDeleted = (itm: BaseItemType) => {
    for (const key in itm) {
        if (key != "lastModifiedUnixMillis") {
            delete itm[key];
        }
    }
    itm.lastModifiedUnixMillis = Date.now();
}

export const useCoreDataLake = (kvStores: KVStoresAndLoadedState): [
    DataAndLoadState,
    React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
    () => void
] => {
    const [dataAndLoadState, setDataAndLoadState] = React.useState<DataAndLoadState>({
        loaded: false,
        changed: false,
        data: {}
    });

    const doSave = React.useCallback(() => {
        setDataAndLoadState((dataAndLoadState) => {
            if (kvStores.loaded && dataAndLoadState.loaded && dataAndLoadState.changed) {
                // todo: use await or otherwise set the success state _after_ save has occurred 
                // successfully.
                kvStores.stores.forEach(async i => {
                    if (i.sync) {
                        const syncedDoc = await i.sync(dataAndLoadState.data)
                        setDataAndLoadState((dataAndLoadState) => {
                            const mergedDoc = resolveAllDocuments([syncedDoc, dataAndLoadState.data]);
                            return {
                                data: mergedDoc,
                                loaded: true,
                                changed: dataAndLoadState.changed
                            }
                        })
                    } else {
                        i.save(dataAndLoadState.data)
                    }
                });
                return { ...dataAndLoadState, changed: false }
            } else {
                // No need to update entire component tree
                return dataAndLoadState;
            }
        })
    }, [kvStores])

    React.useEffect(() => {
        (async () => {
            if (kvStores.loaded && !dataAndLoadState.loaded) {

                const documentsToBeMerged = await Promise.all(kvStores.stores.map(async i => {
                    try {
                        return await i.load();
                    } catch (e) {
                        return {}
                    }
                }));
                if (documentsToBeMerged.length == 0) {
                    documentsToBeMerged.push(generateFirstTimeDoc());
                }

                setDataAndLoadState({
                    loaded: true,
                    changed: false,
                    data: resolveAllDocuments(documentsToBeMerged)
                });
            }
        })()
    }, [kvStores, dataAndLoadState])

    React.useEffect(() => {
        const autoSaveThrottleTimeout = setTimeout(() => {
            doSave();
        }, 3000);
        return () => clearTimeout(autoSaveThrottleTimeout);
    }, [kvStores, dataAndLoadState, doSave])

    const updateData = (data: BaseStoreDataType |
        ((currentData: BaseStoreDataType) => BaseStoreDataType)) => {
        setDataAndLoadState(olddataAndLoadState => {
            let dataToSet: BaseStoreDataType;
            if (data instanceof Function) {
                dataToSet = data(olddataAndLoadState.data);
            } else {
                dataToSet = data;
            }
            dataToSet = resolveAllDocuments([dataToSet, olddataAndLoadState.data]);
            return {
                ...olddataAndLoadState,
                data: dataToSet,
                changed: true
            }
        })
    }
    const _window = window as unknown as Record<string, DataAndLoadState>;
    _window["dataAndLoadState"] = dataAndLoadState;
    return [dataAndLoadState, updateData, doSave]
}

export const resolveAllDocuments = (documents: BaseStoreDataType[]): BaseStoreDataType => {
    const mergedDocument: BaseStoreDataType = documents.reduce((mergedDoc, newDoc) => {
        const { resolved } = getDiffsAndResolvedItems(mergedDoc, newDoc);
        return resolved;
    }, {})

    return mergedDocument
}
