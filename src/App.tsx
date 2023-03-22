import { Dialog, DialogTitle } from "@mui/material";
import * as React from "react";
import { useCoreDataLake } from "~CoreDataLake";
import NavBar from "~NavBar";
import { useKVStoresList } from "~Stores/KVStoreInstances";
import Workflowish from "~Workflowish";


export default () => {

  const [kvStores, setKVStores] = useKVStoresList();
  const [dataAndLoadState, setData, doSave] = useCoreDataLake(kvStores);

  React.useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (e.key == "s" && e.ctrlKey) {
        e.preventDefault();
        doSave();
      }
    }
    window.addEventListener("keydown", keydownListener);
    return () => window.removeEventListener("keydown", keydownListener);
  }, [doSave])


  return <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Dialog open={!dataAndLoadState.loaded} >
      <DialogTitle>Loading your document...</DialogTitle>
    </Dialog>
    <NavBar
      kvStores={kvStores}
      setKVStores={setKVStores}
      dataAndLoadState={dataAndLoadState}
      setData={setData}
    ></NavBar>
    <div className="viewContainer">
      <Workflowish data={dataAndLoadState.data} setData={setData}></Workflowish>
    </div>
  </div>
};
