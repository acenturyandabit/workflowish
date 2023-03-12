import * as React from "react";
import FileMenu from "~FileMenu";
import Workflowish from "~Workflowish";

const preventUsersFromInstinctiveCtrlS = () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "s" && e.ctrlKey) {
      e.preventDefault();
    }
  });
}

export default () => {
  preventUsersFromInstinctiveCtrlS();
  return <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <FileMenu></FileMenu>
    <div className="viewContainer">
      <Workflowish></Workflowish>
    </div>
  </div>
};
