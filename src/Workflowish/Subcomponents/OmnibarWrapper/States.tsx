import { IdAndFocusPath } from "~Workflowish/mvc/DFSFocus"

export type OmniBarState = {
    barContents: string,
    preOmnibarFocusItem?: IdAndFocusPath,
    selectionIdx: number
}