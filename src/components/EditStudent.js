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

import { getDatabase, ref, update } from "firebase/database";
import moment from "moment";
import "firebase/auth";

const { RangePicker } = DatePicker;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const { Option } = Select;
class EditStudent extends PureComponent {
  state = {
    data: [],
    loading: false,
    total: 0,
    modalVisible: false,
  };

  database = getDatabase();
  formRef = React.createRef();

  componentDidMount() {}

  handleUpdateClass = async (formData) => {
    const { student } = this.props;
    const studentRef = ref(this.database, `/students/${student.id}`);

    try {
      await update(studentRef, formData);
      message.success("Cập nhật thông tin sinh viên thành cônng.");
    } catch (error) {
      console.log(error);
      message.error("Cập nhật thông tin sinh viên thất bại.");
    }
  };

  render() {
    const { student } = this.props;

    return (
      <div>
        <Button
          type="link"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Chỉnh sửa
        </Button>
        <Modal
          title="Chỉnh sửa"
          centered
          footer={null}
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
            onFinish={this.handleUpdateClass}
            initialValues={student}
          >
            <Form.Item name="code" label="Mã số">
              <Input type="text"></Input>
            </Form.Item>
            <Form.Item name="displayName" label="Họ tên">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="sex" label="Giới tính">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="className" label="Lớp">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="subjectCode" label="Mã môn học">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="subjectName" label="Tên môn học">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="group" label="Nhóm">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="to" label="Tổ">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="place" label="Cơ sở">
              <Input type="text" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input type="text" />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="primary" htmlType="submit">
                Chỉnh sửa
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default EditStudent;
