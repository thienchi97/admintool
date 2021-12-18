import { Table } from "antd";
import {
  getDatabase,
  onValue,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";

class Class extends Component {
  state = {
    data: [],
    loading: false,
    total: 0,
  };

  database = getDatabase();

  columns = [
    {
      title: "Name",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "CreateAt",
      dataIndex: "createAt",
      key: "createAt",
      render: (createAt) => (
        <p style={{ marginBottom: 0 }}>
          {moment(createAt).format("HH:mm DD/MM/YYYY")}
        </p>
      ),
    },
  ];

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(
        ref(this.database, `/classroom/`),
        (snapshot) => {
          const value = snapshot.val();
          const total = snapshot.size;
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

  render() {
    const { data, loading, total } = this.state;

    return (
      <Table
        loading={loading}
        dataSource={data}
        columns={this.columns}
        pagination={{
          defaultPageSize: 5,
          total,
          onChange: (page) => loadData(page),
        }}
      />
    );
  }
}

export default withRouter(Class);
