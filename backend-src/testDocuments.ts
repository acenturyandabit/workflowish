import { BaseStoreDataType } from "../src/CoreDataLake";
import { virtualRootId } from "../src/Workflowish/mvc/model";
export const testDocuments: Record<string, () => BaseStoreDataType> = {
    "over4096Items": (): BaseStoreDataType => {
        const items = getDataBlockWithVirtualRoot();
        const createStack = Array(8).fill(0).map((val, idx) => [val, idx, virtualRootId]) as [number, number, string][];
        while (createStack.length > 0) {
            const top = createStack.pop() as [number, number, string];
            const thisID = `generated_idx_${top[1]}`;
            items[thisID] = {
                lastModifiedUnixMillis: 0,
                data: thisID,
                children: [],
                collapsed: true
            };
            (items[top[2]].children as string[]).push(thisID);
            if (top[0] < 3) {
                Array(8).fill(0).forEach((_, idx) => {
                    createStack.push([top[0] + 1, (top[1] + 1) * 8 + idx, thisID]);
                });
            }
        }
        return items;
    },
    "ohNoADuplicate": (): BaseStoreDataType => {
        const items = getDataBlockWithVirtualRoot();
        items["test"] = {
            lastModifiedUnixMillis: 0,
            data: "Hello world",
            children: ["test3"],
            collapsed: true
        }
        items["test2"] = {
            lastModifiedUnixMillis: 0,
            data: "Hello world",
            children: ["test3"],
            collapsed: true
        }
        items["test3"] = {
            lastModifiedUnixMillis: 0,
            data: "I am a child",
            children: [],
            collapsed: true
        }
        return items;
    }
}

const getDataBlockWithVirtualRoot = (): BaseStoreDataType => {
    return {
        [virtualRootId]: {
            lastModifiedUnixMillis: 0,
            data: "",
            children: [],
            collapsed: false
        }
    }
}