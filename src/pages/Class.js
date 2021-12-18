import React, { useState, Component } from "react";
import { withRouter } from "react-router-dom";
import { Input, Select, Button, Modal, Table, DatePicker, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as classes from "./Table.module.css";

import firebase from "firebase/compat";
import "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import moment from "moment";
import * as uuid from "uuid";
import QrCreateButton from "../components/QrCreateButton";
import ButtonAdd from "../components/ButtonAddClass";
const { RangePicker } = DatePicker;

class Class extends Component {
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
      title: "Mã môn",
      dataIndex: "subjectCode",
      key: "subjectCode",
    },
    {
      title: "Tên Môn",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Giảng viên",
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher) => {
        return teacher.displayName;
      },
    },
    {
      title: "Thứ",
      dataIndex: "day",
      key: "day",
    },

    {
      title: "Quet QR",
      dataIndex: null,
      key: "QR",
      render: (classInfo) => {
        return <QrCreateButton classInfo={classInfo} />;
      },
    },
  ];

  onChange1 = (value, dateString) => {};

  onOk1 = (value) => {
    console.log("onOk: ", value);
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(ref(this.database, `/classroom`), (snapshot) => {
        const value = snapshot.val();
        const total = snapshot.size;
        const data = Object.keys(value).map((key, index) => ({
          ...value[key],
          key: index,
          createAt: moment().valueOf(),
        }));
        console.log(data);
        this.setState({
          total,
          data,
        });
      });

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
    console.log(uuid.v4());

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

          <Button
            className={classes.search}
            type="primary"
            icon={<SearchOutlined />}
          >
            Tìm kiếm
          </Button>
          <Button type="link">
            <ButtonAdd />
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

export default withRouter(Class);
