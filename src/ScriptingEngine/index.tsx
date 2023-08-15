import * as React from 'react';
import { TaggedBaseStoreDataType, UpdateDataAction } from '~CoreDataLake';

import { transformData } from './model';
import Editor from "@monaco-editor/react";

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Checkbox, DialogContentText, FormLabel } from '@mui/material';
import { ScriptEngineInstance } from './engine';

export const ScriptingEngineNavbarAndDialog = (props: {
    setData: UpdateDataAction,
    data: TaggedBaseStoreDataType
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [currentScript, setCurrentScript] = transformData(props);
    const [autoRun, setAutoRun] = React.useState<{ savedHash: string, attemptedHash: string }>({
        savedHash: localStorage.getItem("autorun_script_hash") || "",
        attemptedHash: ""
    });
    const inputSetAutorun = (event: React.ChangeEvent<HTMLInputElement>) => {
        const scriptHash = cyrb53(currentScript.scriptContents);
        const autoRunToSet = event.target.checked ? scriptHash.toString() : "";
        localStorage.setItem("autorun_script_hash", autoRunToSet);
        setAutoRun((autoRun) => ({ ...autoRun, savedHash: autoRunToSet }));
    }
    React.useEffect(() => {
        const attemptedHash = cyrb53(currentScript.scriptContents).toString();
        if (attemptedHash == autoRun.savedHash) {
            setCurrentScript((currentScript) => ({ ...currentScript, lastActivateTime: Date.now() }))
        }
        setAutoRun((autoRun) => ({ ...autoRun, attemptedHash }));
    }, [currentScript.scriptContents, autoRun.savedHash]);
    return <li>
        <ScriptEngineInstance
            script={currentScript.scriptContents}
            lastActivateTime={currentScript.lastActivateTime}
            data={props.data}
            setData={props.setData}
        ></ScriptEngineInstance>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>Scripting Engine</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText sx={{ color: "red", mb: 2 }}>Warning: Scripts here may reveal private data. Only run scripts you have written yourself or you trust.</DialogContentText>
                <Editor
                    height="70vh"
                    defaultLanguage="javascript"
                    defaultValue={currentScript.scriptContents}
                    onChange={(value) => {
                        setCurrentScript((oldScript) => ({
                            ...oldScript,
                            scriptContents: value || "",
                            _lm: Date.now(),
                        }))
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={openReference}>Open Reference</Button>
                <FormLabel>Autorun script <Checkbox checked={autoRun.savedHash == autoRun.attemptedHash} onChange={inputSetAutorun}></Checkbox></FormLabel>
                <Button onClick={() => setCurrentScript((currentScript) => ({
                    ...currentScript,
                    lastActivateTime: Date.now()
                }))}>Save and Reload Script</Button>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <a onClick={() => setOpen(true)}>Scripts</a>
    </li>
}


const openReference = () => {
    window.open("/script-reference.js", "about:blank")
}

const cyrb53 = (str: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};