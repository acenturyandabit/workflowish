import { BaseStoreDataType, TaggedBaseStoreDataType } from "~CoreDataLake";
export const DATA_SCHEMA_VERSION = "4.1.0";

export const updateVersion = (data: BaseStoreDataType): TaggedBaseStoreDataType => {
    if (!data["_meta"]) {
        data._meta = {
            version: "",
            _lm: 0
        }
    }
    let taggedData = data as TaggedBaseStoreDataType;
    while (taggedData._meta.version != DATA_SCHEMA_VERSION) {
        taggedData = versionUpdaters[taggedData._meta.version](taggedData);
    }
    return taggedData;
}

// use Map for the key order guarantee
const versionUpdaters: Record<string, (data: TaggedBaseStoreDataType) => TaggedBaseStoreDataType> = {
    "": (data: TaggedBaseStoreDataType) => {
        data._meta = {
            version: "4.1.0",
            _lm: 0
        }
        for (const item in data){
            if (data[item].lastModifiedUnixMillis){
                data[item]._lm = data[item].lastModifiedUnixMillis as number;
                delete data[item].lastModifiedUnixMillis;
            }
        }
        return data;
    }
}