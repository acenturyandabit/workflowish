import * as React from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import * as sanitizeHtml from "sanitize-html"
import { ControllerActions, makeListActions, TreeNodeArrayGetSetter } from "./controller";
import { ItemTreeNode } from "./model";



const Item = (props: {
    emptyList?: boolean,
    item: ItemTreeNode,
    pushRef: (ref: HTMLElement) => void,
    actions: ControllerActions
}) => {
    const [, setIsSelfEmpty] = React.useState(false);
    const itemsRefArray = React.useRef<Array<HTMLElement | null>>([])
    while (itemsRefArray.current.length < props.item.children.length) {
        itemsRefArray.current.push(null);
    }
    const onContentChange = React.useCallback((evt: ContentEditableEvent) => {
        const sanitizeConf = {
            allowedTags: ["b", "i", "a", "p"],
            allowedAttributes: { a: ["href"] }
        };
        setIsSelfEmpty(evt.currentTarget.innerText.length == 0);
        props.actions.getSetSelf(oldSelf => ({
            // this needs to be a getsetter as the useEffect is run only once, and so 
            // the self item at construction time is outdated
            ...oldSelf,
            data: sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf)
        }))
    }, [])
    const bulletPoint: string = props.emptyList ? ">" : "\u2022";
    const checkEnterPressed = (evt: React.KeyboardEvent) => {
        if (props.actions) {
            if (evt.key == "Enter") {
                props.actions.createNewItem();
                evt.preventDefault()
            }
            if (evt.key == "Tab") {
                if (evt.shiftKey) {
                    props.actions.unindentSelf();
                } else {
                    const sel = document.getSelection();
                    if (sel?.getRangeAt(0).startOffset == 0) {
                        props.actions.indentSelf();
                    }
                }
                evt.preventDefault()
            }
            if (evt.key == "ArrowUp") {
                if (evt.altKey) {
                    props.actions.putBeforePrev();
                } else {
                    props.actions.focusPrev();
                }
            }
            if (evt.key == "ArrowDown") {
                if (evt.altKey) {
                    props.actions.putAfterNext();
                } else {
                    props.actions.focusNext();
                }
            }
            if (evt.key == "Backspace") {
                setIsSelfEmpty((isSelfEmpty) => {
                    // isSelfEmpty is a dynamic value which needs to be queried
                    // using the setstate as a fetcher
                    if (isSelfEmpty) {
                        // use setTimeout (setImmediate) so that React doesn't complain about setstate
                        window.setTimeout(props.actions.deleteThisItem);
                        evt.preventDefault();
                    }
                    return isSelfEmpty;
                })
            }
        }
    }
    return <span style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <span style={{ display: "inline-flex", width: "100%" }}>
            {bulletPoint} &nbsp;<ContentEditable innerRef={props.pushRef} style={{ flex: "1 1 auto" }} onChange={onContentChange} html={props.item.data} onKeyDown={checkEnterPressed}></ContentEditable>
        </span>
        <div style={{ marginLeft: "10px" }}>
            {props.item.children.map((item, ii) => (<Item
                key={ii}
                item={item}
                pushRef={(ref: HTMLElement) => itemsRefArray.current[ii] = ref}
                actions={makeListActions({
                    siblingItemRefs: itemsRefArray,
                    currentSiblingIdx: ii,
                    getSetSiblingArray: (t: TreeNodeArrayGetSetter) => {
                        props.actions.getSetSelf((item) => ({
                            ...item,
                            children: t(item.children)
                        }))
                    },
                    unindentThis: () => {
                        props.actions.getSetSelf((item) => {
                            const newChildren = [...item.children];
                            const [splicedThis] = newChildren.splice(ii, 1);
                            props.actions.unindentChild(splicedThis);
                            return {
                                ...item,
                                children: newChildren
                            }
                        })
                    }
                })}
            ></Item>))}
        </div>
    </span >
}

export default Item;
