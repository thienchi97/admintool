import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table, Space, message, Input, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as classes from "./Table.module.css";
import InputFiles from "react-input-files";
import "firebase/auth";
import moment from "moment";
import QrCreateButton from "../components/QrCreateButton";
import ButtonAdd from "../components/ButtonAddClass";
import { mapKeys, values } from "lodash";
import Papa from "papaparse";
import { firebaseUUID } from "../utils";
import { getDatabase, onValue, ref, runTransaction } from "firebase/database";
import ApproveJoinClassButton from "../components/ApproveJoinClassButton";
import { UserInfoContext } from "../providers/UserInfoProvider";
import ClassStatisticButton from "../components/ClassStatisticButton";

class Class extends Component {
  state = {
    columns: [],
    data: [],
    loading: false,
    total: 0,
    modalVisible: false,
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
      render: (subjectName, record) => {
        return (
          <ClassStatisticButton
            key={record.id}
            record={record}
            subjectName={subjectName}
          />
        );
      },
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

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    try {
      this.setState({ loading: true });

      onValue(ref(this.database, `/classroom`), (snapshot) => {
        let data = values(snapshot.val());
        const { isRoot, classManaged = [] } = this.context;

        if (!isRoot) {
          data = data.filter((d) => {
            const classExist = classManaged.find((c) => c.id === d.id);
            return !!classExist;
          });
        }

        this.setState({
          total: data.length,
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

  handleAddListClass = async (classroom = []) => {
    const newTeacherList = [];
    const newClassroomList = [];

    for (const s of classroom) {
      const classId = firebaseUUID();
      const teacherExist = newTeacherList.find(
        (t) => t.email === s["Email TDTU"]
      );
      let teacherData = {
        displayName: s["Giảng viên"] || "",
        email: s["Email TDTU"] || "",
        isAccept: true,
        id: firebaseUUID(),
      };

      if (teacherExist) {
        teacherData = teacherExist;
      }

      if (!teacherExist) {
        newTeacherList.push(teacherData);
      }

      newClassroomList.push({
        subjectCode: s["Mã MH"] || "",
        group: s["Nhóm"] || "",
        to: s["Tổ"] || "",
        day: s["Thứ"] || "",
        subjectName: s["Tên môn"] || "",
        tiet: s["Tiết"] || "",
        room: s["Phòng"] || "",
        teacher: teacherData.id,
        teacherObject: teacherData,
        place: s["Cơ sở MH"] || "",
        email: s["Email cá nhân"] || "",
        emailTDT: s["Email TDTU"] || "",
        id: classId,
        tongtiet: s["Tổng tiết"],
        siso: s["Sỉ số"],
      });
    }

    const teachersRef = ref(this.database, "teachers");
    const classroomRef = ref(this.database, "classroom");

    try {
      // Them giao vien vao database
      const data = await runTransaction(teachersRef, (currentData) => {
        const teacherEmailExt = values(currentData).map((t) => t.email);
        const newTeacherData = newTeacherList.filter(
          (t) => !teacherEmailExt.includes(t.email)
        );
        const newData = mapKeys(newTeacherData, "id");
        return Object.assign(currentData || {}, newData);
      });

      console.log(data);
    } catch (error) {
      console.error(error);
    }

    // Them lop vao database
    try {
      const data = await runTransaction(classroomRef, (currentData) => {
        const newData = mapKeys(newClassroomList, "id");
        return Object.assign(currentData || {}, newData);
      });

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

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

Class.contextType = UserInfoContext;

export default withRouter(Class);
