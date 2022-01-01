import React, { Component } from "react";
import moment from "moment";
import { withRouter } from "react-router-dom";
import { Table } from "antd";
import { getDatabase, onValue, ref } from "firebase/database";
import { values } from "lodash";
import DanhsachDiemDanh from "../components/DanhsachDiemDanh";
import AttendanceClassName from "../components/AttendanceClassName";

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
      title: "Thời gian tạo",
      key: "createdAt",
      dataIndex: "createAt",
      render: (createAt) => {
        if (!createAt) return null;

        return (
          <p style={{ marginBottom: 0 }}>
            {moment(createAt).format("HH:mm DD/MM/YYYY")}
          </p>
        );
      },
    },
    {
      title: "ID lớp học",
      dataIndex: "classId",
      key: "classId",
    },
    {
      title: "Tên lớp học",
      key: "className",
      render: (record) => {
        return (
          <AttendanceClassName key={record.classId} classId={record.classId} />
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record) => {
        const isActive = moment(Date.now()).isBetween(
          moment(record.startAt),
          moment(record.endAt),
          undefined,
          "[]"
        );

        return (
          <p style={{ marginBottom: 0 }}>
            {isActive ? "Còn hiệu lực" : "Hết hiệu lực"}
          </p>
        );
      },
    },
    {
      title: "Danh sách điểm danh",
      dataIndex: "attendenced",
      key: "attendenced",
      render: (attendenced) => {
        return <DanhsachDiemDanh attendenced={attendenced} />;
      },
    },
  ];

  componentDidMount() {
    this.loadData();
  }

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(ref(this.database, `/attendence`), (snapshot) => {
        const value = snapshot.val() || {};

        const result = Object.keys(value).map((key) => {
          const attendanceData = values(value[key]);
          return attendanceData.map((a) => ({ ...a, classId: key }));
        });

        this.setState({ data: result.flat() });
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

    return (
      <React.Fragment>
        <div
          className="example-input"
          style={{ marginTop: 20, marginLeft: 10 }}
        ></div>

        <div style={{ padding: "0px 8px" }}>
          <Table
            loading={loading}
            dataSource={data}
            columns={this.columns}
            h
            pagination={{
              defaultPageSize: 5,
              total,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Diemdanh);
