/**
 * @jest-environment jsdom
 */

// https://github.com/nareshbhatia/react-testing-techniques/blob/main/docs/fireEvent-vs-userEvent.md

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import * as React from "react";
import { it, expect } from '@jest/globals';
import Workflowish from "~/Workflowish";
import { fromNestedRecord } from '~/Workflowish/mvc/firstTimeDoc';
import { makeMockData } from '~/Workflowish/index.test';
import { FlatItemBlob, FlatItemData, fromTree, virtualRootId } from '~/Workflowish/mvc/model';
import { jestSetMakeUniqueKey } from "~CoreDataLake";

jestSetMakeUniqueKey(() => "newItem");

it('Copy Symlink Command works on plain item', async () => {
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
    await user.click(screen.getByTestId("search-bar"));
    await user.keyboard(">csl:{Enter}");
    const symlinkFlat: FlatItemData = getDataSetByConsumer()["intermediate_parent"] as FlatItemData;
    expect(symlinkFlat.children[2]).toBe("newItem")

})

it('Move Symlink (msl) Command moves item and creates symlink', async () => {
    const user = userEvent.setup({ delay: null }) // https://github.com/testing-library/user-event/issues/833

    const initialData: FlatItemBlob = fromTree(fromNestedRecord({
        data: virtualRootId,
        id: virtualRootId,
        children: [
            {
                data: "move target",
                id: "move_target"
            },
            {
                data: "source parent",
                id: "source_parent",
                children: [
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
    await user.click(screen.getByTestId("search-bar"));
    await user.keyboard(">msl:move target{Enter}");
    const set_data = getDataSetByConsumer();
    expect((set_data["move_target"] as FlatItemData).children[0]).toBe("child");
    expect((set_data["source_parent"] as FlatItemData).children[0]).toBe("newItem");
    expect((set_data["source_parent"] as FlatItemData).children.length).toBe(1);
})
