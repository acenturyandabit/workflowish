import * as React from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import * as sanitizeHtml from "sanitize-html"
import * as localforage from "localforage";

export default () => {

    const [todoItems, setTodoItems] = useSavedItems();
    const itemsRefArray = React.useRef<Array<HTMLElement | null>>([])
    while (itemsRefArray.current.length < todoItems.length) {
        itemsRefArray.current.push(null);
    }
    const itemsList = todoItems.map((i, ii) => {
        const listActions = {
            createNewItem: () => {
                setTodoItems((todoItems) => {
                    const newTodoItems = [...todoItems];
                    newTodoItems.splice(ii, 0, "");
                    return newTodoItems;
                })
            },
            deleteThisItem: () => {
                if (todoItems.length > 1) {
                    setTodoItems((todoItems) => {
                        const newTodoItems = [...todoItems];
                        newTodoItems.splice(ii, 1);
                        return newTodoItems;
                    })
                }
            },
            focusNext: () => {
                console.log(itemsRefArray.current)
                itemsRefArray.current[ii + 1]?.focus()
            },
            focusPrev: () => {
                console.log(itemsRefArray.current)
                itemsRefArray.current[ii - 1]?.focus()
            },
            putBeforePrev: () => {
                if (ii > 0) {
                    const newTodoItems = [...todoItems];
                    const [thisItem] = newTodoItems.splice(ii, 1);
                    newTodoItems.splice(ii - 1, 0, thisItem);
                    setTodoItems(newTodoItems);
                    itemsRefArray.current[ii - 1]?.focus();
                }
            },
            putAfterNext: () => {
                if (ii < todoItems.length - 1) {
                    const newTodoItems = [...todoItems];
                    const [thisItem] = newTodoItems.splice(ii, 1);
                    newTodoItems.splice(ii + 1, 0, thisItem);
                    setTodoItems(newTodoItems);
                    // Changing the list does not change the item refs; so focus on the next item
                    itemsRefArray.current[ii + 1]?.focus();
                }
            }
        };
        return (<Item
            key={ii}
            emptyList={todoItems.length == 1 && i == ""}
            item={i}
            setItem={(newValue: string) => {
                setTodoItems((todoItems) => {
                    const newTodoItems = [...todoItems];
                    newTodoItems[ii] = newValue;
                    return newTodoItems;
                })
            }}
            pushRef={(ref: HTMLElement) => itemsRefArray.current[ii] = ref}
            actions={listActions}
        ></Item >)
    })
    return <div>
        {itemsList}
    </div>
};

const useSavedItems = (): [Array<string>, React.Dispatch<React.SetStateAction<Array<string>>>] => {
    const [todoItems, setTodoItems] = React.useState<Array<string>>([""])
    React.useEffect(() => {
        (async () => {
            const localForageTodoItems = await localforage.getItem("items")
            if (localForageTodoItems) {
                setTodoItems(localForageTodoItems as Array<string>);
            }
        })()
    }, [])

    React.useEffect(() => {
        localforage.setItem("items", todoItems);
    }, [todoItems])

    return [todoItems, setTodoItems];
}



const Item = (props: {
    emptyList?: boolean,
    item: string,
    setItem: (item: string) => void,
    pushRef: (ref: HTMLElement) => void,
    actions: {
        createNewItem: () => void,
        deleteThisItem: () => void
        focusPrev: () => void
        focusNext: () => void
        putBeforePrev: () => void
        putAfterNext: () => void
    }
}) => {
    const [, setIsSelfEmpty] = React.useState(false);
    const onContentChange = React.useCallback((evt: ContentEditableEvent) => {
        const sanitizeConf = {
            allowedTags: ["b", "i", "a", "p"],
            allowedAttributes: { a: ["href"] }
        };
        setIsSelfEmpty(evt.currentTarget.innerText.length == 0);
        props.setItem(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf))
    }, [])
    const bulletPoint: string = props.emptyList ? ">" : "\u2022";
    const checkEnterPressed = (evt: React.KeyboardEvent) => {
        if (props.actions) {
            if (evt.key == "Enter") {
                props.actions.createNewItem();
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
    return <span style={{ display: "inline-flex", width: "100%" }}> {bulletPoint} &nbsp;
        <ContentEditable innerRef={props.pushRef} style={{ flex: "1 1 auto" }} onChange={onContentChange} html={props.item} onKeyDown={checkEnterPressed}></ContentEditable>
    </span >
}

