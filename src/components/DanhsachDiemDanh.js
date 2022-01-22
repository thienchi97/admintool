import React, { PureComponent } from "react";
import { Button, Modal, Typography, List, Input } from "antd";
import { get, getDatabase, onValue, query, ref } from "firebase/database";
import values from "lodash/values";
import { CheckOutlined, SearchOutlined } from "@ant-design/icons";

class DanhsachDiemDanh extends PureComponent {
  state = {
    studentCode: "",
    allStudents: [],
    modalVisible: false,
  };

  database = getDatabase();

  async componentDidMount() {
    const { classId } = this.props;
    const classRef = ref(this.database, `classroom/${classId}`);
    const studentsRef = ref(this.database, "students");
    const classData = (await get(query(classRef))).val();
    const { students = [] } = classData || {};

    onValue(studentsRef, (snapshot) => {
      this.setState({
        allStudents: values(snapshot.val()).filter((s) =>
          students.includes(s.id)
        ),
      });
    });
  }

  checkStudentAttendaced = (studentId) => {
    const { attendenced = [] } = this.props;
    const studentIds = attendenced.map((a) => a.id);

    return studentIds.includes(studentId);
  };

  render() {
    let { allStudents, studentCode } = this.state;

    if (studentCode) {
      allStudents = allStudents.filter(
        (s) => s.code?.includes?.(studentCode) || studentCode.includes(s.code)
      );
    }

    const HeaderCustom = (
      <div>
        <div>Danh sách điểm danh</div>
        <Input
          placeholder="Mã sinh viên"
          prefix={<SearchOutlined />}
          style={{
            width: "200px",
          }}
          onChange={(e) => this.setState({ studentCode: e.target.value })}
        />
      </div>
    );

    return (
      <div>
        <Button
          type="link"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Danh sách
        </Button>
        <Modal
          title={HeaderCustom}
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText={"Đóng"}
          okButtonProps={{
            hidden: true,
          }}
          bodyStyle={{
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {allStudents.length ? (
            <List
              itemLayout="horizontal"
              dataSource={allStudents}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.displayName}
                    description={`Mã sinh viên: ${item.code || ""}`}
                  />
                  {this.checkStudentAttendaced(item.id) && (
                    <div>
                      <CheckOutlined />
                    </div>
                  )}
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
