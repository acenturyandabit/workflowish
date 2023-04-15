import { makeNewUniqueKey } from "~CoreDataLake";
import { ItemTreeNode, virtualRootId } from "./model";

type DeflatedItemTreeNode = {
    data: string,
    id?: string
    children?: Array<DeflatedItemTreeNode | string>,
    collapsed?: boolean
}

export const generateFirstTimeDoc = (): ItemTreeNode => {
    const node: DeflatedItemTreeNode = {
        data: "__root",
        children: [
            "Welcome to Workflowish!",
            {
                data: "Workflowish is a simple recursive listing app.",
                collapsed: true,
                children: [
                    "With a few nifty tricks up its sleeve, like:",
                    { data: "[LN: symlink_id]", collapsed: true },
                    { data: "[LN: scripting_engine]", collapsed: true }
                ]
            },
            {
                data: "This means you can nest bullet points...",
                children: [{
                    data: "Like this,",
                    children: [{
                        data: "And this,",
                        children: [{
                            data: "And so on."
                        }]
                    }]
                }]
            },
            {
                data: "You can edit any item in the list by clicking it and typing :)",
                children: [
                    "You can also add new items by pressing Enter on an existing item; or,",
                    "Backspace all the way to the end, and then once more, to delete an item.",
                    "Press CTRL+S to save your changes to your browser. (Other save options are available, read on!)"
                ]
            },
            {
                data: "Since lists get complicated, you can also collapse/show lists by focusing on an item and pressing CTRL+UP/DOWN.",
                collapsed: true,
                children: [{
                    data: "Workflowish is a keyboard-first experience, so you can use the up and down keys to navigate through the list.",
                    collapsed: true,
                    children: [{
                        data: "You can also click on the bullet points as well if you _have_ to use a mouse."
                    }],
                },
                    "You can use ALT + UP/DOWN to rearrange items relative to each other.",
                    "SHIFT+ENTER allows you to create children immediately under an item, instead of creating a sibling.",
                {
                    data: "You can use TAB to indent a child below its previous sibling,",
                    children: ["and SHIFT + TAB to unindent a child."]
                }
                ],
            },
            {
                data: "Workflowish is inspired by Workflowy (https://workflowy.com/), but is free and open source, with in-browser storage or self-hosting.",
                children: [{
                    data: "Workflowish also works on a mobile phone, again with a keyboard-first experience.",
                    collapsed: true,
                    children: [
                        "On mobile, you can use the modifiers provided to perform the same actions as on desktop.",
                        "You can configure autosave in the File menu.",
                        "Workflowish is a Progressive Web App - so you can add it to your homepage and start using it immediately!.",
                    ]
                }, {
                    data: "For self-hosted storage, clone the github repository (https://github.com/acenturyandabit/workflowish) and follow the README.",
                }]
            },
            {
                data: "As an extra treat for superusers out there, Workflowish also comes with:",
                collapsed: true,
                children: [
                    {
                        data: "A scripting engine to automate your workflow!",
                        children: ["See the Scripts menu for more information."],
                        id: "scripting_engine",
                        collapsed: true
                    },
                    {
                        data: "Symbolic links!",
                        id: "symlink_id",
                        children: [
                            "Write \\[LN: <item id>\\] to create a link to another item.",
                            "You can determine item IDs by pressing ALT+SHIFT, then clicking on the ID to copy it to your clipboard.",
                            "Symlinked items have their own collapsed state.",
                        ]
                    }
                ]
            }
        ]

    }
    return fromNestedRecord(node, virtualRootId);
}

const fromNestedRecord = (root: DeflatedItemTreeNode | string, id?: string): ItemTreeNode => {
    if (typeof root == "string") {
        return {
            lastModifiedUnixMillis: Date.now(),
            id: makeNewUniqueKey(),
            data: root,
            children: [],
            collapsed: false,
            searchHighlight: "NONE"
        }
    } else return {
        lastModifiedUnixMillis: Date.now(),
        id: id || root.id || makeNewUniqueKey(),
        data: root.data,
        children: root.children?.map(i => fromNestedRecord(i)) || [],
        collapsed: root.collapsed || false,
        searchHighlight: "NONE"
    }
}