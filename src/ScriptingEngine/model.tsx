import * as React from "react";
import { TaggedBaseStoreDataType, UpdateDataAction } from "~CoreDataLake";
export type SavedUserScript = {
    _lm: number
    scriptContents: string,
}

export type UserScript = {
    _lm: number
    scriptContents: string,
    lastActivateTime?: number
}

const scriptKey = "__userscript";
export const transformData = (props: {
    data: TaggedBaseStoreDataType,
    setData: UpdateDataAction
}): [UserScript,
        React.Dispatch<React.SetStateAction<UserScript>>] => {
    const [lastActivateTime, setLastActivateTime] = React.useState<number | undefined>(undefined);
    const currentScript: UserScript = {
        lastActivateTime,
        ...extractUserScript(props.data)
    }
    const setCurrentScript = (newScript: UserScript | ((currentScript: UserScript) => UserScript)) => {
        props.setData((oldData) => {
            const oldScript = extractUserScript(oldData);
            let newScriptToSet: UserScript;
            if (newScript instanceof Function) {
                newScriptToSet = newScript({ ...oldScript, lastActivateTime });
            } else {
                newScriptToSet = newScript;
            }
            const newLastActiveTime = newScriptToSet.lastActivateTime;
            setTimeout(() => { setLastActivateTime(newLastActiveTime) }, 1);
            delete newScriptToSet.lastActivateTime;
            return {
                [scriptKey]: newScriptToSet
            }
        })
    }
    return [currentScript, setCurrentScript];
}

const extractUserScript = (data: TaggedBaseStoreDataType) => {
    let currentScript: SavedUserScript;
    if (scriptKey in data) {
        currentScript = data[scriptKey] as SavedUserScript;
    } else {
        currentScript = {
            _lm: Date.now(),
            scriptContents: ""
        }
    }
    return currentScript;
}
