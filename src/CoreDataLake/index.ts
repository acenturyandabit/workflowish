import * as React from 'react';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import getDiffsAndResolvedItems from './getResolvedItems';
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

export const makeNewUniqueKey = (): string => {
    return Date.now().toString();
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
                // todo: use await or otherwise set the success state after save has occurred 
                // successfully.
                kvStores.stores.forEach(i => i.save(dataAndLoadState.data));
            }
            return { ...dataAndLoadState, changed: false }
        })
    }, [kvStores])

    React.useEffect(() => {
        (async () => {
            if (kvStores.loaded && !dataAndLoadState.loaded) {
                const allDocuments = await Promise.all(kvStores.stores.map(async i => {
                    try {
                        return await i.load();
                    } catch (e) {
                        return {}
                    }
                }));

                setDataAndLoadState({
                    loaded: true,
                    changed: false,
                    data: resolveAllDocuments(allDocuments)
                });
            }
        })()
    }, [kvStores, dataAndLoadState])

    const setData = (data: BaseStoreDataType |
        ((currentData: BaseStoreDataType) => BaseStoreDataType)) => {
        setDataAndLoadState(olddataAndLoadState => {
            let dataToSet: BaseStoreDataType;
            if (data instanceof Function) {
                dataToSet = data(olddataAndLoadState.data);
            } else {
                dataToSet = data;
            }
            return {
                ...olddataAndLoadState,
                data: dataToSet,
                changed: true
            }
        })
    }
    return [dataAndLoadState, setData, doSave]
}

const resolveAllDocuments = (documents: BaseStoreDataType[]): BaseStoreDataType => {
    const mergedDocument: BaseStoreDataType = documents.reduce((mergedDoc, newDoc) => {
        const { resolved } = getDiffsAndResolvedItems(mergedDoc, newDoc);
        return resolved;
    }, {})

    return mergedDocument
}
