import * as React from 'react';
import { TransformedDataAndSetter } from '../../mvc/model';
import { ModelContext } from '~Workflowish/mvc/context';
import { ItemRef } from '~Workflowish/Item';
import "./index.css"
import { OmniBarState } from './States';
import { getSpecializedProps } from './Specializations';
import { DFSFocusManager, IdAndFocusPath } from '~Workflowish/mvc/DFSFocus';


const OmniBarWrapper = (props: {
    children: React.ReactElement,
    itemRefsDictionary: Record<string, ItemRef>,
    transformedDataAndSetter: TransformedDataAndSetter,
    dfsFocusManager: DFSFocusManager,
    lastFocusedItem: IdAndFocusPath,
}) => {
    const [omniBarState, setOmniBarState] = React.useState<OmniBarState>(getDefaultOmnibarState());
    const { omnibarKeyHandler, rootNode, extraAnnotations } = getSpecializedProps(omniBarState, setOmniBarState, props.transformedDataAndSetter, props.itemRefsDictionary, props.dfsFocusManager);
    return <>
        <OmniBar
            omniBarState={omniBarState}
            setOmniBarState={setOmniBarState}
            omnibarKeyHandler={omnibarKeyHandler}
            lastFocusedItem={props.lastFocusedItem}
        >
            {extraAnnotations}
        </OmniBar>
        <ModelContext.Provider value={rootNode}>
            {props.children}
        </ModelContext.Provider>
    </>
}

const OmniBar = (props: {
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    omnibarKeyHandler: (evt: React.KeyboardEvent) => void,
    lastFocusedItem: IdAndFocusPath, // Todo: Elevate this property + the inputReference up
    children: React.ReactElement
}) => {
    const inputReference = React.useRef<HTMLInputElement>(null);
    const lastFocusedItem_ = React.useRef<IdAndFocusPath>({
        id: "",
        treePath: []
    });
    React.useEffect(() => {
        const listenForCtrlFP = (e: KeyboardEvent) => {
            if ((e.key == "f" || e.key == "p") && (e.ctrlKey || e.metaKey)) {
                let visibleChangeOccured = false;
                const userIsAlreadyInSearchBar = (inputReference.current == document.activeElement);
                if (!userIsAlreadyInSearchBar) {
                    inputReference.current?.focus();
                    visibleChangeOccured = true;
                }
                if (e.key == "p") {
                    // Save currently focused item
                    props.setOmniBarState((currentState): OmniBarState => {
                        if (!currentState.barContents.startsWith(">")) {
                            return {
                                ...currentState,
                                barContents: ">",
                                preOmnibarFocusItem: lastFocusedItem_.current
                            }
                        } else {
                            return currentState;
                        }
                    })
                    visibleChangeOccured = true;
                }
                if (visibleChangeOccured) {
                    e.preventDefault();
                }
            }
        }
        window.addEventListener("keydown", listenForCtrlFP);
        return () => window.removeEventListener("keydown", listenForCtrlFP);
    }, []);

    React.useEffect(() => {
        // TODO: Consider promoting this state to parent
        if (props.omniBarState.barContents == "") {
            lastFocusedItem_.current = props.lastFocusedItem;
        }
    }, [props.lastFocusedItem]);

    return <div className="search-bar">
        <input ref={inputReference}
            placeholder={"🔍 Search"}
            value={props.omniBarState.barContents}
            onChange={(evt) => props.setOmniBarState((oldState) => ({ ...oldState, barContents: evt.target.value }))}
            onKeyDown={props.omnibarKeyHandler}
            style={{ flex: "1 0 auto", padding: "2px" }} />
        {props.children}
    </div>
}

export const getDefaultOmnibarState = (): OmniBarState => {
    return {
        barContents: "",
        selectionIdx: 0,
    }
}

export default OmniBarWrapper;