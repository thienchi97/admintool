import React, { Component, PureComponent } from "react";
import { Button, Modal, message, Typography, Spin, List, Avatar } from "antd";
import { getDatabase, onValue, ref } from "firebase/database";
import values from "lodash/values";

class DanhsachDiemDanh extends PureComponent {
  state = {
    allStudents: [],
    modalVisible: false,
  };

  database = getDatabase();

  componentDidMount() {
    const studentsRef = ref(this.database, "students");

    onValue(studentsRef, (snapshot) => {
      this.setState({
        allStudents: values(snapshot.val()),
      });
    });
  }

  getAttendencedStudents = () => {
    const { allStudents } = this.state;
    const { attendenced = [] } = this.props;
    const studentIds = attendenced.map((a) => a.id);

    return allStudents.filter((s) => studentIds.includes(s.id));
  };

  render() {
    const attendencedStudents = this.getAttendencedStudents();

    return (
      <div>
        <Button
          type="link"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Danh sách
        </Button>
        <Modal
          title="Danh sách sinh viên điểm danh"
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText={"Đóng"}
          okButtonProps={{
            hidden: true,
          }}
        >
          {attendencedStudents.length ? (
            <List
              itemLayout="horizontal"
              dataSource={attendencedStudents}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.displayName}
                    description={`Mã sinh viên: ${item.code || ""}`}
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

export default DanhsachDiemDanh;
