import { Dialog, DialogTitle, ThemeProvider, createTheme } from "@mui/material";
import * as React from "react";
import { useCoreDataLake } from "~CoreDataLake";
import NavBar from "~NavBar";
import { useKVStoresList } from "~Stores/KVStoreInstances";
import Workflowish from "~Workflowish";


export default () => {

  const [kvStores, setKVStores] = useKVStoresList();
  const [dataAndLoadState, updateData, doSave] = useCoreDataLake(kvStores);

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
    typography: {
      fontFamily: [
        'Noto Sans', 'Arial', 'Helvetica', 'sans-serif'
      ].join(","),
      fontSize: 12,
    },
  })
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
      ></NavBar>
      <div className="viewContainer">
        <Workflowish data={dataAndLoadState.data} updateData={updateData}></Workflowish>
      </div>
    </ThemeProvider>
  </div>
};
