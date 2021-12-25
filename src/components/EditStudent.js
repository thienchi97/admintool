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

import {
  getDatabase,
  onValue,
  ref,
  runTransaction,
  update,
} from "firebase/database";
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

  render() {
    const { data, studen } = this.state;
    const { student } = this.props;

    return (
      <div>
        <Button
          type="text"
          onClick={() => this.setState({ modalVisible: true })}
        >
          {student.code}
        </Button>
        <Modal
          title="chỉnh sửa"
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

export default EditStudent;
