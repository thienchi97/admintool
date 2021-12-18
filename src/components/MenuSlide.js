import React, { Component } from "react";
import { Link } from "react-router-dom";


import logo from "../imgaes/Raceez-Fast Moving-03.png";

export default class menuslide extends Component {
  render() {
    return (
      <div
        className="menu-sidebar d-none d-lg-block"
        style={{ display: "flex" }}
      >
        <div className="logo">
          <img src={logo} alt="" />
          <Link to="/"></Link>
        </div>
        <div className="menu-sidebar__content js-scrollbar1">
          <div className="navbar-sidebar">
            <ul className="list-unstyled navbar__list">
              <li className="has-sub">
                <div className="js-arrow">
                  <Link to="/Home1">Data table</Link>
                </div>
              </li>
              <li className="has-sub">
                <div className="js-arrow">
                  <Link to="/detail">Detail Order</Link>
                </div>
              </li>
              <li className="has-sub">
                <div className="js-arrow">
                  <Link to="/user">User</Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
