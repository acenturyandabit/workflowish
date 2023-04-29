import * as React from 'react';
import { ItemTreeNode, TodoItemsGetSetterWithKeyedNodes } from '../../mvc/model';
import { ModelContext } from '~Workflowish/mvc/context';
import { FocusActions } from '~Workflowish/Item';
import "./index.css"
import { resetSearchState, searchTransformFromOmnibarState } from './Search';
import { OmniBarState } from './States';



export default (props: {
    children: React.ReactElement,
    itemRefsDictionary: Record<string, FocusActions>,
    getSetTodoItems: TodoItemsGetSetterWithKeyedNodes
}) => {
    const [omniBarState, setOmniBarState] = React.useState<OmniBarState>({
        barContents: "",
        searchState: resetSearchState()
    });
    const upperRootNode = React.useContext<ItemTreeNode>(ModelContext);
    const { rootNode,
        nMatches,
        currentMatchId,
        currentMatchParentChain
    } = searchTransformFromOmnibarState(upperRootNode, omniBarState, setOmniBarState);
    const focusOnCurrentItem = () => {
        setOmniBarState({ barContents: "", searchState: resetSearchState() });
        props.getSetTodoItems((oldRoot, oldKeyedNodes) => {
            currentMatchParentChain.forEach(itemKey => {
                oldKeyedNodes[itemKey].collapsed = false;
                oldKeyedNodes[itemKey].lastModifiedUnixMillis = Date.now();
            })
            return oldRoot;
        })
        props.itemRefsDictionary[currentMatchId].focusThis();
    }
    const scrollToCurrentItem = () => {
        props.itemRefsDictionary[currentMatchId]?.scrollThisIntoView();
    }
    return <>
        <OmniBar
            omniBarState={omniBarState}
            setOmniBarState={setOmniBarState}
            nMatches={nMatches}
            focusOnCurrentItem={focusOnCurrentItem}
            scrollToCurrentItem={scrollToCurrentItem}
        ></OmniBar>
        <ModelContext.Provider value={rootNode}>
            {props.children}
        </ModelContext.Provider>
    </>
}



const OmniBar = (props: {
    omniBarState: OmniBarState,
    setOmniBarState: React.Dispatch<React.SetStateAction<OmniBarState>>,
    focusOnCurrentItem: () => void,
    scrollToCurrentItem: () => void,
    nMatches: number
}) => {
    const inputReference = React.useRef<HTMLInputElement>(null);
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
                    props.setOmniBarState((currentState) => {
                        if (!currentState.barContents.startsWith(">")) {
                            return {
                                ...currentState,
                                barContents: ">"
                            }
                        } else {
                            return currentState;
                        }
                    })
                    visibleChangeOccured=true;
                }
                if (visibleChangeOccured) {
                    e.preventDefault();
                }
            }
        }
        window.addEventListener("keydown", listenForCtrlFP);
        return () => window.removeEventListener("keydown", listenForCtrlFP);
    }, [inputReference.current]);

    const matchMessage = props.nMatches > 0 ? `${props.omniBarState.searchState.searchSelectionIdx + 1} / ${props.nMatches} matches` : "No matches"

    return <div className="search-bar">
        <input ref={inputReference}
            placeholder={"🔍 Search"}
            value={props.omniBarState.barContents}
            onChange={(evt) => props.setOmniBarState((oldState) => ({ ...oldState, barContents: evt.target.value }))}
            onKeyDown={(evt) => {
                if (evt.key == "ArrowUp") {
                    props.setOmniBarState((oldState) => ({ ...oldState, searchState: { ...oldState.searchState, searchSelectionIdx: oldState.searchState.searchSelectionIdx - 1 } }))
                    window.setTimeout(props.scrollToCurrentItem, 1);
                } else if (evt.key == "ArrowDown") {
                    props.setOmniBarState((oldState) => ({ ...oldState, searchState: { ...oldState.searchState, searchSelectionIdx: oldState.searchState.searchSelectionIdx + 1 } }))
                    window.setTimeout(props.scrollToCurrentItem, 1);
                } else if (evt.key == "Enter") {
                    props.focusOnCurrentItem();
                } else {
                    // Search query was changed
                    window.setTimeout(props.scrollToCurrentItem, 1);
                }
            }}
            style={{ flex: "1 0 auto", padding: "2px" }}></input>
        {
            props.omniBarState.barContents.length > 0 ?
                <span>{matchMessage}</span> :
                null
        }
    </div >
}
