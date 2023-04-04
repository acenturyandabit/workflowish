import * as React from 'react';
export default () => (
    <>
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
    </>
)