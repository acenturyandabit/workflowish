import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import Item from "./Item"
import { ControllerActions } from "./controller";

const mockEmptyFunction = () => {
    // Mock empty
}

const dummyParentActions: ControllerActions = {
    getSetSelf: mockEmptyFunction,
    createNewItem: mockEmptyFunction,
    deleteThisItem: mockEmptyFunction,
    focusMyPrevSibling: mockEmptyFunction,
    focusMyNextSibling: mockEmptyFunction,
    putBeforePrev: mockEmptyFunction,
    putAfterNext: mockEmptyFunction,
    indentSelf: mockEmptyFunction,
    unindentSelf: mockEmptyFunction,
    unindentChild: mockEmptyFunction,
};

it('Renders an item', () => {
    const component = renderer.create(
        <Item
            item={{
                id: "test-id",
                lastModifiedUnixMillis: 0,
                data: "Hello world!",
                children: [],
                collapsed: true
            }}
            pushRef={mockEmptyFunction}
            parentActions={dummyParentActions}
            setFocusedActionReceiver={mockEmptyFunction}
        ></Item>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})