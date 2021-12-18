import React, { Component } from "react";
import images from "../imgaes/thienchi.jpg";
import image from "../imgaes/logout.jpg";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import firebase from "firebase/compat";
import { getAuth, signOut } from "firebase/auth";
import { withRouter } from "react-router-dom";
const { Header } = Layout;

class HeaderMenu extends Component {
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
    const user = firebase.auth().currentUser || {};

    return (
      <Header
        className="site-layout-background"
        style={{ backgroundColor: "white", height: 80 }}
      >
        <div
          style={{
            float: "right",
            maxHeight: "100%",
            position: "relative",
          }}
        >
          <ul className="navbar-nav" style={{ flex: 1, marginRight: "16px" }}>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{ maxWidth: "100%" }}
              >
                <img
                  src={user.photoURL}
                  style={{
                    maxWidth: "40px",
                    height: "auto",
                    marginRight: "12px",
                  }}
                  className="rounded"
                />
                <a>{user.displayName}</a>
              </a>
              <div
                className="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                {
                  <a
                    className="dropdown-item"
                    style={{ lineHeight: 1.5 }}
                    onClick={this.signout}
                  >
                    Log Out
                  </a>
                }
              </div>
            </li>
          </ul>
        </div>
      </Header>
    );
  }
}

export default withRouter(HeaderMenu);
