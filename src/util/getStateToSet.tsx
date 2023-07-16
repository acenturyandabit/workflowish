export const getStateToSet = <T, U = T>(toSet: T | ((previous: U) => T), previous: U): T => {
    let nonFunctionToSet: T;
    if (toSet instanceof Function) {
        nonFunctionToSet = toSet(previous);
    } else {
        nonFunctionToSet = toSet;
    }
    return nonFunctionToSet
}

export const excludeKeys = (item: Record<string, unknown>, keysToExclude: string[])=>{
    const copy = {...item};
    keysToExclude.forEach(key => {
        delete copy[key];
    })
    return copy;
}