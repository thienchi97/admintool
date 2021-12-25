import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Input, DatePicker, Select, Button, Table, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as classes from "./Table.module.css";
import "firebase/auth";
import { getDatabase, onValue, ref, runTransaction } from "firebase/database";
import moment from "moment";
import styles from "./Student.module.css";
import InputFiles from "react-input-files";
import * as XLSX from "xlsx";
import { firebaseUUID } from "../utils";
import { mapKeys } from "lodash";
import Papa from "papaparse";
import EditStudent from "../components/EditStudent";

const { RangePicker } = DatePicker;

class Student extends Component {
  state = {
    columns: [],
    data: [],
    loading: false,
    total: 0,
    filter: {
      studentCode: "",
      classroom: "",
    },
  };

  database = getDatabase();

  columns = [
    {
      title: "Mã số",
      dataIndex: "code",
      key: "code",
      render: (code, student) => {
        return <EditStudent student={student} />;
      },
    },
    {
      title: "Họ lót",
      dataIndex: "lname",
      key: "lname",
    },
    {
      title: "Tên",
      dataIndex: "fname",
      key: "fname",
    },
    {
      title: "Giới tính",
      dataIndex: "sex",
      key: "sex",
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Mã Môn học",
      dataIndex: "subjectCode",
      key: "subjectCode",
    },
    {
      title: "Tên Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Nhóm",
      dataIndex: "group",
      key: "group",
    },
    {
      title: "Tổ",
      dataIndex: "to",
      key: "to",
    },
    {
      title: "Cơ sở",
      dataIndex: "place",
      key: "place",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  componentDidMount() {
    this.loadData();
  }

  loadData = (currentPage = 1) => {
    try {
      this.setState({ loading: true });

      onValue(ref(this.database, `/students`), (snapshot) => {
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
      });

      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  handleFileUpload = (files) => {
    const file = files[0];
    if (!file) return;

    const { name } = file;
    const extension = name.split(".").pop();

    if (extension !== "csv") {
      message.warn("File không đúng định dạng.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const { data } = result;
        console.log(data.length);
        this.handleAddListStudent(data);
      },
    });
  };

  handleAddListStudent = (students) => {
    const newStudentList = students
      .map((s) => {
        return {
          code: s["Mã số"],
          lname: s["Họ lót"],
          fname: s["Tên"],
          sex: s["Phái"],
          className: s["Lớp"],
          subjectCode: s["Mã MH"],
          subjectName: s["Tên MH"],
          group: s["Nhóm"],
          to: s["Tổ TH"],
          place: s["Cơ sở MH"],
          email: s["Email"],
          id: firebaseUUID(),
        };
      })
      .filter((s) => s.code);

    const studentRef = ref(this.database, "students");

    runTransaction(studentRef, (students) => {
      const newData = mapKeys(newStudentList, "id");
      return Object.assign(newData, students);
    });
  };

  getDataByFilter = () => {
    const { filter, data } = this.state;
    let result = [...data];

    if (filter.studentCode) {
      result = result.filter((student) =>
        student.code?.includes?.(filter.studentCode)
      );
    }

    if (filter.classroom) {
      result = result.filter((student) =>
        student.className?.includes?.(filter.classroom)
      );
    }

    return result;
  };

  render() {
    const { loading, filter } = this.state;
    const filteredData = this.getDataByFilter();

    return (
      <React.Fragment>
        <div
          className="example-input"
          style={{ marginTop: 20, marginLeft: 10 }}
        >
          <Input
            value={filter.studentCode}
            placeholder="Mã số sinh viên"
            style={{ width: 150 }}
            onChange={(event) =>
              this.setState({
                filter: {
                  ...filter,
                  studentCode: event.target.value,
                },
              })
            }
          />
          <Input
            value={filter.classroom}
            placeholder="Lớp"
            onChange=""
            style={{ width: 150 }}
            onChange={(event) =>
              this.setState({
                filter: {
                  ...filter,
                  classroom: event.target.value,
                },
              })
            }
          />
          <Button
            className={classes.search}
            type="primary"
            icon={<SearchOutlined />}
          >
            Tìm kiếm
          </Button>

          <InputFiles accept=".csv" onChange={this.handleFileUpload}>
            <Button className={classes.search} type="primary">
              Thêm từ file
            </Button>
          </InputFiles>

          {/* <input
            ref={this.}
            hidden
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={this.handleFileUpload}
          /> */}
        </div>
        <div className={styles.tableStudent}>
          <Table
            loading={loading}
            dataSource={filteredData}
            columns={this.columns}
            pagination={{
              defaultPageSize: 10,
              total: filteredData.length,
              onChange: (page) => this.loadData(page),
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default withRouter(Student);
