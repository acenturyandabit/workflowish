import { DefaultKVConstructionArgs, KVStore, KVStoreConstructor, KVStoreSettingsStruct } from "./types";

import BrowserKVStore from "./BrowserKVStore"
import HTTPStore from "./HTTPStore";

// I don't know what to google to get it to work without <any> :sad:
// best lead so far: https://stackoverflow.com/questions/46312206/narrowing-a-return-type-from-a-generic-discriminated-union-in-typescript
// eslint-disable-next-line
export const KVStores: Record<string, KVStoreConstructor<any>> = {
    [BrowserKVStore.type]: BrowserKVStore,
    [HTTPStore.type]: HTTPStore
}

export const makeKVStore = (type: string): KVStore<KVStoreSettingsStruct> => {
    const defaultArg: DefaultKVConstructionArgs = null;
    return innerMakeKVStore(KVStores[type], defaultArg);
}

const innerMakeKVStore = (ctor: KVStoreConstructor<KVStoreSettingsStruct>, args: KVStoreSettingsStruct | DefaultKVConstructionArgs) => {
    return new ctor(args);
}

export const makeDefaultKVStore = () => {
    return new KVStores[BrowserKVStore.type]({
        type: BrowserKVStore.type,
        documentName: "default"
    })
}