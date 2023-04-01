import { ArgumentParser } from "argparse";
import * as fs from "fs"

export type BaseStoreDataTypeV2_3_1 = {
    [key: string]: {
        [key: string]: unknown
    }
}

export type BaseItemTypeV2_4 = {
    lastModifiedUnixMillis: number,
    [key: string]: unknown
}
export type BaseStoreDataTypeV2_4 = {
    [key: string]: BaseItemTypeV2_4
}


const main = () => {
    const parser = new ArgumentParser({
        description: 'Converts v2.3.1 .json save files in the server to v2.4 compatible saves.'
    });
    parser.add_argument("-i", "--inputFile");
    parser.add_argument("-o", "--outputfile");
    const args = parser.parse_args();

    const wholeDoc: string = fs.readFileSync(args.inputFile).toString();
    const docDeltas: Array<BaseStoreDataTypeV2_3_1> = wholeDoc
        .split("\n")
        .filter(i => i)
        .map((doc: string) => JSON.parse(doc));
    const savedDoc: BaseStoreDataTypeV2_3_1 = docDeltas.reduce((currentDoc, delta) => {
        Object.assign(currentDoc, delta);
        return currentDoc;
    }, {});
    for (const key in savedDoc){
        if (savedDoc[key] == null){
            delete savedDoc[key];
        }
    }


    const newDoc: BaseStoreDataTypeV2_4 = upgradeSchema(savedDoc as Record<string, FlatItemDataV2_3_1>);
    fs.writeFileSync(args.outputfile, JSON.stringify(newDoc));
}


type FlatItemDataV2_3_1 = {
    data: string,
    parentId: string,
    indexInParent: number,
    collapsed: boolean
}

type TemporaryStringOrderPair = {
    key: string,
    idx: number
}

type FlatItemDataV2_4 = {
    lastModifiedUnixMillis: number
    data: string,
    tempChildren?: TemporaryStringOrderPair[],
    children: string[],
    collapsed: boolean
}

const upgradeSchema = (savedDoc: Record<string, FlatItemDataV2_3_1>): Record<string, FlatItemDataV2_4> => {
    const newDoc: Record<string, FlatItemDataV2_4> = {}
    // First pass: instantiation
    for (const nodeId in savedDoc) {
        newDoc[nodeId] = {
            data: savedDoc[nodeId].data,
            lastModifiedUnixMillis: Date.now(),
            tempChildren: [],
            children: [],
            collapsed: savedDoc[nodeId].collapsed
        }
    }
    // Second pass: Parent assignment
    for (const nodeId in savedDoc) {
        const parentId = savedDoc[nodeId].parentId;
        if (parentId != ""){
            const childrenArray = newDoc[parentId].tempChildren;
            if (parentId in newDoc && childrenArray) {
                childrenArray.push({
                    key: nodeId,
                    idx: savedDoc[nodeId].indexInParent
                });
            }
        }
    }
    // Clean up the ordering
    for (const nodeId in savedDoc) {
        const childrenArray = newDoc[nodeId].tempChildren;
        if (childrenArray) {
            childrenArray.sort((a, b) => a.idx - b.idx);
            newDoc[nodeId].children = childrenArray.map(i => i.key);
        }
        delete newDoc[nodeId].tempChildren;
    }
    return newDoc
}

main();