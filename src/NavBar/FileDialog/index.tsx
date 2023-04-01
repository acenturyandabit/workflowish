import * as React from 'react';
import { NavBarDialog } from "~NavBar";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { KVStores, makeKVStore } from '~Stores';
import { Box, TextField, MenuItem } from "@mui/material"
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import { BaseStoreDataType } from '~CoreDataLake';
import { KVStore, KVStoreSettingsStruct } from '~Stores/types';

class FileDialog implements NavBarDialog {
    setOpen: () => void
    setClose: () => void
    innerDialog: React.ReactElement
    path = "File"
    open: boolean
    constructor(props: {
        setKVStores: React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>,
        kvStores: KVStoresAndLoadedState,
        setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
        data: BaseStoreDataType
    }) {
        const [open, setOpen] = React.useState(false);
        const [newSaveLocationType, setNewSaveLocationType] = React.useState<string>(Object.keys(KVStores)[0]);
        const bumpKVStore = () => {
            props.setKVStores(kvStores => ({ ...kvStores }))
        }
        const addNewSaveSource = () => {
            props.setKVStores(kvStores => ({
                ...kvStores, stores: [
                    ...kvStores.stores,
                    makeKVStore(newSaveLocationType)
                ]
            }))
        }

        const removeSaveSource = (idx: number) => {
            props.setKVStores(kvStores => {
                const newStores = [...kvStores.stores];
                newStores.splice(idx, 1);
                return {
                    ...kvStores, stores: newStores
                }
            })
        }

        this.innerDialog = <>
            <DialogTitle>Save Sources</DialogTitle>
            <DialogContent dividers={true}>

                <h2>Registered save sources</h2>
                {props.kvStores.stores.map((i, ii) => (
                    <Box key={ii}>
                        {i.makeFileDialog(bumpKVStore)}
                        <SaveLoadButtons
                            saveSource={i}
                            removeSaveSource={() => removeSaveSource(ii)}
                            data={props.data}
                            setData={props.setData}
                        />

                    </Box>
                ))}
                <h3>Or, add a new save source...</h3>
                <Box>
                    <TextField
                        label="New save source"
                        select
                        fullWidth
                        onChange={(evt) => setNewSaveLocationType(evt.target.value)}
                        value={newSaveLocationType}
                        sx={{ mb: 2 }}
                    >
                        {Object.values(KVStores).map(i => (<MenuItem value={i.type} key={i.type}>{i.type}</MenuItem >))}
                    </TextField>
                    <Button fullWidth variant="outlined" onClick={addNewSaveSource}>Add new save source</Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </>;
        this.setOpen = () => setOpen(true);
        this.setClose = () => setOpen(false);
        this.open = open;
    }
}

const SaveLoadButtons = (props: {
    saveSource: KVStore<KVStoreSettingsStruct>,
    removeSaveSource: () => void
    data: BaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>,
}) => {
    const syncFn = props.saveSource.sync;
    const SyncButton = syncFn ? <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => {
            (async () => {
                const newData = await syncFn(props.data)
                // TODO: make a class in charge of handling the data; 
                // this should just be a call to "saverClass.sync(props.saveSource)". 
                // Same goes with other functions which handle data. 
                props.setData(newData)
            })();
        }}
    >Sync</Button> : null;

    return <>
        <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
                props.saveSource.save(props.data)
            }}
        >Save</Button>
        {SyncButton}
        <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
                (async () => {
                    const loadedData = await props.saveSource.load();
                    props.setData(loadedData)
                })();
            }}
        >Load</Button>
        <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => props.removeSaveSource()}
        >Remove this source</Button>
    </>
}


export default FileDialog;