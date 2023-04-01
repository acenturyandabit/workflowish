import { DefaultKVConstructionArgs, KVStore, KVStoreSettingsStruct } from "./types";
import * as React from "react";
import { TextField } from "@mui/material"
import { BaseStoreDataType } from "~CoreDataLake";

const HTTPKVStoreType = "HTTPStore" as const;
export interface HTTPKVStoreSettings extends KVStoreSettingsStruct {
    type: typeof HTTPKVStoreType
    saveURL: string
    loadURL: string
    syncURL: string
}

const isHTTPKVStoreSettings = (x: KVStoreSettingsStruct | DefaultKVConstructionArgs):
    x is HTTPKVStoreSettings => x?.type == HTTPKVStoreType



class HTTPKVStore implements
    KVStore<HTTPKVStoreSettings>{
    settings: HTTPKVStoreSettings
    static type = HTTPKVStoreType

    constructor(_settings: HTTPKVStoreSettings | DefaultKVConstructionArgs) {
        if (isHTTPKVStoreSettings(_settings)) {
            this.settings = _settings;
        } else {
            this.settings = {
                type: HTTPKVStoreType,
                saveURL: "",
                loadURL: "",
                syncURL: ""
            };
        }
        this.sync = this.sync.bind(this)
    }

    toJsonSettings() {
        return this.settings
    }

    makeFileDialog(bumpKVStores: () => void) {
        return (
            <>
                <h3>HTTP Store Settings</h3>
                <TextField
                    sx={{ mb: 2 }}
                    label="Save URL"
                    value={this.settings.saveURL}
                    fullWidth
                    onChange={(evt) => {
                        this.settings.saveURL = evt.target.value;
                        bumpKVStores();
                    }}
                />
                <br></br>
                <TextField
                    sx={{ mb: 2 }}
                    label="Load URL"
                    value={this.settings.loadURL}
                    fullWidth
                    onChange={(evt) => {
                        this.settings.loadURL = evt.target.value;
                        bumpKVStores();
                    }}
                />
                <br></br>
                <TextField
                    label="Sync URL"
                    value={this.settings.syncURL}
                    fullWidth
                    onChange={(evt) => {
                        this.settings.syncURL = evt.target.value;
                        bumpKVStores();
                    }}
                />
            </>
        )
    }

    save(data: BaseStoreDataType) {
        fetch(this.settings.saveURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
    }

    async sync(data: BaseStoreDataType): Promise<BaseStoreDataType> {
        const response = fetch(this.settings.syncURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        return await (await response).json()
    }

    async load(): Promise<BaseStoreDataType> {
        const response = await fetch(this.settings.loadURL);
        return await response.json();
    }
}
export default HTTPKVStore