import { BaseStoreDataType } from "~CoreDataLake"

export interface KVStoreSettingsStruct {
    type: string,
    [key: string]: unknown
}

export interface KVStoreConstructor<SettingsStruct extends KVStoreSettingsStruct> {
    new(settings: SettingsStruct | DefaultKVConstructionArgs): KVStore<SettingsStruct>,
    type: string
}

export type DefaultKVConstructionArgs = null;
export interface KVStore<SettingsStruct extends KVStoreSettingsStruct> {
    save: (data: BaseStoreDataType) => void,
    sync?: (data: BaseStoreDataType) => Promise<BaseStoreDataType>,
    load: () => Promise<BaseStoreDataType>,
    makeFileDialog: (bumpKVStores: () => void) => React.ReactElement,
    toJsonSettings: () => SettingsStruct,
}

