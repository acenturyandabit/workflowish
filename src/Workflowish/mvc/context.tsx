import * as React from 'react';
import { ItemTreeNode } from './model';

// TODO: Consider using TransformedData instead of ItemTreeNode here
// would need to refactor Items to use full capabilities of TransformedData 
export const ModelContext = React.createContext<ItemTreeNode>({
    lastModifiedUnixMillis: 0,
    id: "MODEL_CONTEXT_DEFAULT",
    data: "If you're seeing this, something's probably gone wrong :(",
    children: [],
    collapsed: false,
    searchHighlight: []
});

export type RenderTimeContext = {
    currentFocusedItem: string
}

export const RenderTimeContext = React.createContext<RenderTimeContext>({
    currentFocusedItem: ""
});