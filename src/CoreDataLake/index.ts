import * as React from 'react';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import getDiffsAndResolvedItems from './getResolvedItems';
import { generateFirstTimeWorkflowishDoc } from '~Workflowish/mvc/firstTimeDoc';
import { fromTree } from '~Workflowish/mvc/model';
import { DATA_SCHEMA_VERSION, updateVersion } from './versions';


export type BaseItemType = {
    _lm: number,
    [key: string]: unknown
}

export type BaseStoreDataType = {
    [key: string]: BaseItemType
}

export type TaggedBaseStoreDataType = BaseStoreDataType & {
    _meta: {
        version: string,
        _lm: number
    }
}

export type BaseDeltaType = {
    key: string,
    from?: BaseItemType
    to?: BaseItemType
}

export type DataAndLoadState = {
    data: TaggedBaseStoreDataType,
    replayBuffer: BaseDeltaType[],
    loaded: boolean,
    changed: boolean
}

export type UpdateDataAction = (newDataOrGetter: BaseStoreDataType | ((data: TaggedBaseStoreDataType) => BaseStoreDataType)) => void

export const generateFirstTimeDoc = (): TaggedBaseStoreDataType => {
    return {
        ...fromTree(generateFirstTimeWorkflowishDoc()),
        ...newBlankDoc()
    };
}

let uniqueCounter = 0;
let uniqueKeyGenerator = (): string => {
    uniqueCounter++;
    return Date.now().toString() + `_${uniqueCounter}`;
}
export const makeNewUniqueKey = (): string => {
    return uniqueKeyGenerator()
}

export const jestSetMakeUniqueKey = (_uniqueKeyGenerator: () => string) => {
    // esbuild doesn't allow Jest to mock exported functions; so we use a setter here
    uniqueKeyGenerator = _uniqueKeyGenerator;
}

export const setToDeleted = (itm: BaseItemType) => {
    for (const key in itm) {
        if (key != "_lm") {
            delete itm[key];
        }
    }
    itm._lm = Date.now();
}

export const newBlankDoc = (): TaggedBaseStoreDataType => {
    return {
        _meta: {
            version: DATA_SCHEMA_VERSION,
            _lm: 0
        }
    }
}

export const useCoreDataLake = (kvStores: KVStoresAndLoadedState): {
    dataAndLoadState: DataAndLoadState,
    updateData: UpdateDataAction,
    doSave: () => void,
} => {
    const [dataAndLoadState, setDataAndLoadState] = React.useState<DataAndLoadState>({
        loaded: false,
        changed: false,
        replayBuffer: [],
        data: newBlankDoc()
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
                                ...dataAndLoadState,
                                data: mergedDoc,
                                loaded: true,
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
                        return updateVersion(await i.load());
                    } catch (e) {
                        return newBlankDoc()
                    }
                }));
                if (documentsToBeMerged.length == 0) {
                    documentsToBeMerged.push(generateFirstTimeDoc());
                }

                setDataAndLoadState((dataAndLoadState) => ({
                    ...dataAndLoadState,
                    loaded: true,
                    changed: false,
                    data: resolveAllDocuments(documentsToBeMerged)
                }));
            }
        })()
    }, [kvStores, dataAndLoadState])

    React.useEffect(() => {
        const autoSaveThrottleTimeout = setTimeout(() => {
            doSave();
        }, 3000);
        return () => clearTimeout(autoSaveThrottleTimeout);
    }, [kvStores, dataAndLoadState, doSave])

    const updateData = (newDataOrGetter: BaseStoreDataType | ((data: TaggedBaseStoreDataType) => BaseStoreDataType)) => {
        setDataAndLoadState(olddataAndLoadState => {
            let dataToSet: BaseStoreDataType;
            if (newDataOrGetter instanceof Function) {
                dataToSet = newDataOrGetter({ ...olddataAndLoadState.data });
            } else {
                dataToSet = newDataOrGetter;
            }
            const { resolved, deltas } = getDiffsAndResolvedItems(dataToSet, olddataAndLoadState.data);
            const newReplayBuffer = [...olddataAndLoadState.replayBuffer, ...deltas]
            return {
                ...olddataAndLoadState,
                replayBuffer: newReplayBuffer,
                data: resolved,
                changed: true
            }
        })
    }
    const _window = window as unknown as Record<string, DataAndLoadState>;
    _window["dataAndLoadState"] = dataAndLoadState;
    return { dataAndLoadState, updateData, doSave }
}

export const resolveAllDocuments = <DocType extends BaseStoreDataType,>(documents: DocType[]): DocType => {
    const mergedDocument: DocType = documents.reduce((mergedDoc, newDoc) => {
        const { resolved } = getDiffsAndResolvedItems(mergedDoc, newDoc);
        return resolved;
    }, {} as DocType)

    return mergedDocument
}
