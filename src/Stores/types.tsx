import { BaseStoreDataType } from "~CoreDataLake"

export interface KVStoreSettingsStruct {
    type: string,
    [key: string]: unknown
}

export interface KVStoreConstructor<SettingsStruct extends KVStoreSettingsStruct> {
    new(settings: SettingsStruct | DefaultKVConstructionArgs): KVStore<SettingsStruct>
}

export type DefaultKVConstructionArgs = null;
export interface KVStore<SettingsStruct extends KVStoreSettingsStruct> {
    save: (data: BaseStoreDataType) => void,
    load: () => Promise<BaseStoreDataType>,
    makeFileDialog: (bumpKVStores: () => void) => React.ReactElement,
    toJsonSettings: () => SettingsStruct,
}

