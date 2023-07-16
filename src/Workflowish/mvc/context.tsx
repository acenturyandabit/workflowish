import * as React from 'react';
import { ItemTreeNode } from './model';
import { IdAndFocusPath } from './DFSFocus';

// TODO: Consider using TransformedData instead of ItemTreeNode here
// would need to refactor Items to use full capabilities of TransformedData 
export const ModelContext = React.createContext<ItemTreeNode>({
    _lm: 0,
    id: "MODEL_CONTEXT_DEFAULT",
    data: "If you're seeing this, something's probably gone wrong :(",
    children: [],
    collapsed: false,
    searchHighlight: []
});

export type RenderTimeContext = {
    currentFocusedItem: IdAndFocusPath
}

export const RenderTimeContext = React.createContext<RenderTimeContext>({
    currentFocusedItem: { id: "", treePath: [] }
});