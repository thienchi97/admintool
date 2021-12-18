import React, { Component, Fragment, useState } from "react";

import * as classes from "./Table.module.css";
import { Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import "firebase/auth";
import { getDatabase, onValue, ref, update } from "firebase/database";
import moment from "moment";
import { Input, Select, Button, Modal, Table } from "antd";
import ButtonAddUser from "../components/ButtonAddUser";
class User extends Component {
  state = {
    data: [],
    loading: false,
    total: 0,
    root: true,
  };

  database = getDatabase();

  columns = [
    {
      title: "Tên",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Active",
      key: "root",
      render: (row) => {
        return (
          <Switch
            defaultChecked={!!row.isAccept}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={this.handleSetActiveUser(row)}
          />
        );
      },
    },
  ];

  componentDidMount() {
    this.loadData();
  }

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(
        ref(this.database, `/teachers`),
        (snapshot) => {
          const value = snapshot.val();
          const total = snapshot.size;
          const data = Object.keys(value)
            .map((key, index) => ({
              ...value[key],
              key: index,
              createAt: moment().valueOf(),
            }))
            .filter((d) => !d.root);

          this.setState({
            total,
            data,
          });
        },
        {
          onlyOnce: true,
        }
      );

      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  handleSetActiveUser = (teacher) => (checked) => {
    const teacherRef = ref(this.database, `/teachers/${teacher.id}`);

    update(teacherRef, {
      isAccept: checked,
    });
  };

  render() {
    const { data, loading, total } = this.state;
    return (
      <Fragment>
        <div style={{ marginTop: 20, marginLeft: 30 }}>
          <span style={{ fontSize: "30px", fontWeight: "bold" }}>
            User admin
          </span>
          <ButtonAddUser style={{ float: "right", marginRight: 20 }} />
        </div>
        <div style={{ padding: "0px 8px" }}>
          <Table
            loading={loading}
            dataSource={data}
            columns={this.columns}
            pagination={{
              defaultPageSize: 5,
              total,
              onChange: (page) => this.loadData(page),
            }}
          />
        </div>
        {/* <table className="table table-hover">
          <tbody>
            <tr className={classes.backgroundTr}>
              <th scope="col" className={classes.backgroundTh}>
                #
              </th>
              <th scope="col" className={classes.backgroundTh}>
                Avatar
              </th>
              <th scope="col" className={classes.backgroundTh}>
                Username
              </th>
              <th scope="col" className={classes.backgroundTh}>
                Full name
              </th>
              <th scope="col" className={classes.backgroundTh}>
                Active
              </th>
            </tr>

            <tr>
              <td className={classes.backgroundTd}>
                <span> </span>
              </td>
              <td className="image">
                {" "}
                <img
                  className="rounded-circle"
                  style={{ width: 50, height: 50 }}
                  src={user.photoURL}
                  alt=" "
                />{" "}
              </td>
              <td
                className={classes.backgroundTd}
                style={{ color: "#1890ff", cursor: "pointer" }}
              >
                <span> {user.displayName}</span>
              </td>
              <td className={classes.backgroundTd} style={{ color: "#52c41a" }}>
                <span> {user.email} </span>
              </td>
              <td>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                />
              </td>
            </tr>
          </tbody>
        </table> */}
      </Fragment>
    );
  }
}
export default withRouter(User);
