import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import "./index.css"
import HelpDocument from '~Workflowish/HelpDocument';
import FileNavbarAndDialog from '../Stores/FileDialog';
import { ScriptingEngineNavbarAndDialog } from '~ScriptingEngine';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import { BaseStoreDataType, DataAndLoadState } from '~CoreDataLake';
import { isMobile } from 'react-device-detect';

export default (props: {
    setKVStores: React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>,
    kvStores: KVStoresAndLoadedState,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
    dataAndLoadState: DataAndLoadState,
}) => {
    const unsavedChangesText = isMobile ? "*" : "Unsaved Changes";
    return <>
        <ul className="filemenu">
            <li>
                <a>Workflowish</a>
            </li>
            <FileNavbarAndDialog
                data={props.dataAndLoadState.data}
                setData={props.setData}
                kvStores={props.kvStores}
                setKVStores={props.setKVStores}
            ></FileNavbarAndDialog>
            <HelpNavbarAndDialog></HelpNavbarAndDialog>
            <ScriptingEngineNavbarAndDialog
                data={props.dataAndLoadState.data}
                setData={props.setData}
            ></ScriptingEngineNavbarAndDialog>
            <li style={{ float: "right" }}><a>
                {props.dataAndLoadState.changed ? unsavedChangesText : ""}
            </a></li>
        </ul>
    </>
}

const HelpNavbarAndDialog = () => {
    const [open, setOpen] = React.useState<boolean>(false);
    return <li>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Help</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText>
                    <HelpDocument></HelpDocument>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <a onClick={() => setOpen(true)}>Help</a>
    </li>
}
