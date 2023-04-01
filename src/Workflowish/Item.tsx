import * as React from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import sanitizeHtml from "sanitize-html"
import { ControllerActions, makeListActions, TreeNodeArrayGetSetter } from "./controller";
import { ItemTreeNode, makeNewItem } from "./model";

export type FocusActions = {
    triggerFocusFromAbove: () => void;
    triggerFocusFromBelow: () => void;
    focusThis: () => void;
    focusThisEnd: () => void;
    focusRecentlyIndentedItem: () => void;
    focusMyNextSibling: () => void;
}

export type FocusedActionReceiver =
    {
        // wrapping required because of the way setState interprets a function - cannot pass a function directly
        wrappedFunction: (
            evt: {
                key: string,
                shiftKey: boolean,
                altKey: boolean,
                ctrlKey: boolean,
                metaKey: boolean,
                preventDefault: () => void
            }
        ) => void
    };

const Item = (props: {
    emptyList?: boolean,
    item: ItemTreeNode,
    pushRef: (ref: FocusActions) => void,
    parentActions: ControllerActions,
    setFocusedActionReceiver: React.Dispatch<React.SetStateAction<FocusedActionReceiver>>
}) => {
    const item = React.useRef(props.item);
    React.useEffect(() => {
        item.current = props.item
    }, [props.item]);
    const itemsRefArray = React.useRef<Array<FocusActions | null>>([])
    const thisContentEditable = React.useRef<HTMLElement | null>(null);
    while (itemsRefArray.current.length < props.item.children.length) {
        itemsRefArray.current.push(null);
    }
    while (itemsRefArray.current.length > props.item.children.length) {
        itemsRefArray.current.pop();
    }
    const onContentChange = React.useCallback((evt: ContentEditableEvent) => {
        const sanitizeConf = {
            allowedTags: ["b", "i", "a", "p"],
            allowedAttributes: { a: ["href"] }
        };
        props.parentActions.getSetSelf(oldSelf => ({
            // this needs to be a getsetter as the useEffect is run only once, and so 
            // the self item at construction time is outdated
            ...oldSelf,
            lastModifiedUnixMillis: Date.now(),
            data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
        }))
    }, [props.parentActions])
    const bulletPoint: React.ReactElement = <span style={{ paddingLeft: props.item.children.length ? "0px" : "0.2em" }}>{(() => {
        if (props.emptyList) return ">";
        else if (props.item.children.length) {
            if (props.item.collapsed) return "\u25b6";
            else return "\u25bc";
        } else {
            return "\u25CF";
        }
    })()}</span>;
    const focusedActionReceiver: FocusedActionReceiver = {
        wrappedFunction: (evt) => {
            if (evt.key == "Enter") {
                if (evt.shiftKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        children: [makeNewItem(), ...oldSelf.children]
                    }));
                    setTimeout(() => itemsRefArray.current?.[0]?.focusThis());
                } else {
                    props.parentActions.createNewItem();
                }
                evt.preventDefault()
            }
            if (evt.key == "Tab") {
                if (evt.shiftKey) {
                    props.parentActions.unindentSelf();
                } else {
                    props.parentActions.indentSelf();
                }
                evt.preventDefault()
            }
            if (evt.key == "ArrowUp") {
                if (evt.altKey) {
                    props.parentActions.putBeforePrev();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: true
                    }))
                } else {
                    props.parentActions.focusMyPrevSibling();
                }
            }
            if (evt.key == "ArrowDown") {
                if (evt.altKey) {
                    props.parentActions.putAfterNext();
                } else if (evt.ctrlKey || evt.metaKey) {
                    props.parentActions.getSetSelf(oldSelf => ({
                        ...oldSelf,
                        collapsed: false
                    }))
                } else {
                    const childrenArray = itemsRefArray.current;
                    if (!item.current.collapsed && childrenArray && childrenArray.length) {
                        childrenArray[0]?.triggerFocusFromAbove();
                    } else {
                        props.parentActions.focusMyNextSibling();
                    }
                }
            }
            if (evt.key == "Backspace") {
                if (item.current.data.length == 0) {
                    props.parentActions.deleteThisItem();
                    evt.preventDefault();
                }
            }
        }
    }
    const onKeyDown = (evt: React.KeyboardEvent) => {
        // TODO: inline this method
        focusedActionReceiver.wrappedFunction(evt);
    }

    const focusThis = () => {
        thisContentEditable.current?.focus();
        props.setFocusedActionReceiver(focusedActionReceiver);
    }

    const parentFocusActions = {
        focusThis,
        triggerFocusFromAbove: () => {
            focusThis()
        },
        triggerFocusFromBelow: () => {
            const currentChildItemsRef = itemsRefArray.current;
            if (!props.item.collapsed && currentChildItemsRef && currentChildItemsRef.length) {
                currentChildItemsRef[currentChildItemsRef.length - 1]?.triggerFocusFromBelow();
            } else {
                focusThis()
            }
        },
        focusThisEnd: () => {
            const _thisContentEditable = thisContentEditable.current;
            if (_thisContentEditable) {
                const length = _thisContentEditable.innerText.length;
                _thisContentEditable.focus();
                if (_thisContentEditable.lastChild != null) {
                    const sel = window.getSelection();
                    sel?.collapse(_thisContentEditable.firstChild, length);
                }
            }
        },
        focusMyNextSibling: props.parentActions.focusMyNextSibling,
        focusRecentlyIndentedItem: () => {
            setTimeout(() => {
                itemsRefArray.current?.[itemsRefArray.current.length - 1]?.focusThis();
            })
        }
    }
    props.pushRef(parentFocusActions);
    const childItems = <div style={{
        paddingLeft: "5px",
        borderLeft: "1px solid white",
        marginLeft: "0.5em"
    }}>
        {props.item.children.map((item, ii) => (<Item
            key={ii}
            item={item}
            pushRef={(ref: FocusActions) => itemsRefArray.current[ii] = ref}
            setFocusedActionReceiver={props.setFocusedActionReceiver}
            parentActions={makeListActions({
                siblingsFocusActions: itemsRefArray,
                currentSiblingIdx: ii,
                getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                    props.parentActions.getSetSelf((item) => ({
                        ...item,
                        lastModifiedUnixMillis: Date.now(),
                        children: t(item.children)
                    }))
                },
                unindentCaller: () => {
                    props.parentActions.getSetSelf((item) => {
                        const newChildren = [...item.children];
                        const [splicedThis] = newChildren.splice(ii, 1);
                        props.parentActions.unindentChild(splicedThis);
                        return {
                            ...item,
                            lastModifiedUnixMillis: Date.now(),
                            children: newChildren
                        }
                    })
                },
                parentFocusActions
            })}
        ></Item>))}
    </div>;

    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            thisContentEditable.current = contenteditableElement;
        }
        , []);
    return <span style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <span style={{ display: "inline-flex", width: "100%" }}>
            {bulletPoint} &nbsp;<ContentEditable innerRef={memoizedInnerRef} style={{ flex: "1 1 auto" }} onChange={onContentChange} html={props.item.data} onKeyDown={onKeyDown}></ContentEditable>
        </span>
        {props.item.collapsed ? null : childItems}
    </span >
}

export default Item;
