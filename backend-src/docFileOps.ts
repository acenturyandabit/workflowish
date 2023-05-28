import { BaseStoreDataType } from "../src/CoreDataLake";
import * as fs from 'fs'

export const loadFromFile = (fileName: string): BaseStoreDataType => {
    let savedDoc: BaseStoreDataType = {}

    if (fs.existsSync(fileName)) {
        const wholeDoc: string = fs.readFileSync(fileName).toString();
        const docDeltas: Array<BaseStoreDataType> = wholeDoc
            .split("\n")
            .filter(i => i)
            .map((doc: string) => JSON.parse(doc));
        savedDoc = docDeltas.reduce((currentDoc, delta) => {
            Object.assign(currentDoc, delta);
            return currentDoc;
        }, {});
    }
    for (const key in savedDoc) {
        if (savedDoc[key] == null) {
            delete savedDoc[key];
        }
    }
    return savedDoc
}