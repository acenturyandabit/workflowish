/**
 * @jest-environment jsdom
 */

// https://github.com/nareshbhatia/react-testing-techniques/blob/main/docs/fireEvent-vs-userEvent.md
import * as renderer from 'react-test-renderer';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import * as React from "react";
import { it, expect, jest } from '@jest/globals';
import Workflowish from "./index";
import { BaseStoreDataType, jestSetMakeUniqueKey } from '~CoreDataLake';
import { resolveAllDocuments } from '~CoreDataLake';
import { fromNestedRecord } from './mvc/firstTimeDoc';
import { FlatItemBlob, FlatItemData, fromTree, virtualRootId } from './mvc/model';

jestSetMakeUniqueKey(() => "newItem");

export const makeMockData = (mockData: BaseStoreDataType): [
    (newData:
        BaseStoreDataType |
        ((oldData: BaseStoreDataType) => BaseStoreDataType)
    ) => void,
    () => BaseStoreDataType
] => {
    let dataSetByConsumer = mockData;
    const mockUpdateData = (newData:
        BaseStoreDataType |
        ((oldData: BaseStoreDataType) => BaseStoreDataType)
    ) => {
        let newDataToSet: BaseStoreDataType;
        if (typeof newData == "function") {
            newDataToSet = newData(mockData);
        } else {
            newDataToSet = newData;
        }
        dataSetByConsumer = resolveAllDocuments([dataSetByConsumer, newDataToSet]);
    }
    const getDataSetByConsumer = () => dataSetByConsumer;
    return [mockUpdateData, getDataSetByConsumer]
}

it('Creates the new document if no document is provided', () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');

    const initialEmptyData = {};
    const [mockUpdateData, getDataSetByConsumer] = makeMockData(initialEmptyData);
    const component = renderer.create(
        <Workflowish
            data={initialEmptyData}
            updateData={mockUpdateData}
        ></Workflowish>
    )
    const firstRender = component.toJSON();
    expect(firstRender).toMatchSnapshot();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runAllTimers();

    const secondRender = renderer.create(
        <Workflowish
            data={getDataSetByConsumer()}
            updateData={mockUpdateData}
        ></Workflowish>
    )
    const secondRenderJ = secondRender.toJSON();
    expect(secondRenderJ).toMatchSnapshot();
    jest.restoreAllMocks();
    jest.useRealTimers();
})

it('Indents an item correctly when tabbed into a symlink', async () => {

    const user = userEvent.setup({ delay: null }) // https://github.com/testing-library/user-event/issues/833

    const initialData: FlatItemBlob = fromTree(fromNestedRecord({
        data: virtualRootId,
        id: virtualRootId,
        children: [
            {
                data: "symlink target",
                id: "symlink_target"
            },
            {
                data: "intermediate parent",
                id: "intermediate_parent",
                children: [
                    {
                        data: "[LN: symlink_target]",
                        id: "link_item"
                    },
                    {
                        data: "a child",
                        id: "child"
                    }
                ]
            }
        ]
    }));
    const [mockUpdateData, getDataSetByConsumer] = makeMockData(initialData);
    render(
        <Workflowish
            data={initialData}
            updateData={mockUpdateData}
        ></Workflowish>
    );

    await user.click(screen.getByTestId("child"));
    await user.keyboard("{Tab}");
    const symlinkFlat: FlatItemData = getDataSetByConsumer()["symlink_target"] as FlatItemData;
    expect(symlinkFlat.children[0]).toBe("child")

})

it('Unindents an item correctly when tabbed out from a symlink', async () => {

    const user = userEvent.setup({ delay: null }) // https://github.com/testing-library/user-event/issues/833

    const initialData: FlatItemBlob = fromTree(fromNestedRecord({
        data: virtualRootId,
        id: virtualRootId,
        children: [
            {
                data: "symlink target",
                id: "symlink_target",
                children: [{
                    data: "a child",
                    id: "child"
                }]
            },
            {
                data: "intermediate parent",
                id: "intermediate_parent",
                children: [
                    {
                        data: "[LN: symlink_target]",
                        id: "link_item"
                    },
                ]
            }
        ]
    }));
    const [mockUpdateData, getDataSetByConsumer] = makeMockData(initialData);

    render(
        <Workflowish
            data={initialData}
            updateData={mockUpdateData}
        ></Workflowish>
    );

    await user.click(screen.getByTestId("link_item@child"));
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    const newData: FlatItemBlob = getDataSetByConsumer() as FlatItemBlob;
    expect(newData["intermediate_parent"].children[1]).toBe("child")
    expect(newData["symlink_target"].children.length).toBe(0)

})


it("Unindent at root level doesn't explode", async () => {
    const user = userEvent.setup({ delay: null }) // https://github.com/testing-library/user-event/issues/833

    const initialData: FlatItemBlob = fromTree(fromNestedRecord({
        data: virtualRootId,
        id: virtualRootId,
        children: [
            {
                data: "root level item",
                id: "root_level_item"
            }
        ]
    }));
    const expected = JSON.stringify(initialData);
    const [mockUpdateData, getDataSetByConsumer] = makeMockData(initialData);

    render(
        <Workflowish
            data={initialData}
            updateData={mockUpdateData}
        ></Workflowish>
    );

    await user.click(screen.getByTestId("root_level_item"));
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(JSON.stringify(getDataSetByConsumer())).toBe(expected)

})

