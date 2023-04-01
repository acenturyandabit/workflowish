import { it, expect } from '@jest/globals';
import { BaseStoreDataType } from '~CoreDataLake';
import getDiffsAndResolvedItems from "./getResolvedItems"

it('Merges two collections correctly', () => {
    const itemA: BaseStoreDataType = {
        item1: {
            lastModifiedUnixMillis: 0,
            cameFrom: "A"
        }
    }
    const itemB: BaseStoreDataType = {
        item1: {
            lastModifiedUnixMillis: 1,
            cameFrom: "B"
        }
    }
    const { resolved } = getDiffsAndResolvedItems(itemA, itemB);
    expect(resolved.item1.cameFrom).toEqual("B");
})