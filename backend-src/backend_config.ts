import * as fs from 'fs';
import * as path from 'path'

// This file cannot be named 'config' because of tsx shenanigans.

const thisFileDirectory = path.dirname(__filename)
export class Config {
    canCreateDocuments: boolean

    constructor(configFileName = "config.json") {
        // Defaults
        const configFilePath = thisFileDirectory + "/" + configFileName;
        this.canCreateDocuments = true;
        // Load user specified settings
        if (fs.existsSync(configFilePath)) {
            const configs = JSON.parse(fs.readFileSync(configFilePath).toString());
            Object.assign(this, configs);
        }
    }
}
