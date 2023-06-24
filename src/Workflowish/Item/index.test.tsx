import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import Item from "."
import { makeItemActions } from '~Workflowish/mvc/controller';
import { ItemTreeNode } from '~Workflowish/mvc/model';
import { DFSFocusManager } from '~Workflowish/mvc/DFSFocus';

const mockEmptyFunction = () => {
    // Mock empty
}

const dummyItem: ItemTreeNode = {
    id: "",
    children: [],
    collapsed: false,
    lastModifiedUnixMillis: 0,
    searchHighlight: [],
    data: ""
};

it('Renders an item', () => {
    const model = {
        transformedData: {
            rootNode: dummyItem,
            keyedNodes: {},
            parentById: {}
        },
        setItemsByKey: mockEmptyFunction
    };
    const focusManager = new DFSFocusManager();
    const dummyAction = makeItemActions({
        treePath: [0],
        focusManager: focusManager,
        disableDelete: () => false,
        thisItem: dummyItem,
        model
    })
    const component = renderer.create(
        <Item
            item={{
                id: "test-id",
                lastModifiedUnixMillis: 0,
                data: "Hello world!",
                children: [],
                collapsed: true,
                searchHighlight: []
            }}
            treePath={[0]}
            focusManager={focusManager}
            pushRef={mockEmptyFunction}
            actions={dummyAction}
            setThisAsFocused={mockEmptyFunction}
            styleParams={{
                showId: false
            }}
            model={model}
        ></Item>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})