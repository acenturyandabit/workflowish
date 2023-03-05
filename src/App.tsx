import * as React from "react";
import Workflowish from "./Workflowish";

const preventUsersFromInstinctiveCtrlS = () => {
  window.addEventListener("keydown", (e) => {
    if (e.key == "s" && e.ctrlKey) {
      e.preventDefault();
    }
  });
}

export default () => {
  preventUsersFromInstinctiveCtrlS();
  return <>
    <h1>Workflowish</h1>
    <Workflowish></Workflowish>
  </>
};
