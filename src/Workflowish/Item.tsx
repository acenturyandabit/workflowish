import * as React from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import * as sanitizeHtml from "sanitize-html"
import { ControllerActions, makeListActions, TreeNodeArrayGetSetter } from "./controller";
import { ItemTreeNode } from "./model";

export type ItemRef = {
    triggerFocusFromAbove: () => void;
    triggerFocusFromBelow: () => void;
    focusThis: () => void;
    focusRecentlyIndentedItem: () => void;
}

const Item = (props: {
    emptyList?: boolean,
    item: ItemTreeNode,
    pushRef: (ref: ItemRef) => void,
    parentActions: ControllerActions
}) => {
    const [, setIsSelfEmpty] = React.useState(props.item.data.length == 0);
    React.useEffect(() => {
        setIsSelfEmpty(props.item.data.length == 0)
    }, [props.item.data]);
    const itemsRefArray = React.useRef<Array<ItemRef | null>>([])
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
            data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
        }))
    }, [setIsSelfEmpty, props])
    const bulletPoint: string = props.emptyList ? ">" : "\u2022";
    const checkEnterPressed = (evt: React.KeyboardEvent) => {
        if (evt.key == "Enter") {
            props.parentActions.createNewItem();
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
            } else {
                props.parentActions.focusMyPrevSibling();
            }
        }
        if (evt.key == "ArrowDown") {
            if (evt.altKey) {
                props.parentActions.putAfterNext();
            } else {
                const childrenArray = itemsRefArray.current;
                if (childrenArray && childrenArray.length) {
                    childrenArray[0]?.triggerFocusFromAbove();
                } else {
                    props.parentActions.focusMyNextSibling();
                }
            }
        }
        if (evt.key == "Backspace") {
            setIsSelfEmpty((isSelfEmpty) => {
                // isSelfEmpty is a dynamic value which needs to be queried
                // using the setstate as a fetcher
                if (isSelfEmpty) {
                    // use setTimeout (setImmediate) so that React doesn't complain about setstate
                    window.setTimeout(props.parentActions.deleteThisItem);
                    evt.preventDefault();
                }
                return isSelfEmpty;
            })
        }
    };
    props.pushRef({
        triggerFocusFromAbove: () => {
            thisContentEditable.current?.focus();
        },
        triggerFocusFromBelow: () => {
            const currentChildItemsRef = itemsRefArray.current;
            if (currentChildItemsRef && currentChildItemsRef.length) {
                currentChildItemsRef[currentChildItemsRef.length - 1]?.triggerFocusFromBelow();
            } else {
                thisContentEditable.current?.focus();
            }
        },
        focusThis: () => {
            thisContentEditable.current?.focus();
        },
        focusRecentlyIndentedItem: () => {
            setTimeout(() => {
                itemsRefArray.current?.[itemsRefArray.current.length - 1]?.focusThis();
            })
        }
    })
    const memoizedInnerRef = React.useCallback(
        (contenteditableElement: HTMLElement) => {
            thisContentEditable.current = contenteditableElement;
        }
        , []);
    return <span style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <span style={{ display: "inline-flex", width: "100%" }}>
            {bulletPoint} &nbsp;<ContentEditable innerRef={memoizedInnerRef} style={{ flex: "1 1 auto" }} onChange={onContentChange} html={props.item.data} onKeyDown={checkEnterPressed}></ContentEditable>
        </span>
        <div style={{ marginLeft: "10px" }}>
            {props.item.children.map((item, ii) => (<Item
                key={ii}
                item={item}
                pushRef={(ref: ItemRef) => itemsRefArray.current[ii] = ref}
                parentActions={makeListActions({
                    siblingItemRefs: itemsRefArray,
                    currentSiblingIdx: ii,
                    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                        props.parentActions.getSetSelf((item) => ({
                            ...item,
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
                                children: newChildren
                            }
                        })
                    },
                    parentFocus: {
                        focusThis: () => {
                            thisContentEditable.current?.focus();
                        },
                        focusMyNextSibling: props.parentActions.focusMyNextSibling,
                    }
                })}
            ></Item>))}
        </div>
    </span >
}

export default Item;
