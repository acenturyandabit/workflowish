import { BaseStoreDataType } from "../src/CoreDataLake";
import { virtualRootId } from "../src/Workflowish/mvc/model";
export const testDocuments: Record<string, ()=>BaseStoreDataType > = {
    "over4096Items": (): BaseStoreDataType => {
        const items: BaseStoreDataType = {
            [virtualRootId]: {
                lastModifiedUnixMillis: 0,
                data: "",
                children: [],
                collapsed: false
            }
        };
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
    }
}