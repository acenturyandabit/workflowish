import * as React from "react";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import * as sanitizeHtml from "sanitize-html"
import * as localforage from "localforage";

export default () => {

    const [todoItems, setTodoItems] = useSavedItems();

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
    actions: {
        createNewItem: () => void,
        deleteThisItem: () => void
    }
}) => {
    const [isSelfEmpty, setIsSelfEmpty] = React.useState(false);
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
        <ContentEditable style={{ flex: "1 1 auto" }} onChange={onContentChange} html={props.item} onKeyDown={checkEnterPressed}></ContentEditable>
    </span>
}

