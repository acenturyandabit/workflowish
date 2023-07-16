import { Dialog, DialogTitle, ThemeProvider, createTheme } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import * as React from "react";
import Anki from "~Anki";
import { useCoreDataLake } from "~CoreDataLake";
import NavBar from "~NavBar";
import { useKVStoresList } from "~Stores/KVStoreInstances";
import Workflowish from "~Workflowish";

export const AvailableApps = {
  "Workflowish": Workflowish,
  "Anki": Anki
};

export type CoreAppState = {
  selectedApp: keyof typeof AvailableApps;
}

export default () => {

  const [kvStores, setKVStores] = useKVStoresList();
  const { dataAndLoadState, updateData, doSave } = useCoreDataLake(kvStores);

  React.useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (e.key == "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        doSave();
      }
    }
    window.addEventListener("keydown", keydownListener);
    return () => window.removeEventListener("keydown", keydownListener);
  }, [doSave])

  const theme = createTheme({
    palette: {
      primary: deepPurple
    },
    typography: {
      fontFamily: [
        'Noto Sans', 'Arial', 'Helvetica', 'sans-serif'
      ].join(","),
      fontSize: 12,
    },
  })
  const [coreAppState, setCoreAppState] = React.useState<CoreAppState>({
    selectedApp: "Workflowish"
  });
  const App = AvailableApps[coreAppState.selectedApp];
  return <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <ThemeProvider theme={theme}>
      <Dialog open={!dataAndLoadState.loaded} >
        <DialogTitle>Loading your document...</DialogTitle>
      </Dialog>
      <NavBar
        kvStores={kvStores}
        setKVStores={setKVStores}
        dataAndLoadState={dataAndLoadState}
        setData={updateData}
        coreAppState={coreAppState}
        setCoreAppState={setCoreAppState}
      ></NavBar>
      <div className="viewContainer">
        <App data={dataAndLoadState.data} updateData={updateData}></App>
      </div>
    </ThemeProvider>
  </div>
};
