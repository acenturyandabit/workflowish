import { DefaultKVConstructionArgs, KVStore, KVStoreSettingsStruct } from "./types";
import * as React from "react";
import { MenuItem, TextField } from "@mui/material"
import { BaseStoreDataType } from "~CoreDataLake";

const TextImportKVStoreType = "TextImport" as const;

const textFormatOptions = ["JSON"] as const;
type TextFormatOptions = typeof textFormatOptions[number]

export interface TextImportKVStoreSettings extends KVStoreSettingsStruct {
    type: typeof TextImportKVStoreType
    textFormat: TextFormatOptions
}

const isTextImportKVStoreSettings = (x: KVStoreSettingsStruct | DefaultKVConstructionArgs):
    x is TextImportKVStoreSettings => x?.type == TextImportKVStoreType

class TextImportKVStore implements
    KVStore<TextImportKVStoreSettings>{

    static type = TextImportKVStoreType

    settings: TextImportKVStoreSettings & {
        outputText: string
    }
    bumpKVStores?: () => void

    constructor(_settings: TextImportKVStoreSettings | DefaultKVConstructionArgs) {
        if (isTextImportKVStoreSettings(_settings)) {
            this.settings = {
                ..._settings,
                outputText: ""
            }
        } else {
            this.settings = {
                type: TextImportKVStoreType,
                textFormat: "JSON",
                outputText: ""
            };
        }
    }

    toJsonSettings() {
        return this.settings
    }

    makeFileDialog(bumpKVStores: () => void) {
        this.bumpKVStores = bumpKVStores;
        return (
            <>
                <h3>TextImport KV Store Settings</h3>
                <TextField
                    label="Text to import"
                    multiline
                    sx={{ mb: 2 }}
                    placeholder="Enter JSON data to import here, then press 'Load'."
                    value={this.settings.outputText}
                    onChange={(evt) => {
                        this.settings.outputText = evt.target.value;
                        bumpKVStores();
                    }}
                    fullWidth
                />
                <TextField
                    label="Import / Export Format"
                    select
                    value={this.settings.textFormat}
                    onChange={(evt) => {
                        this.settings.textFormat = evt.target.value as TextFormatOptions;
                        bumpKVStores();
                    }}
                    fullWidth
                >
                    {textFormatOptions.map(opt => (<MenuItem value={opt} key={opt}>{opt}</MenuItem>))}
                </TextField>
            </>
        )
    }

    save(data: BaseStoreDataType) {
        this.settings.outputText = JSON.stringify(data);
        if (this.bumpKVStores) {
            this.bumpKVStores();
        }
    }

    async load(): Promise<BaseStoreDataType> {
        if (this.settings.outputText) {
            return JSON.parse(this.settings.outputText);
        } else {
            return {}
        }
    }

}

export default TextImportKVStore;