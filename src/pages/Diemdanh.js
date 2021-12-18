import React, { useState, Component } from "react";
import { withRouter } from "react-router-dom";
import { Input, Select, Button, Modal, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as classes from "./Table.module.css";
import QRCode from "react-qr-code";
import firebase from "firebase/compat";
import "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import moment from "moment";

class Diemdanh extends Component {
  state = {
    data: [],
    loading: false,
    total: 0,
    modal1Visible: false,
    modal2Visible: false,
  };

  database = getDatabase();

  columns = [
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <p style={{ marginBottom: 0 }}>
          {moment(createdAt).format("HH:mm DD/MM/YYYY")}
        </p>
      ),
    },
    {
      title: "duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Start at",
      dataIndex: "startAt",
      key: "startAt",
    },
    {
      title: "end at",
      dataIndex: "endAt",
      key: "endAt",
    },
  ];

  componentDidMount() {
    this.loadData();
  }

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(
        ref(this.database, `/attendence`),
        (snapshot) => {
          const value = snapshot.val();
          const total = snapshot.size;
          console.log(value);
          const data = Object.keys(value).map((key, index) => ({
            ...value[key],
            key: index,
            createAt: moment().valueOf(),
          }));

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

  setModal1Visible(modal1Visible) {
    this.setState({ modal1Visible });
  }

  setModal2Visible(modal2Visible) {
    this.setState({ modal2Visible });
  }

  render() {
    const { data, loading, total } = this.state;

    return (
      <React.Fragment>
        <div
          className="example-input"
          style={{ marginTop: 20, marginLeft: 10 }}
        >
          <Select
            className={classes.paymentMethod}
            style={{ width: 50 }}
            defaultValue="Khoa"
            onChange=""
          ></Select>
          <Select
            className={classes.paymentMethod}
            style={{ width: 50 }}
            defaultValue="Lớp"
            onChange=""
          ></Select>
          <Select
            className={classes.paymentMethod}
            style={{ width: 50 }}
            defaultValue=""
          ></Select>
          <Button
            className={classes.search}
            type="primary"
            icon={<SearchOutlined />}
          >
            Tìm kiếm
          </Button>
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
      </React.Fragment>
    );
  }
}

export default withRouter(Diemdanh);
