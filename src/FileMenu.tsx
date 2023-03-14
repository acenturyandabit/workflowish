import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import "~FileMenu.css"
export default () => {
    const [helpOpen, setHelpOpen] = React.useState(false);
    const closeHelp = () => setHelpOpen(false);
    return <ul className="filemenu">
        <HelpDialog open={helpOpen} doClose={closeHelp}></HelpDialog>
        <li>
            <a>Workflowish</a>
        </li>
        <li>
            <a onClick={() => setHelpOpen(true)}>Help</a>
        </li>
    </ul>
}

const HelpDialog = (props: {
    open: boolean,
    doClose: () => void
}) => (<Dialog open={props.open} onClose={props.doClose}>
    <DialogTitle>How to use</DialogTitle>
    <DialogContent dividers={true}>
        <DialogContentText>
            Workflowish is a recursive listing app, which is keyboard-first.
            <ul>
                <li>
                    Each bullet point represents a row and can be edited by clicking on the space in front of it and entering text.
                </li>
                <li>
                    To create a new row anywhere, press enter in the row above it.
                </li>
                <li>
                    You can use Shift+Enter to add an item as a child.
                </li>
                <li>
                    You can use the up and down arrow keys to navigate between list items.
                </li>
                <li>
                    You can use Alt + up and down arrow keys to rearrange list items.
                </li>
                <li>
                    You can use Tab to indent a list item; or Shift-Tab to unindent a list item.
                </li>
                <li>
                    You can use Ctrl+Up or Ctrl+Down to collapse / uncollapse an item with children.
                </li>
            </ul>
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={props.doClose}>Cancel</Button>
    </DialogActions>
</Dialog>)