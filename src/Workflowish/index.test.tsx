/**
 * @jest-environment jsdom
 */

// https://github.com/nareshbhatia/react-testing-techniques/blob/main/docs/fireEvent-vs-userEvent.md
import * as renderer from 'react-test-renderer';
import * as React from "react";
import { it, expect } from '@jest/globals';
import Workflowish from "./index";
import { BaseStoreDataType } from '~CoreDataLake';
import { resolveAllDocuments } from '~CoreDataLake';

const makeMockData = ():[
    BaseStoreDataType,
    (newData:
        BaseStoreDataType |
        ((oldData: BaseStoreDataType) => BaseStoreDataType)
    ) => void, 
    ()=>BaseStoreDataType
] => {
    const mockData: BaseStoreDataType = {};
    let _lastMockData = mockData;
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
        _lastMockData = resolveAllDocuments([newDataToSet, mockData]);
    }
    const lastMockData = () => _lastMockData;
    return [mockData, mockUpdateData, lastMockData]
}

it('Renders the new document if no document is provided', () => {
    // Honestly this isn't a great separation of concerns, could do with a refactor
    const [mockData, mockUpdateData] = makeMockData();
    const component = renderer.create(
        <Workflowish
            data={mockData}
            updateData={mockUpdateData}
        ></Workflowish>
    )
    const item = component.toJSON();
    expect(item).toMatchSnapshot();
})