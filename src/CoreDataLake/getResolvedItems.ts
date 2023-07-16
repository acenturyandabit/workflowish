import { BaseStoreDataType, BaseDeltaType } from ".";

const getDiffsAndResolvedItems = (incomingDoc: BaseStoreDataType, savedDoc: BaseStoreDataType): {
    incomingDiffs: BaseStoreDataType,
    resolved: BaseStoreDataType,
    deltas: BaseDeltaType[]
} => {
    const keysChanged = leftRightKeysChanged(incomingDoc, savedDoc);
    const resolved = Object.assign({}, savedDoc);
    const incomingDiffs: BaseStoreDataType = {};
    const deltas: BaseDeltaType[] = [];
    keysChanged.leftNewerKeys.forEach(key => {
        deltas.push({
            key,
            from: resolved[key],
            to: incomingDoc[key]
        })
        resolved[key] = incomingDoc[key]
        incomingDiffs[key] = resolved[key];
    });

    return {
        incomingDiffs,
        resolved,
        deltas
    }
}

const leftRightKeysChanged = (left: BaseStoreDataType, right: BaseStoreDataType): {
    leftNewerKeys: string[],
    rightNewerKeys: string[]
} => {
    const leftNewerKeys: string[] = []
    const rightNewerKeys: string[] = []
    const halfKeysChanged = (_left: BaseStoreDataType, _right: BaseStoreDataType, _leftItemsNewer: string[]) => {
        for (const key in _left) {
            if (!(key in _right) || _right[key]._lm < _left[key]._lm) {
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