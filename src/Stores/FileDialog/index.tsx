import * as React from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { KVStores, makeKVStore } from '~Stores';
import { Box, TextField, MenuItem, FormControlLabel, Checkbox } from "@mui/material"
import { KVStoresAndLoadedState } from '~Stores/KVStoreInstances';
import { TaggedBaseStoreDataType } from '~CoreDataLake';
import { KVStore, KVStoreSettingsStruct, ProactiveSetDataRef } from '~Stores/types';


const FileNavbarAndDialog = (props: {
    setKVStores: React.Dispatch<React.SetStateAction<KVStoresAndLoadedState>>,
    kvStores: KVStoresAndLoadedState,
    setData: React.Dispatch<React.SetStateAction<TaggedBaseStoreDataType>>,
    data: TaggedBaseStoreDataType,
    proactiveSetData: ProactiveSetDataRef
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [newSaveLocationType, setNewSaveLocationType] = React.useState<string>(Object.keys(KVStores)[0]);
    const bumpKVStore = () => {
        props.setKVStores(kvStores => ({ ...kvStores }))
    }
    const addNewSaveSource = () => {
        props.setKVStores(kvStores => ({
            ...kvStores, stores: [
                ...kvStores.stores,
                makeKVStore(newSaveLocationType, props.proactiveSetData)
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
    return <li>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Save Sources</DialogTitle>
            <DialogContent dividers={true}>
                <h2>Registered save sources</h2>
                <FormControlLabel control={<Checkbox
                    checked={props.kvStores.autosaveOn}
                    onChange={(evt) => {
                        props.setKVStores({
                            ...props.kvStores,
                            autosaveOn: evt.target.checked
                        })
                    }}
                ></Checkbox>} label="Autosave"></FormControlLabel>
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
        </Dialog>
        <a onClick={() => setOpen(true)}>File</a>
    </li>
}

const SaveLoadButtons = (props: {
    saveSource: KVStore<KVStoreSettingsStruct>,
    removeSaveSource: () => void
    data: TaggedBaseStoreDataType,
    setData: React.Dispatch<React.SetStateAction<TaggedBaseStoreDataType>>,
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


export default FileNavbarAndDialog;