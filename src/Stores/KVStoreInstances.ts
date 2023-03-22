import * as React from 'react'
import * as localforage from "localforage";
import { KVStore, KVStoreSettingsStruct } from './types';
import { KVStores, makeDefaultKVStore } from '~Stores';

export type KVStoresAndLoadedState = {
    stores: KVStore<KVStoreSettingsStruct>[],
    loaded: boolean
}

export const useKVStoresList = (): [
    KVStoresAndLoadedState,
    React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>
] => {
    const [kvStores, setKVStores] = React.useState<KVStoresAndLoadedState>({
        loaded: false,
        stores: []
    })
    React.useEffect(() => {
        // Hack: Global variable to ensure we only load once
        (async () => {
            const storeSettings = await localforage.getItem<Array<KVStoreSettingsStruct>>("stores");
            if (storeSettings) {
                setKVStores({
                    stores: storeSettings.map((storeSetting) => {
                        return new KVStores[storeSetting.type](storeSetting);
                    }),
                    loaded: true
                })
            } else {
                setKVStores({
                    stores: [
                        makeDefaultKVStore()
                    ],
                    loaded: true
                })
            }
        })();
    }, [])

    React.useEffect(() => {
        if (kvStores.loaded) {
            localforage.setItem<Array<KVStoreSettingsStruct>>("stores", kvStores.stores.map(i => i.toJsonSettings()));
        }
    }, [kvStores])
    return [kvStores, setKVStores];
}