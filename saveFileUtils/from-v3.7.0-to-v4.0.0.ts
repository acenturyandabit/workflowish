import { ArgumentParser } from "argparse";
import * as fs from "fs"
import { loadFromFile } from "../backend-src/docFileOps";

export type BaseStoreDataTypeV3_7_0 = {
    [key: string]: {
        lastModifiedUnixMillis: number
    }
}

export type BaseItemTypeV4_0 = {
    _lm: number,
    [key: string]: unknown
}
export type BaseStoreDataTypeV4_0 = {
    [key: string]: BaseItemTypeV4_0
}


const main = () => {
    const parser = new ArgumentParser({
        description: 'Converts v3.7.0 .json save files in the server to v4.0.0 compatible saves.'
    });
    parser.add_argument("-i", "--inputFile");
    parser.add_argument("-o", "--outputfile");
    const args = parser.parse_args();

    const savedDoc: BaseStoreDataTypeV3_7_0 = loadFromFile(args.inputFile) as unknown as BaseStoreDataTypeV3_7_0;
    const newDoc: BaseStoreDataTypeV4_0 = upgradeSchema(savedDoc);
    fs.writeFileSync(args.outputfile, JSON.stringify(newDoc));
}

const upgradeSchema = (savedDoc: BaseStoreDataTypeV3_7_0): BaseStoreDataTypeV4_0 => {
    const newDoc: BaseStoreDataTypeV4_0 = {}
    for (const key in savedDoc) {
        newDoc[key] = {
            ...savedDoc[key],
            _lm: savedDoc[key].lastModifiedUnixMillis
        };
        delete newDoc[key].lastModifiedUnixMillis;
    }
    return newDoc
}

main();