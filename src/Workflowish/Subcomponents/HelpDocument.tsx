import * as React from 'react';
import { BaseStoreDataType } from '~CoreDataLake';
import Workflowish from '~Workflowish';
import { generateFirstTimeDoc } from '~Workflowish/mvc/firstTimeDoc';
import { fromTree } from '~Workflowish/mvc/model';
export default (props: { helpDocLastOpen: number } ) => {
    const getHelpDoc = ()=>fromTree(generateFirstTimeDoc());
    const [data, setData] = React.useState<BaseStoreDataType>(getHelpDoc());
    React.useEffect(()=>{
        setData(getHelpDoc())
    }, [props.helpDocLastOpen])
    return <Workflowish data={data} updateData={setData}></Workflowish>
}