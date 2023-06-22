import * as React from 'react';
import { BaseStoreDataType, resolveAllDocuments } from '~CoreDataLake';
import Workflowish from '~Workflowish';
import { generateFirstTimeWorkflowishDoc } from '~Workflowish/mvc/firstTimeDoc';
import { fromTree } from '~Workflowish/mvc/model';
export default (props: { helpDocLastOpen: number }) => {
    const getHelpDoc = () => fromTree(generateFirstTimeWorkflowishDoc());
    const [data, setData] = React.useState<BaseStoreDataType>(getHelpDoc());
    const updateData = (data: BaseStoreDataType |
        ((currentData: BaseStoreDataType) => BaseStoreDataType)) => {
        setData(oldData => {
            let dataToSet: BaseStoreDataType;
            if (data instanceof Function) {
                dataToSet = data(oldData);
            } else {
                dataToSet = data;
            }
            dataToSet = resolveAllDocuments([dataToSet, oldData]);
            return dataToSet;

        })
    }
    React.useEffect(() => {
        setData(getHelpDoc())
    }, [props.helpDocLastOpen])
    return <Workflowish data={data} updateData={updateData}></Workflowish>
}