import * as React from 'react';
import { ItemTreeNode } from './model';

export const ModelContext = React.createContext<ItemTreeNode>({
    lastModifiedUnixMillis: 0,
    id: "MODEL_CONTEXT_DEFAULT",
    data: "If you're seeing this, something's probably gone wrong :(",
    children: [],
    collapsed: false,
    searchHighlight: []
});