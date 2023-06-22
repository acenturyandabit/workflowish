import * as React from 'react'
import * as localforage from "localforage";
import { KVStore, KVStoreSettingsStruct } from './types';
import { KVStores, makeDefaultKVStore } from '~Stores';


const CURRENT_LOCAL_STORE_STORES_VERSION = 1;
type LocallyStoredStoresInformation = {
    version: typeof CURRENT_LOCAL_STORE_STORES_VERSION,
    stores: KVStoreSettingsStruct[],
    autosaveOn: boolean
}

export type KVStoresAndLoadedState = {
    stores: KVStore<KVStoreSettingsStruct>[],
    loaded: boolean,
    autosaveOn: boolean
}

export const useKVStoresList = (): [
    KVStoresAndLoadedState,
    React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>
] => {
    const [kvStores, setKVStores] = React.useState<KVStoresAndLoadedState>({
        loaded: false,
        stores: [],
        autosaveOn: false
    })
    React.useEffect(() => {
        (async () => {
            const storeSettings = upgradeToLatestVersion(
                await localforage.getItem("stores")
            );
            if (storeSettings) {
                setKVStores(activate(storeSettings))
            } else {
                setKVStores({
                    stores: [
                        makeDefaultKVStore()
                    ],
                    autosaveOn: false,
                    loaded: true
                })
            }
        })();
    }, [])
    
    React.useEffect(() => {
        if (kvStores.loaded) {
            if (kvStores.stores.length == 0) {
                if (confirm("This document doesn't seem to save anywhere... do you want to save your results to the browser? Otherwise you will lose all your changes!")) {
                    kvStores.stores.push(makeDefaultKVStore());
                }
            }
            localforage.setItem<LocallyStoredStoresInformation>("stores", passivate(kvStores));
        }
    }, [kvStores])
    return [kvStores, setKVStores];
}

const upgradeToLatestVersion = (input: unknown): LocallyStoredStoresInformation | null => {
    if (input != null) {
        if (input instanceof Array) {
            // pre version 1 type
            return {
                version: 1,
                stores: input,
                autosaveOn: false
            }
        } else if (typeof input == "object" && "version" in input) {
            if (input.version == CURRENT_LOCAL_STORE_STORES_VERSION){
                return input as LocallyStoredStoresInformation;
            }else{
                throw Error("Unknown (possibly future) version. Refusing to make changes that may affect user data.")
            }
        } else {
            // should not reach here
            throw Error("Local Store Source Records corrupted. Refusing to make changes that may affect user data.")
        }
    } else {
        return null;
    }
}

const activate = (input: LocallyStoredStoresInformation): KVStoresAndLoadedState => {
    const activated: KVStoresAndLoadedState = {
        autosaveOn: input.autosaveOn,
        stores: input.stores.map(storeSetting => new KVStores[storeSetting.type](storeSetting)),
        loaded: true
    }
    return activated
}

const passivate = (input: KVStoresAndLoadedState): LocallyStoredStoresInformation => {
    const passivated: LocallyStoredStoresInformation = {
        version: 1,
        stores: input.stores.map(storeInstance => storeInstance.toJsonSettings()),
        autosaveOn: input.autosaveOn
    }
    return passivated;
}