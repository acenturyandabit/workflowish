import * as React from 'react';
import { TaggedBaseStoreDataType, UpdateDataAction } from '~CoreDataLake';

import { transformData } from './model';
import Editor from "@monaco-editor/react";

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { DialogContentText } from '@mui/material';
import { ScriptEngineInstance } from './engine';

export const ScriptingEngineNavbarAndDialog = (props: {
    setData: UpdateDataAction,
    data: TaggedBaseStoreDataType
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [currentScript, setCurrentScript] = transformData(props);
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