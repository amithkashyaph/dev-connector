import React, { Fragment } from "react";
import spinner from "./spinner.gif";

export default () => (
  <Fragment>
    <img
      src={spinner}
      style={{ margin: "auto", width: "200px", display: "block" }}
      alt="Loading..."
    />
  </Fragment>
);
