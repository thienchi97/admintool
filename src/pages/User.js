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
      </Fragment>
    );
  }
}
export default withRouter(User);
