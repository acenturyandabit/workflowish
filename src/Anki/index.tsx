import * as React from 'react';
import { BaseStoreDataType } from '~CoreDataLake';
import { TransformedDataAndSetter, flattenItems, getTransformedDataAndSetter } from './mvc/model';
import { Button, Menu, MenuItem } from '@mui/material';
import "./index.css";
import { TestModePanel, toDurationString } from './TestModePanel';
import { DataGrid } from '@mui/x-data-grid';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;
    return <>
        {value == index ? children : <></>}
    </>
}

const tabs = [
    "Test Mode",
    "Card Statistics"
]

export default (props: {
    data: BaseStoreDataType,
    updateData: React.Dispatch<React.SetStateAction<BaseStoreDataType>>
}) => {
    const transformedDataAndSetter = getTransformedDataAndSetter({ data: props.data, updateData: props.updateData });

    const [tabState, setTabState] = React.useState<{
        anchorEl: null | HTMLElement,
        open: boolean,
        tab: number
    }>({
        anchorEl: null,
        open: false,
        tab: 0
    })

    return <>
        <Button variant="contained" onClick={(evt) => { setTabState({ ...tabState, open: true, anchorEl: evt.currentTarget }); }} id="anki-mode-switch" fullWidth><h1 style={{ margin: 0 }}>{tabs[tabState.tab]}</h1></Button>
        <Menu open={tabState.open} onClose={() => setTabState({ ...tabState, open: false })} MenuListProps={{
            'aria-labelledby': 'anki-mode-switch',
        }} anchorEl={tabState.anchorEl}>
            {tabs.map((tabName, tabIdx) => {
                return <MenuItem key={tabName} onClick={() => setTabState({ ...tabState, tab: tabIdx })}>{tabName}</MenuItem>
            })}
        </Menu >
        <TabPanel value={tabState.tab} index={0}>
            <TestModePanel transformedDataAndSetter={transformedDataAndSetter} />
        </TabPanel>
        <TabPanel value={tabState.tab} index={1}>
            <CardStatsPanel transformedDataAndSetter={transformedDataAndSetter} />
        </TabPanel>
    </>
}

const CardStatsPanel = (props: {
    transformedDataAndSetter: TransformedDataAndSetter
}) => {
    const allItems = flattenItems(props.transformedDataAndSetter.transformedData).map(item => ({
        ...item,
    }));
    return <DataGrid
        rows={allItems}
        style={{ color: "white" }}
        columns={[{
            field: "testText",
            flex: 1
        }, {
            field: "nextDue",
            valueGetter: (params) => toDurationString(params.row.nextDue)
        }, {
            field: "familiarity",
            valueGetter: (params) => toDurationString(params.row.familiarity)
        }]}
    ></DataGrid>
}