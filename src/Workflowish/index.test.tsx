/**
 * @jest-environment jsdom
 */

// https://github.com/nareshbhatia/react-testing-techniques/blob/main/docs/fireEvent-vs-userEvent.md
import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect, jest } from '@jest/globals';
import Workflowish from "./index";
import { BaseStoreDataType } from '~CoreDataLake';
import { resolveAllDocuments } from '~CoreDataLake';

const makeMockData = (mockData: BaseStoreDataType): [
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
        dataSetByConsumer = resolveAllDocuments([newDataToSet, mockData]);
    }
    const getDataSetByConsumer = () => dataSetByConsumer;
    return [mockUpdateData, getDataSetByConsumer]
}

it('Creates the new document if no document is provided', () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    Date.now = jest.fn(() => 1337);

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
})