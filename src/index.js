import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const config = {
  apiKey: "AIzaSyBKPpUgv1gt5viOx6ZY8M2kdmtMkCPq3xc",
  authDomain: "attendence-c004c.firebaseapp.com",
  databaseURL: "https://attendence-c004c-default-rtdb.firebaseio.com",
  projectId: "attendence-c004c",
  storageBucket: "attendence-c004c.appspot.com",
  messagingSenderId: "677376354651",
  appId: "1:677376354651:web:f78a6dc454b1f66f0c527e",
  measurementId: "G-5CYSMQ6EJQ",
};

firebase.initializeApp(config);

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("main")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
