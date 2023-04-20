import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import Item from "."
import { ControllerActions } from "../mvc/controller";

const mockEmptyFunction = () => {
    // Mock empty
}

const dummyactions: ControllerActions = {
    getSetSelf: mockEmptyFunction,
    createNewItem: mockEmptyFunction,
    deleteThisItem: mockEmptyFunction,
    focusMyPrevSibling: mockEmptyFunction,
    focusMyNextSibling: mockEmptyFunction,
    putBeforePrev: mockEmptyFunction,
    putAfterNext: mockEmptyFunction,
    indentSelf: mockEmptyFunction,
    unindentSelf: mockEmptyFunction,
    unindentGrandchild: mockEmptyFunction,
    getSetSiblingArray: mockEmptyFunction,
    getSetItems: mockEmptyFunction,
    focusItem: mockEmptyFunction
};

it('Renders an item', () => {
    const component = renderer.create(
        <Item
        item={{
            id: "test-id",
            lastModifiedUnixMillis: 0,
            data: "Hello world!",
            children: [],
            collapsed: true,
            searchHighlight: "NONE"
        }}
            pushRefGlobal={mockEmptyFunction}
            pushRef={mockEmptyFunction}
            actions={dummyactions}
            setFocusedActionReceiver={mockEmptyFunction}
            styleParams={{
                showId: false
            }}
        ></Item>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})