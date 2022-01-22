import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Input, Button, Table, message, Popconfirm } from "antd";

import * as classes from "./Table.module.css";
import "firebase/auth";
import {
  getDatabase,
  onValue,
  ref,
  runTransaction,
  remove,
} from "firebase/database";
import styles from "./Student.module.css";
import InputFiles from "react-input-files";
import { firebaseUUID } from "../utils";
import { groupBy, mapKeys, trim, unionBy, values } from "lodash";
import Papa from "papaparse";
import EditStudent from "../components/EditStudent";
import { UserInfoContext } from "../providers/UserInfoProvider";
import ButtonAddStudent from "../components/ButtonAddStudent";
import InfoStudentButton from "../components/InfoStudentButton";

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
    },
    {
      title: "Họ Tên",
      dataIndex: "displayName",
      key: "displayName",
      render: (displayName, record) => {
        return (
          <InfoStudentButton
            key={record.code}
            displayName={displayName}
            record={record}
          />
        );
      },
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
    {
      title: "Chỉnh sửa",
      dataIndex: "edit",
      key: "edit",
      render: (code, student) => {
        return <EditStudent student={student} />;
      },
    },

    {
      title: "Xóa",

      key: "delete",
      render: (student) => {
        return (
          <Popconfirm
            title="Xác nhận xóa học sinh?"
            onConfirm={() => this.handleDelete(student)}
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

      onValue(ref(this.database, `/students`), (snapshot) => {
        let data = values(snapshot.val());
        const { isRoot, classManaged = [] } = this.context;

        if (!isRoot) {
          data = data.filter((s) => {
            const classExist = classManaged.find((c) => {
              const isSameSubjectCode =
                trim(s.subjectCode) === trim(c.subjectCode);
              const isSameGroup =
                s.group == c.group ||
                parseInt(`${s.group}`) === parseInt(`${c.group}`);
              const isSameTo =
                s.to == c.to || parseInt(`${s.to}`) === parseInt(`${c.to}`);

              return isSameSubjectCode && isSameGroup && isSameTo;
            });

            return !!classExist;
          });
        }

        this.setState({
          data: data,
          total: data.length,
        });
      });

      this.setState({ loading: false });
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  handleDelete = (student) => {
    const studentRef = ref(this.database, `/students/${student.id}`);

    remove(studentRef);
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
          displayName: s["Họ lót"] + " " + s["Tên"],

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
          <Button type="link">
            <ButtonAddStudent />
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

Student.contextType = UserInfoContext;

export default withRouter(Student);
