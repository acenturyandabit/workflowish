import { TaggedBaseStoreDataType } from "~CoreDataLake"

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
    save: (data: TaggedBaseStoreDataType) => void,
    sync?: (data: TaggedBaseStoreDataType) => Promise<TaggedBaseStoreDataType>,
    load: () => Promise<TaggedBaseStoreDataType>,
    makeFileDialog: (bumpKVStores: () => void) => React.ReactElement,
    toJsonSettings: () => SettingsStruct,
}

