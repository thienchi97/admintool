import React, { Component } from "react";
import { Switch, Route, Redirect, withRouter, Link } from "react-router-dom";
import HeaderMenu from "./HeaderMenu";
import Class from "../pages/Class";
import Student from "../pages/Student";
import User from "../pages/User";
import { Layout, Menu } from "antd";
import images from "../imgaes/thienchi.jpg";
import image from "../imgaes/logout.jpg";
import logo from "../imgaes/tdt.png";
import Overview from "../pages/Overview";
import Diemdanh from "../pages/Diemdanh";

const { Header, Footer, Sider, Content } = Layout;

class LayoutMain extends Component {
  render() {
    const { isShowUserMenu = true, children } = this.props;

    return (
      <Layout>
        <Sider style={{ backgroundColor: "white" }}>
          <div className="logo">
            <img src={logo} alt="" style={{ height: 80, width: 190 }} />
            <Link to="/"></Link>
          </div>
          <div className="menu-sidebar__content js-scrollbar1">
            <div className="navbar-sidebar">
              <ul className="list-unstyled navbar__list">
                <li className="has-sub">
                  <div className="js-arrow">
                    <Link to="/diemdanh">Điểm danh</Link>
                  </div>
                </li>
                <li className="has-sub">
                  <div className="js-arrow">
                    <Link to="/class">Quản lí lớp học</Link>
                  </div>
                </li>
                <li className="has-sub">
                  <div className="js-arrow">
                    <Link to="/student">Quản lí sinh viên</Link>
                  </div>
                </li>
                {isShowUserMenu && (
                  <li className="has-sub">
                    <div className="js-arrow">
                      <Link to="/user">Thành viên</Link>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Sider>

        <Layout>
          <HeaderMenu></HeaderMenu>
          <Content>{this.props.children}</Content>
        </Layout>
      </Layout>
    );
  }
}
export default withRouter(LayoutMain);
