import React, { PureComponent } from "react";
import { Button, Modal, message, Form, Input, Select } from "antd";

import { firebaseUUID } from "../utils";
import {
  getDatabase,
  onValue,
  ref,
  runTransaction,
  update,
} from "firebase/database";
import { values } from "lodash";
import { UserInfoContext } from "../providers/UserInfoProvider";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const { Option } = Select;
class ButtonAddStudent extends PureComponent {
  state = {
    modalVisible: false,
    classData: null,
    className: null,
    subjectCodeData: [],
  };

  formRef = React.createRef();

  database = getDatabase();

  componentDidMount() {
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
        subjectCodeData: data,
      });
    });
  }

  handleAddStudent = (student) => {
    const id = firebaseUUID();
    const studentRef = ref(this.database, `/students/`);
    const { subjectCodeData } = this.state;

    const subjectInfo = subjectCodeData.find((s) => s.id === student.subject);

    const dataInsert = {
      code: student.code,
      displayName: student.displayName,
      sex: student.sex,
      className: student.className,
      subjectCode: subjectInfo.subjectCode,
      subjectName: subjectInfo.subjectName,
      group: subjectInfo.group,
      to: subjectInfo.to,
      place: student.place,
      id: id,
      email: student.email,
    };

    update(studentRef, {
      [id]: dataInsert,
    })
      .then(() => {
        message.success("Thêm sinh viên thành công");
      })
      .catch(() => message.error("Thêm sinh viên thất bại"));
  };

  render() {
    const { subjectCodeData } = this.state;
    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Thêm học sinh
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
            onFinish={this.handleAddStudent}
            onValuesChange={this.handleValuesChange}
          >
            <Form.Item
              name="code"
              label="Mã số"
              rules={[
                {
                  required: true,
                  message: "Mã số bắt buộc nhập",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="displayName"
              label="Họ tên"
              rules={[
                {
                  required: true,
                  message: "Họ tên bắt buộc nhập",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="sex"
              label="Giới tính"
              rules={[
                {
                  required: true,
                  message: "Giới tính bắt buộc nhập",
                },
              ]}
            >
              <Select defaultValue="" style={{ width: 120 }}>
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="className"
              label="Lớp học"
              rules={[
                {
                  required: true,
                  message: "Lớp bắt buộc nhập",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="subject"
              label="Môn học"
              rules={[
                {
                  required: true,
                  message: "Môn học bắt buộc chọn",
                },
              ]}
            >
              <Select placeholder="Mã môn">
                {subjectCodeData.map((subject) => {
                  return (
                    <Select.Option value={subject.id}>
                      <p>
                        {subject.subjectCode} - {subject.subjectName}
                      </p>
                      <p>
                        Nhóm: {subject.group} - Tổ: {subject.to} - Tiết: [
                        {subject.tiet}]
                      </p>
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="place"
              label="Cơ sở"
              rules={[
                {
                  required: true,
                  message: "Cơ sở bắt buộc nhập",
                },
              ]}
            >
              <Select defaultValue="">
                <Option value="0 - TP. Hồ Chí Minh">0 - TP. Hồ Chí Minh</Option>
                <Option value="1 - TP. Hồ Chí Minh">1 - Tp. Nha Trang</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Email bắt buộc nhập",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>

            <Form.Item style={{ marginLeft: "auto" }}>
              <Button type="primary" htmlType="submit">
                Thêm học sinh
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

ButtonAddStudent.contextType = UserInfoContext;

export default ButtonAddStudent;
