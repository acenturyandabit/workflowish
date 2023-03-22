import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import "./index.css"
import HelpDocument from '~Workflowish/HelpDocument';
import FileLoadDialog from './FileDialog';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import { BaseStoreDataType, DataAndLoadState } from '~CoreDataLake';

export interface NavBarDialog {
    setOpen: () => void,
    setClose: () => void,
    innerDialog: React.ReactElement,
    path: string,
    open: boolean
}

export default (props: {
    setKVStores: React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>,
    kvStores: KVStoresAndLoadedState,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
    dataAndLoadState: DataAndLoadState
}) => {
    const dialogs: NavBarDialog[] = [
        new FileLoadDialog({
            ...props,
            data: props.dataAndLoadState.data,
        }),
        new HelpDialog(),
    ];

    return <>
        {getOpenDialog(dialogs)}
        <ul className="filemenu">
            <li>
                <a>Workflowish</a>
            </li>
            {getfileMenuElements(dialogs)}
            <li style={{ float: "right" }}><a>
                {props.dataAndLoadState.changed ? "Unsaved changes" : ""}
            </a></li>
        </ul>
    </>
}

const getOpenDialog = (dialogs: NavBarDialog[]) => {
    let dialogElement: React.ReactElement | null = null;
    const openDialogs = dialogs.filter(i => i.open);
    // TODO: Martialling if ever multiple open dialogs
    if (openDialogs.length) {
        const currentDialog = openDialogs[0];
        dialogElement = <Dialog open={true} onClose={currentDialog.setClose} >
            {currentDialog.innerDialog}
        </Dialog>
    }
    return dialogElement;
}

const getfileMenuElements = (dialogs: NavBarDialog[]) => <>
    {dialogs.map((dialogElement) => (
        <li key={dialogElement.path}>
            <a onClick={dialogElement.setOpen}>{dialogElement.path}</a>
        </li>
    ))}
</>

class HelpDialog implements NavBarDialog {
    setOpen: () => void
    setClose: () => void
    innerDialog: React.ReactElement
    path = "Help"
    open: boolean
    constructor() {
        const [open, setOpen] = React.useState(false);
        this.open = open;
        this.innerDialog = <><DialogTitle>Help</DialogTitle>
            <DialogContent dividers={true}>
                <DialogContentText>
                    <HelpDocument></HelpDocument>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </>
        this.setOpen = () => setOpen(true);
        this.setClose = () => setOpen(false);

    }

}