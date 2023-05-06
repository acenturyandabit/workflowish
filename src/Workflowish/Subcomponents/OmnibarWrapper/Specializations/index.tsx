import * as React from 'react';
import { ItemTreeNode, TransformedDataAndSetter } from "~Workflowish/mvc/model";
import { OmniBarState } from "../States";
import { FocusActions } from "~Workflowish/Item";
import { searchPropsFactory } from './search';
import { commandPropsFactory } from './commands';

type OmniBarSubtype = "Search" | "Command" | "None";
export type SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, FocusActions>
) => {
    omnibarKeyHandler: (evt: React.KeyboardEvent) => void,
    rootNode: ItemTreeNode,
    extraAnnotations: React.ReactElement
}

export const getSpecializedProps: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter,
    itemsRefDictionary: Record<string, FocusActions>
) => {
    let omniBarSubtype: OmniBarSubtype = "None";
    if (omniBarState.barContents.startsWith(">")) omniBarSubtype = "Command";
    else omniBarSubtype = "Search";
    return specializations[omniBarSubtype](
        omniBarState,
        setOmniBarState,
        transformedDataAndSetter,
        itemsRefDictionary
    );
}

const nonePropsFactory: SpecializedPropsFactory = (
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    transformedDataAndSetter: TransformedDataAndSetter
) => {
    return {
        omnibarKeyHandler: () => {
            // empty handler
        },
        rootNode: transformedDataAndSetter.transformedData.rootNode,
        extraAnnotations: <></>
    }
}

const specializations: Record<OmniBarSubtype, SpecializedPropsFactory> = {
    "Search": searchPropsFactory,
    "Command": commandPropsFactory,
    "None": nonePropsFactory,
}