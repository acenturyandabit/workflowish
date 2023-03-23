const diff = (obj1, obj2) => {
    const result = {};
    if (
        (obj1 == null || obj1 == undefined) &&
        (obj2 == null || obj2 == undefined)) {
        return undefined
    }
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    const allKeys: Array<string> = Object.keys(obj1 || {}).concat(Object.keys(obj2 || {}));
    const uniqueKeys = Array.from(new Set(allKeys));
    uniqueKeys.forEach(key => {
        if (
            (obj1[key] == null || obj1[key] == undefined) &&
            (obj2[key] == null || obj2[key] == undefined)) {
            return
        } else if (obj1[key] == undefined) {
            result[key] = obj2[key];
        } else if (obj2[key] == undefined) {
            result[key] = obj1[key];
        } else if (typeof obj2[key] != typeof obj1[key]) {
            result[key] = obj1[key]; // dont care which side
        } else {
            const value = diff(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
    });
    if (Object.keys(result).length) {
        return result;
    } else return undefined;
}

export default diff;