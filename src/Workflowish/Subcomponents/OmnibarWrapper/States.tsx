// This file is to prevent circular dependencies.
export type SearchPartialState = {
    searchSelectionIdx: number
}

export type OmniBarState = {
    barContents: string,
    // TODO: Change this to use dfs index of item 
    // so that if a user partially navigates on search, their position will not get lost
    searchState: SearchPartialState
}