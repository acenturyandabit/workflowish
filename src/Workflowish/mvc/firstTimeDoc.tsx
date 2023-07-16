import { ItemTreeNode, virtualRootId } from "./model";

export type DeflatedItemTreeNode = {
    data: string,
    id?: string
    children?: Array<DeflatedItemTreeNode | string>,
    collapsed?: boolean
}

export const generateFirstTimeWorkflowishDoc = (): ItemTreeNode => {
    const node: DeflatedItemTreeNode = {
        data: virtualRootId,
        id: virtualRootId,
        children: [
            "Welcome to Workflowish!",
            {
                data: "Workflowish is a keyboard-focused nested listing app.",
                collapsed: true,
                children: [
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
                                data: "An omni-bar like VSCode with search and a command palette.",
                                children: [
                                    "Press CTRL+F to search in workflowy; or if you really want to use the browser search, press CTRL+F twice.",
                                    "Press CTRL+P to open the command palette; then type the short name of the command to use it.",
                                    "Use the arrrow keys to navigate between the options of the search / commands.",
                                ]
                            },
                            {
                                data: "Symbolic links!",
                                children: [
                                    { data: "[LN: symlink_id]", collapsed: true },
                                    "You can create symlinks using the omnibar: Press CTRL+P then type 'l:' followed by the item you want to link to.",
                                    {
                                        data: "Or, you can use the legacy method...",
                                        collapsed: true,
                                        children: [
                                            "Write [LN: <item id>] to create a link to another item.",
                                            // TODO: Add a keyboard shortcut insetad of clicking on IDs.
                                            "You can determine item IDs by pressing ALT+SHIFT, then clicking on the ID to copy it to your clipboard.",
                                            "The keyboard shortcut for copying IDs is ALT+SHIFT+C. or ALT+SHIFT+ACT on mobile.",
                                            "You can also jump to a linked item using CTRL+J CTRL+ACT on mobile.",
                                            {
                                                data: "Symlinks refer to another item in the tree, and inherit all the same text and children as the item they refer to.",
                                                id: "symlink_id",
                                                children: [
                                                    "However, symlinked items have their own collapsed state.",
                                                ]
                                            }
                                        ]
                                    },
                                ]
                            }
                        ]
                    },
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
        ]

    }
    let helpNodeIdx = 0;
    return fromNestedRecord(node, () => { helpNodeIdx++; return `__help_${helpNodeIdx.toString()}` });
}

export const fromNestedRecord = (root: DeflatedItemTreeNode | string, idGenerator?: () => string): ItemTreeNode => {
    if (!idGenerator) {
        let counter = 0;
        idGenerator = () => {
            counter++;
            return "_fromNested_" + counter;
        }
    }
    if (typeof root == "string") {
        return {
            _lm: Date.now(),
            id: idGenerator(),
            data: root,
            children: [],
            collapsed: false,
            searchHighlight: []
        }
    } else return {
        _lm: Date.now(),
        id: root.id || idGenerator(),
        data: root.data,
        children: root.children?.map(i => fromNestedRecord(i, idGenerator)) || [],
        collapsed: root.collapsed || false,
        searchHighlight: []
    }
}