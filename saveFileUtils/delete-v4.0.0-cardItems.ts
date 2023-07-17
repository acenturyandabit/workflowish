import { ArgumentParser } from "argparse";
import * as fs from "fs"
import { loadFromFile } from "../backend-src/docFileOps";
import { BaseStoreDataType } from "../src/CoreDataLake";

const main = () => {
    const parser = new ArgumentParser({
        description: 'Deletes accidentally created card items from anki v4.0.0.'
    });
    parser.add_argument("-i", "--inputFile");
    parser.add_argument("-o", "--outputfile");
    const args = parser.parse_args();

    const savedDoc = loadFromFile(args.inputFile);
    const newDoc = deleteBadItems(savedDoc);
    fs.writeFileSync(args.outputfile, JSON.stringify(newDoc));
}

const deleteBadItems = (savedDoc: BaseStoreDataType): BaseStoreDataType => {
    const newDoc: BaseStoreDataType = {}
    for (const key in savedDoc) {
        if (savedDoc[key])
        newDoc[key] = {
            ...savedDoc[key],
        };
    }
    return newDoc
}

main();