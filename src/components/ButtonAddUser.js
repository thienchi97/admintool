import React, { PureComponent } from "react";
import { Button, Modal, message, Form, Input, DatePicker, Space } from "antd";

import * as uuid from "uuid";

import { firebaseUUID } from "../utils";
import {
  getDatabase,
  onValue,
  ref,
  runTransaction,
  set,
} from "firebase/database";
import moment from "moment";
const { RangePicker } = DatePicker;

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

class ButtonAddUser extends PureComponent {
  state = {
    modalVisible: false,
    classData: null,
    className: null,
    createdAt: null,
  };

  formRef = React.createRef();

  database = getDatabase();

  handleAddClass = (classroom) => {
    const { createdAt } = this.state;
    const classroomRef = ref(this.database, `/classroom/`);

    const dataInsert = {
      name: classroom.name,
      code: classroom.code,
      createdAt: new Date.now(),
      id: firebaseUUID(),
    };

    set(classroomRef, dataInsert)
      .then(() => {
        message.success("Thêm lớp thành công");
      })
      .catch(() => message.error("Thêm lớp thất bại"));
  };

  render() {
    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Thêm thành viên
        </Button>
        <Modal
          title="Thêm thành viên"
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <Form
            {...layout}
            ref={this.formRef}
            name="class-control"
            onFinish={this.handleAddClass}
          >
            <Form.Item name="name" label="Tên lớp">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="code" label="Mã lớp">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="subjectcode" label="Mã môn">
              <Input type="text" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm thành viên
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default ButtonAddUser;
