import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import "./index.css"
import HelpDocument from '~Workflowish/Subcomponents/HelpDocument';
import FileNavbarAndDialog from '../Stores/FileDialog';
import { ScriptingEngineNavbarAndDialog } from '~ScriptingEngine';
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import { DataAndLoadState, UpdateDataAction } from '~CoreDataLake';
import { isMobile } from '~util/isMobile';
import { ReplayRendererNavbarAndDialog } from './ReplayRenderer';
import { AvailableApps, CoreAppState } from '~App';

export default (props: {
    setKVStores: React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>,
    kvStores: KVStoresAndLoadedState,
    setData: UpdateDataAction,
    dataAndLoadState: DataAndLoadState,
    coreAppState: CoreAppState,
    setCoreAppState: React.Dispatch<React.SetStateAction<CoreAppState>>
}) => {
    const unsavedChangesText = isMobile() ? "*" : "Unsaved Changes";
    return <>
        <ul className="filemenu">
            <AppSelector
                coreAppState={props.coreAppState}
                setCoreAppState={props.setCoreAppState}
            ></AppSelector>
            <FileNavbarAndDialog
                data={props.dataAndLoadState.data}
                setData={props.setData}
                kvStores={props.kvStores}
                setKVStores={props.setKVStores}
            ></FileNavbarAndDialog>
            <HelpNavbarAndDialog></HelpNavbarAndDialog>
            <li>
                <a>Tools</a>
                <ul>
                    <ReplayRendererNavbarAndDialog replayBuffer={props.dataAndLoadState.replayBuffer}></ReplayRendererNavbarAndDialog>
                    <ScriptingEngineNavbarAndDialog
                        data={props.dataAndLoadState.data}
                        setData={props.setData}
                    ></ScriptingEngineNavbarAndDialog>
                </ul>
            </li>
            <li style={{ float: "right" }}><a>
                {props.dataAndLoadState.changed ? unsavedChangesText : ""}
            </a></li>
        </ul>
    </>
}

const AppSelector = (props: {
    coreAppState: CoreAppState,
    setCoreAppState: React.Dispatch<React.SetStateAction<CoreAppState>>
}) => {
    return <li>
        <a style={{textAlign: "left" }}>T &gt; {props.coreAppState.selectedApp}</a>
        <ul>
            {Object.keys(AvailableApps).map((_app) => {
                const app = _app as keyof typeof AvailableApps;
                return <li key={app}><a onClick={() => props.setCoreAppState((state) => ({ ...state, selectedApp: app }))}>{app}</a></li>
            })}
        </ul>
    </li>
}

const HelpNavbarAndDialog = () => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [helpDocLastOpen, refreshHelpDoc] = React.useState<number>(Date.now());
    return <li>
        <Dialog open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md">
            <DialogTitle>Help</DialogTitle>
            <DialogContent className='viewContainer' style={{ color: "white" }} dividers={true}>
                <HelpDocument helpDocLastOpen={helpDocLastOpen}></HelpDocument>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <a onClick={() => { setOpen(true); refreshHelpDoc(Date.now()) }}>Help</a>
    </li>
}
