import { BaseStoreDataType } from "../src/CoreDataLake";

const getDiffsAndResolvedItems = (incomingDoc: BaseStoreDataType, savedDoc: BaseStoreDataType): {
    incomingDiffs: BaseStoreDataType,
    resolved: BaseStoreDataType
} => {
    const keysChanged = leftRightKeysChanged(incomingDoc, savedDoc);
    const resolved = Object.assign({}, savedDoc);
    for (const key in keysChanged.leftNewerKeys) {
        resolved[key] = incomingDoc[key];
    }
    const incomingDiffs: BaseStoreDataType = {};
    keysChanged.leftNewerKeys.forEach(key => incomingDiffs[key] = incomingDoc[key]);

    return {
        incomingDiffs,
        resolved
    }
}

const leftRightKeysChanged = (left: BaseStoreDataType, right: BaseStoreDataType): {
    leftNewerKeys: string[],
    rightNewerKeys: string[]
} => {
    const leftNewerKeys: Array<string> = []
    const rightNewerKeys: Array<string> = []
    const halfKeysChanged = (_left, _right, _leftItemsNewer) => {
        for (const key in _left) {
            if (!(key in _right) || _right[key].lastModifiedUnixMillis < _left[key].lastModifiedUnixMillis) {
                _leftItemsNewer.push(key);
            }
        }
    }
    halfKeysChanged(left, right, leftNewerKeys);
    halfKeysChanged(right, left, rightNewerKeys);
    return {
        leftNewerKeys,
        rightNewerKeys
    }
}



export default getDiffsAndResolvedItems;