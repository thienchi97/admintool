import React, { Component, Fragment } from "react";

import { Popconfirm, Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import "firebase/auth";
import { getDatabase, onValue, ref, update, remove } from "firebase/database";
import moment from "moment";
import { Button, Table } from "antd";

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
    {
      title: "Xóa",

      key: "delete",
      render: (teacher) => {
        return (
          <Popconfirm
            title="Xác nhận xóa giảng viên?"
            onConfirm={() => this.handleDelete(teacher)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
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

      onValue(ref(this.database, `/teachers`), (snapshot) => {
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
      });

      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };
  handleDelete = (teacher) => {
    const teacherRef = ref(this.database, `/teachers/${teacher.id}`);

    remove(teacherRef);
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
            Giảng viên
          </span>
        </div>
        <div style={{ padding: "0px 8px" }}>
          <Table
            loading={loading}
            dataSource={data}
            columns={this.columns}
            pagination={{
              defaultPageSize: 10,
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
