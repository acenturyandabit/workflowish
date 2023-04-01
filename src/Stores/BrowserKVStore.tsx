import { DefaultKVConstructionArgs, KVStore, KVStoreSettingsStruct } from "./types";
import * as localforage from "localforage";
import * as React from "react";
import { TextField } from "@mui/material"
import { BaseStoreDataType } from "~CoreDataLake";

const BrowserKVStoreType = "Browser" as const;
export interface BrowserKVStoreSettings extends KVStoreSettingsStruct {
    type: typeof BrowserKVStoreType
    documentName: string
}

const isBrowserKVStoreSettings = (x: KVStoreSettingsStruct | DefaultKVConstructionArgs):
    x is BrowserKVStoreSettings => x?.type == BrowserKVStoreType

class BrowserKVStore implements
    KVStore<BrowserKVStoreSettings>{

    static type = BrowserKVStoreType

    settings: BrowserKVStoreSettings

    constructor(_settings: BrowserKVStoreSettings | DefaultKVConstructionArgs) {
        if (isBrowserKVStoreSettings(_settings)) {
            this.settings = _settings;
        } else {
            this.settings = {
                type: BrowserKVStoreType,
                documentName: ""
            };
        }
    }

    toJsonSettings() {
        return this.settings
    }

    makeFileDialog(bumpKVStores: () => void) {
        return (
            <>
                <h3>Browser KV Store Settings</h3>
                <TextField
                    label="Document name"
                    value={this.settings.documentName}
                    onChange={(evt) => {
                        this.settings.documentName = evt.target.value;
                        bumpKVStores();
                    }}
                    fullWidth
                />
            </>
        )
    }

    save(data: BaseStoreDataType) {
        localforage.setItem<BaseStoreDataType>(this.settings.documentName, data)
    }

    async load(): Promise<BaseStoreDataType> {
        const data = await localforage.getItem<BaseStoreDataType>(this.settings.documentName) ?? {}
        return data
    }

}

export default BrowserKVStore;