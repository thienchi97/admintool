import React, { PureComponent } from "react";
import {
  Button,
  Modal,
  message,
  Form,
  Input,
  DatePicker,
  Space,
  Select,
} from "antd";

import * as uuid from "uuid";

import { firebaseUUID } from "../utils";
import {
  getDatabase,
  onValue,
  ref,
  runTransaction,
  update,
} from "firebase/database";
import moment from "moment";
const { RangePicker } = DatePicker;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const { Option } = Select;
class ButtonAddClass extends PureComponent {
  state = {
    modalVisible: false,
    classData: null,
    className: null,
    createdAt: null,
    teacherData: [],
  };

  formRef = React.createRef();

  database = getDatabase();

  componentDidMount() {
    const teacherRef = ref(this.database, "/teachers");

    onValue(
      teacherRef,
      (snapshot) => {
        const value = snapshot.val() || {};
        const data = Object.values(value).filter((v) => !v.root && v.isAccept);

        this.setState({ teacherData: data });
      },
      {
        onlyOnce: true,
      }
    );
  }

  handleAddClass = (classroom) => {
    const { teacherData } = this.state;

    const id = firebaseUUID();
    const teacher = teacherData.find((t) => t.id === classroom.teacher);
    const [start, end] = classroom.dateRange;

    const classroomRef = ref(this.database, `/classroom/`);

    const dataInsert = {
      subjectCode: classroom.subjectCode,
      group: classroom.group,
      to: classroom.to,
      day: classroom.day,
      subjectName: classroom.subjectName,
      tiet: classroom.tiet,
      id: id,
      room: classroom.room,
      teacher: teacher.id,
      teacherObject: teacher,
      email: classroom.email,
      emailTDT: classroom.emailTDT,
      startAt: start.valueOf(),
      endAt: end.valueOf(),
      pending: {},
    };

    update(classroomRef, {
      [id]: dataInsert,
    })
      .then(() => {
        message.success("Thêm lớp thành công");
      })
      .catch(() => message.error("Thêm lớp thất bại"));
  };

  render() {
    const { teacherData } = this.state;

    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Thêm lớp
        </Button>
        <Modal
          title="Thêm lớp"
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText="Đóng"
          okButtonProps={{
            hidden: true,
          }}
        >
          <Form
            {...layout}
            ref={this.formRef}
            name="class-control"
            onFinish={this.handleAddClass}
          >
            <Form.Item
              name="subjectCode"
              label="Mã môn"
              rules={[
                {
                  required: true,
                  message: "Ma mon bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="subjectName"
              label="Tên môn"
              rules={[
                {
                  required: true,
                  message: "Ten mon bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="group"
              label="Nhóm"
              rules={[
                {
                  required: true,
                  message: "nhom bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="to"
              label="Tổ"
              rules={[
                {
                  required: true,
                  message: "nhom bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="room"
              label="Phòng học"
              rules={[
                {
                  required: true,
                  message: "Phong hoc bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="teacher"
              label="Giảng viên"
              rules={[
                {
                  required: true,
                  message: "Giao vien bat buoc nhap",
                },
              ]}
            >
              <Select placeholder="Chon giao vien">
                {teacherData.map((teacher) => {
                  return (
                    <Select.Option value={teacher.id}>
                      {teacher.displayName}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "nhom bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="emailTDT"
              label="Email TDT"
              rules={[
                {
                  required: true,
                  message: "nhom bat buoc nhap",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="day"
              label="Thứ"
              rules={[
                {
                  required: true,
                  message: "Thu batt buoc nhap",
                },
              ]}
            >
              <Select defaultValue="" style={{ width: 120 }}>
                <Option value="2">thứ 2</Option>
                <Option value="3">thứ 3</Option>
                <Option value="4">thứ 4</Option>
                <Option value="5">thứ 5</Option>
                <Option value="6">thứ 6</Option>
                <Option value="7">thứ 7</Option>
                <Option value="8">chủ nhật</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="tiet"
              label="Tiết"
              rules={[
                {
                  required: true,
                  message: "Thu batt buoc nhap",
                },
              ]}
            >
              <Select defaultValue="" style={{ width: 120 }}>
                <Option value="123-------------">123-------------</Option>
                <Option value="---456----------">---456----------</Option>
                <Option value="------789-------">------789-------</Option>
                <Option value="---------012----">---------012----</Option>
                <Option value="------------345-">------------345-</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="dateRange"
              label="Ngày bắt đầu & kết thúc"
              rules={[
                {
                  type: "array",
                  required: true,
                  message: "Vui long chon thoi gian",
                },
              ]}
            >
              <RangePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
            <Form.Item style={{ marginLeft: "auto" }}>
              <Button type="primary" htmlType="submit">
                Thêm lớp
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default ButtonAddClass;
