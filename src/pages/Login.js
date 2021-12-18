import React, { Component, Fragment } from "react";
import logo from "../imgaes/tdt.png";
import { withRouter } from "react-router-dom";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const uiConfig = {
  signInFlow: "popup",
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

class Login extends Component {
  render() {
    return (
      <Fragment>
        <div className="page-wrapper">
          <div className="page-content--bge5">
            <div className="container">
              <div className="login-wrap">
                <div className="login-content">
                  <div className="login-logo">
                    <img src={logo} alt="" />
                  </div>
                  <div className="login-form">
                    <StyledFirebaseAuth
                      uiConfig={uiConfig}
                      firebaseAuth={firebase.auth()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Login);
