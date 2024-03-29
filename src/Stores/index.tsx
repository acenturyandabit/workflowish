import { DefaultKVConstructionArgs, KVStore, KVStoreConstructor, KVStoreSettingsStruct, ProactiveSetDataRef } from "./types";
import { v4 as uuid } from "uuid";
import BrowserKVStore from "./BrowserKVStore"
import HTTPStore from "./HTTPKVStore";
import TextImportKVStore from "./TextImportKVStore";

// I don't know what to google to get it to work without <any> :sad:
// best lead so far: https://stackoverflow.com/questions/46312206/narrowing-a-return-type-from-a-generic-discriminated-union-in-typescript
// eslint-disable-next-line
export const KVStores: Record<string, KVStoreConstructor<any>> = {
    [BrowserKVStore.type]: BrowserKVStore,
    [HTTPStore.type]: HTTPStore,
    [TextImportKVStore.type]: TextImportKVStore
}

export const makeKVStore = (type: string, proactiveSetData: ProactiveSetDataRef): KVStore<KVStoreSettingsStruct> => {
    const defaultArg: DefaultKVConstructionArgs = null;
    return innerMakeKVStore(KVStores[type], defaultArg, proactiveSetData);
}

const innerMakeKVStore = (ctor: KVStoreConstructor<KVStoreSettingsStruct>, args: KVStoreSettingsStruct | DefaultKVConstructionArgs, proactiveSetData: ProactiveSetDataRef) => {
    return new ctor(args, proactiveSetData);
}

export const makeDefaultKVStore = (proactiveSetData: ProactiveSetDataRef) => {
    return new KVStores[BrowserKVStore.type]({
        type: BrowserKVStore.type,
        documentName: uuid()
    }, proactiveSetData)
}