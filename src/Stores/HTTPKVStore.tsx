import { DefaultKVConstructionArgs, KVStore, KVStoreSettingsStruct } from "./types";
import * as React from "react";
import { TextField } from "@mui/material"
import { BaseStoreDataType } from "~CoreDataLake";

const HTTPKVStoreType = "HTTPStore" as const;
export interface HTTPKVStoreSettings extends KVStoreSettingsStruct {
    type: typeof HTTPKVStoreType
    saveURL: string
    loadURL: string
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
                loadURL: ""
            };
        }
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
                    label="Load URL"
                    value={this.settings.loadURL}
                    fullWidth
                    onChange={(evt) => {
                        this.settings.loadURL = evt.target.value;
                        bumpKVStores();
                    }}
                />
            </>
        )
    }

    save(data: BaseStoreDataType) {
        console.log(data);
        fetch(this.settings.saveURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
    }

    async load(): Promise<BaseStoreDataType> {
        const response = await fetch(this.settings.loadURL);
        return await response.json();
    }
}
export default HTTPKVStore