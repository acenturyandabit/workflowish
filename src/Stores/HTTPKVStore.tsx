import { DefaultKVConstructionArgs, KVStore, KVStoreSettingsStruct } from "./types";
import * as React from "react";
import { Checkbox, FormControlLabel, TextField } from "@mui/material"
import { BaseStoreDataType } from "~CoreDataLake";
import getDiffsAndResolvedItems from "~CoreDataLake/getResolvedItems";

const HTTPKVStoreType = "HTTPStore" as const;
export interface HTTPKVStoreSettings extends KVStoreSettingsStruct {
    type: typeof HTTPKVStoreType
    saveURL: string
    loadURL: string
    syncURL: string
    passwordPrefix: string
    usePassword?: boolean
    promptPassword?: boolean
}

const isHTTPKVStoreSettings = (x: KVStoreSettingsStruct | DefaultKVConstructionArgs):
    x is HTTPKVStoreSettings => x?.type == HTTPKVStoreType



class HTTPKVStore implements
    KVStore<HTTPKVStoreSettings>{
    settings: HTTPKVStoreSettings
    cachedDataFile: BaseStoreDataType
    password: string
    static type = HTTPKVStoreType
    constructor(_settings: HTTPKVStoreSettings | DefaultKVConstructionArgs) {
        if (isHTTPKVStoreSettings(_settings)) {
            this.settings = _settings;
        } else {
            this.settings = {
                type: HTTPKVStoreType,
                saveURL: "",
                loadURL: "",
                syncURL: "",
                passwordPrefix: "",
                usePassword: false,
                promptPassword: true
            };
        }
        this.password = ""
        this.cachedDataFile = {};
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
                    sx={{ mb: 2 }}
                    value={this.settings.syncURL}
                    fullWidth
                    onChange={(evt) => {
                        this.settings.syncURL = evt.target.value;
                        bumpKVStores();
                    }}
                />
                <FormControlLabel
                    sx={{ width: "100%", mb: 2 }}
                    control={<Checkbox
                        checked={this.settings.usePassword}
                        onChange={(evt) => {
                            this.settings.usePassword = evt.target.checked;
                            bumpKVStores();
                        }}
                    />}
                    label={"Use Password (Prompts on load - press 'load' to retry password)"}
                />
                {this.settings.usePassword ? <>
                    <br></br>
                    <TextField
                        label="Saved password (or password prefix) in browser -- optional"
                        sx={{ width: "100%", mb: 2 }}
                        type="password"
                        value={this.settings.passwordPrefix}
                        fullWidth
                        onChange={(evt) => {
                            this.settings.passwordPrefix = evt.target.value;
                            bumpKVStores();
                        }}
                    />
                </> : null}
                {this.settings.usePassword && this.settings.passwordPrefix.length > 0 ? <>
                    <br></br>
                    <FormControlLabel
                        control={<Checkbox
                            checked={this.settings.promptPassword}
                            onChange={(evt) => {
                                this.settings.promptPassword = evt.target.checked;
                                bumpKVStores();
                            }}
                        />}
                        label={"Prompt for Password (Otherwise just use password prefix)"}
                    />
                    <br></br>
                </> : null}
            </>
        )
    }

    async save(data: BaseStoreDataType) {
        const response = await this.authedFetch(this.settings.saveURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        if (response.status != 200) {
            alert("Save failed!");
        }
    }

    async sync(data: BaseStoreDataType): Promise<BaseStoreDataType> {
        const { incomingDiffs } = getDiffsAndResolvedItems(data, this.cachedDataFile);
        const response = this.authedFetch(this.settings.syncURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(incomingDiffs)
        })
        this.cachedDataFile = await (await response).json();
        return this.cachedDataFile;
    }

    async load(): Promise<BaseStoreDataType> {
        if (this.settings.usePassword && this.settings.promptPassword) {
            // TODO: Better password prompting
            this.password = prompt("Please enter your password for " + this.settings.loadURL) || "";
        }
        const response = await this.authedFetch(this.settings.loadURL);
        this.cachedDataFile = await response.json();
        return this.cachedDataFile;
    }

    async authedFetch(url: string, args?: RequestInit): Promise<ReturnType<typeof fetch>> {
        const headers = new Headers(args?.headers)
        if (this.settings.usePassword) headers.set("password", this.settings.passwordPrefix + this.password);
        return await fetch(url, {
            ...args,
            headers: headers,
        })
    }
}
export default HTTPKVStore