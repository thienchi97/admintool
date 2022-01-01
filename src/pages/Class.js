import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table, Space, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as classes from "./Table.module.css";
import InputFiles from "react-input-files";
import "firebase/auth";
import moment from "moment";
import QrCreateButton from "../components/QrCreateButton";
import ButtonAdd from "../components/ButtonAddClass";
import { cloneDeep, mapKeys, unionBy, values } from "lodash";
import Papa from "papaparse";
import { firebaseUUID } from "../utils";
import { getDatabase, onValue, ref, runTransaction } from "firebase/database";
import ApproveJoinClassButton from "../components/ApproveJoinClassButton";

class Class extends Component {
  state = {
    columns: [],
    data: [],
    loading: false,
    total: 0,
    modal1Visible: false,
    modal2Visible: false,
    filter: {
      subjectCode: "",
      subjectName: "",
    },
  };

  database = getDatabase();

  columns = [
    {
      title: "Mã môn học",
      dataIndex: "subjectCode",
      key: "subjectCode",
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
      title: "Thứ",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Tên Môn",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
      title: "Tiết",
      dataIndex: "tiet",
      key: "tiet",
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherObject",
      key: "teacher",
      render: (teacher) => {
        return teacher?.displayName;
      },
    },
    {
      title: "Email Cá Nhân",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Email TDTU",
      dataIndex: "emailTDT",
      key: "emailTDT",
    },
    {
      title: "",
      dataIndex: null,
      key: "QrCode",
      render: (classInfo) => {
        return (
          <Space key={classInfo?.id} size={"middle"}>
            <QrCreateButton classInfo={classInfo} />
            <ApproveJoinClassButton classInfo={classInfo} />
          </Space>
        );
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

  loadData = () => {
    try {
      this.setState({ loading: true });

      onValue(ref(this.database, `/classroom`), (snapshot) => {
        const value = snapshot.val() || {};
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
        this.handleAddListClass(data);
      },
    });
  };

  handleAddListClass = (classroom = []) => {
    const newClassroomList = classroom.map((s) => {
      const classId = firebaseUUID();
      const teacherId = firebaseUUID();

      return {
        subjectCode: s["Mã MH"] || "",
        group: s["Nhóm"] || "",
        to: s["Tổ"] || "",
        day: s["Thứ"] || "",
        subjectName: s["Tên môn"] || "",
        tiet: s["Tiết"] || "",
        room: s["Phòng"] || "",
        teacher: teacherId,
        teacherObject: {
          displayName: s["Giảng viên"] || "",
          email: s["Email TDTU"] || "",
          isAccept: true,
          id: teacherId,
        },
        place: s["Cơ sở MH"] || "",
        email: s["Email cá nhân"] || "",
        emailTDT: s["Email TDTU"] || "",
        id: classId,
      };
    });

    const newTeacherList = unionBy(
      newClassroomList.map((c) => {
        return c.teacherObject;
      }),
      "email"
    );

    const teachersRef = ref(this.database, "teachers");
    const classroomRef = ref(this.database, "/classroom");

    // Them lop vao database
    runTransaction(classroomRef, (classroom) => {
      const newData = mapKeys(newClassroomList, "id");
      return Object.assign(classroom || {}, newData);
    }).catch(console.log);

    // Them giao vien vao database
    runTransaction(teachersRef, (teachers = {}) => {
      const teacherEmailExt = Object.values(teachers).map((t) => t.email);
      const newTeacherData = newTeacherList.filter(
        (t) => !teacherEmailExt.includes(t.email)
      );
      const newData = mapKeys(newTeacherData, "id");
      return Object.assign(teachers, newData);
    }).catch(console.log);
  };

  setModal1Visible(modal1Visible) {
    this.setState({ modal1Visible });
  }

  setModal2Visible(modal2Visible) {
    this.setState({ modal2Visible });
  }
  getDataByFilter = () => {
    const { filter, data } = this.state;
    let result = [...data];

    if (filter.subjectCode) {
      result = result.filter((classroom) =>
        classroom.subjectCode?.includes?.(filter.subjectCode)
      );
    }

    if (filter.subjectName) {
      result = result.filter((classroom) =>
        classroom.subjectName?.includes?.(filter.subjectName)
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
            value={filter.subjectCode}
            placeholder="Mã môn"
            style={{ width: 150 }}
            onChange={(event) =>
              this.setState({
                filter: {
                  ...filter,
                  subjectCode: event.target.value,
                },
              })
            }
          />
          <Input
            value={filter.subjectName}
            placeholder="Tên môn"
            onChange=""
            style={{ width: 150 }}
            onChange={(event) =>
              this.setState({
                filter: {
                  ...filter,
                  subjectName: event.target.value,
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
          <Button type="link">
            <ButtonAdd />
          </Button>
          <InputFiles accept=".csv" onChange={this.handleFileUpload}>
            <Button className={classes.search} type="primary">
              Thêm từ file
            </Button>
          </InputFiles>
        </div>

        <div style={{ padding: "0px 8px" }}>
          <Table
            loading={loading}
            dataSource={filteredData}
            columns={this.columns}
            pagination={{
              defaultPageSize: 5,
              total: filteredData.length,
              onChange: (page) => this.loadData(page),
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Class);
