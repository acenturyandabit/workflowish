import { ArgumentParser } from "argparse";
import * as fs from "fs"

export type BaseItemTypeVLegacy = {
    _lu_: number,
    title: string,
    from_default_operator: string,
    order_default_operator: number,
    collapsed?: boolean
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
        description: 'Converts v.legacy .json save files in the server to v2.4 compatible saves.'
    });
    parser.add_argument("-i", "--inputFile");
    parser.add_argument("-o", "--outputfile");
    const args = parser.parse_args();

    const wholeFile: string = fs.readFileSync(args.inputFile).toString();
    const wholeDoc: Record<string, Partial<BaseItemTypeVLegacy>> = JSON.parse(wholeFile);
    const wholeConvertibleDoc: Record<string, BaseItemTypeVLegacy> = {}
    for (const key in wholeDoc) {
        const currentItem = wholeDoc[key];
        if (currentItem._lu_ != undefined
            && currentItem.title != undefined
            && currentItem.from_default_operator != undefined
        ) {
            wholeConvertibleDoc[key] = wholeDoc[key] as BaseItemTypeVLegacy
        }
    }


    const newDoc: BaseStoreDataTypeV2_4 = upgradeSchema(wholeConvertibleDoc);
    fs.writeFileSync(args.outputfile, JSON.stringify(newDoc));
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

const upgradeSchema = (savedDoc: Record<string, BaseItemTypeVLegacy>): Record<string, FlatItemDataV2_4> => {
    const newDoc: Record<string, FlatItemDataV2_4> = {}
    // First pass: instantiation
    for (const nodeId in savedDoc) {
        newDoc[nodeId] = {
            data: savedDoc[nodeId].title,
            lastModifiedUnixMillis: savedDoc[nodeId]._lu_,
            tempChildren: [],
            children: [],
            collapsed: savedDoc[nodeId].collapsed || true
        }
    }
    // Second pass: Parent assignment, orphan detection
    const orphans: string[] = [];
    for (const nodeId in newDoc) {
        const parentId = savedDoc[nodeId].from_default_operator;
        if (parentId == "" || parentId in newDoc) {
            if (parentId != "") {
                const childrenArray = newDoc[parentId].tempChildren;
                if (childrenArray) {
                    childrenArray.push({
                        key: nodeId,
                        idx: savedDoc[nodeId].order_default_operator
                    });
                }
            }
        } else {
            orphans.push(nodeId)
        }
    }
    // orphaned subtree deletion
    const orphanSubtreeDeletionStack: string[] = [...orphans];
    while (orphanSubtreeDeletionStack.length) {
        const topOrphanId = orphanSubtreeDeletionStack.pop()
        if (topOrphanId) {
            const children = newDoc[topOrphanId].tempChildren?.map(i => i.key) || [];
            orphanSubtreeDeletionStack.push(...children);
            delete newDoc[topOrphanId];
        }
    }

    // Clean up the ordering
    for (const nodeId in newDoc) {
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