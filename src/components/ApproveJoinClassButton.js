import React, { PureComponent } from "react";
import { Button, Modal, message, Typography, Spin, List, Avatar } from "antd";
import {
  getDatabase,
  onValue,
  ref,
  set,
  remove,
  runTransaction,
} from "firebase/database";
import values from "lodash/values";

class ApproveJoinClassButton extends PureComponent {
  state = {
    pendingStudents: [],
    modalVisible: false,
  };

  database = getDatabase();

  async componentDidMount() {
    const { classInfo } = this.props;
    const { pending = {} } = classInfo;
    const studentsRef = ref(this.database, "students");

    onValue(studentsRef, (snapshot) => {
      const data = values(snapshot.val());
      this.setState({ pendingStudents: data.filter((d) => pending[d.id]) });
    });
  }

  componentDidUpdate(_, prevState) {}

  handleAccept = async (item) => {
    const result = await this.handleDenie(item);

    if (!result) return;

    const { classInfo } = this.props;
    const classroomRef = ref(
      this.database,
      `/classroom/${classInfo.id}/students`
    );
    const dataInsert = {};

    try {
      runTransaction(classroomRef, (currentData) => {
        currentData = currentData || [];
        console.log([...currentData, item.id]);
        return [...currentData, item.id];
      });
      message.success("Đã thêm vào lớp");
    } catch (error) {
      message.error("Da co loi xay ra");
    }
  };

  handleDenie = async (item) => {
    const { classInfo } = this.props;
    const { pendingStudents } = this.state;
    const classroomRef = ref(
      this.database,
      `/classroom/${classInfo.id}/pending/${item.id}`
    );

    try {
      await remove(classroomRef);
      this.setState({
        pendingStudents: pendingStudents.filter((s) => s.id !== item.id),
      });

      return true;
    } catch (error) {
      message.error("Da co loi xay ra");
      return false;
    }
  };

  render() {
    const { pendingStudents } = this.state;

    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Cho phép vào lớp
        </Button>
        <Modal
          title="Cho phép vào lớp"
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText={"Đóng"}
          okButtonProps={{
            hidden: true,
          }}
        >
          {pendingStudents.length ? (
            <List
              itemLayout="horizontal"
              dataSource={pendingStudents}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key="list-loadmore-edit"
                      onClick={() => this.handleAccept(item)}
                    >
                      Chấp nhận
                    </a>,
                    <a
                      key="list-loadmore-more"
                      onClick={() => this.handleDenie(item)}
                    >
                      Từ chối
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                    title={item.displayName}
                    description={`Mã sinh viên: ${item.code}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </Modal>
      </div>
    );
  }
}

export default ApproveJoinClassButton;
