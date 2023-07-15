import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { BaseDeltaType } from '~CoreDataLake';

export const ReplayRendererNavbarAndDialog = (props: {
    replayBuffer: BaseDeltaType[]
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    return <li>
        <Dialog open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md">
            <DialogTitle>Undo</DialogTitle>
            <DialogContent className='viewContainer' style={{ color: "white" }} dividers={true}>
                {props.replayBuffer.map((delta, idx) => {
                    return <p key={idx}>{delta.key}</p>
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <a onClick={() => { setOpen(true); }}>Show undo buffer</a>
    </li>
}