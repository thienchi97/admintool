import { Button } from "antd";
import React, { Component } from "react";
import classes from "./RequestApproval.module.css";
import { getAuth, signOut } from "firebase/auth";

export default class RequestApproval extends Component {
  signout = () => {
    const auth = getAuth();
    const { history } = this.props;

    signOut(auth)
      .then(() => {
        // Sign-out successful.
        history.push("/login");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  render() {
    return (
      <div className={classes.container}>
        <h1 style={{ marginBottom: "1rem" }}>
          Vui lòng liên hệ admin để kích hoạt tài khoản
        </h1>
        <Button type="primary" onClick={this.signout}>
          Log out
        </Button>
      </div>
    );
  }
}
