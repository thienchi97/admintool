import React, { PureComponent } from "react";
import { Button, Divider, List, Typography } from "antd";
import Modal from "antd/lib/modal/Modal";
import { get, getDatabase, query, ref } from "firebase/database";
import { reduce, values } from "lodash";
import { UserInfoContext } from "../providers/UserInfoProvider";
import moment from "moment";
import { CarryOutOutlined } from "@ant-design/icons";

class InfoStudentButton extends PureComponent {
  state = {
    classInfo: {},
    modalVisible: false,
    classAttendanced: [],
  };

  database = getDatabase();

  async componentDidMount() {
    const { record } = this.props;
    const { classManaged = [] } = this.context;

    const classInfo = classManaged.find((c) => {
      return c?.students?.some((id) => record.id === id);
    });

    const classAttendanced = values(
      (await get(query(ref(this.database, `attendence/${classInfo.id}`)))).val()
    );

    this.setState({
      classInfo: classInfo,
      classAttendanced: classAttendanced,
    });
  }

  componentDidUpdate() {}

  checkStudentAttendaced = (attendencedId) => {
    const { record } = this.props;
    const { classAttendanced = [] } = this.state;
    const data = classAttendanced.find((a) => a.id === attendencedId);
    if (!data) return false;

    const { attendenced = [] } = data;
    return !!attendenced.find((s) => s.id === record.id);
  };

  render() {
    const { displayName, record } = this.props;
    const { classInfo, classAttendanced } = this.state;
    const sessions = Math.ceil(parseInt(classInfo.tongtiet) / 3);
    const sessionAttendanced = reduce(
      classAttendanced,
      (result, { attendenced = [] }) => {
        if (attendenced.find((i) => i.id === record.id)) {
          result += 1;
        }

        return result;
      },
      0
    );

    return (
      <div>
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => this.setState({ modalVisible: true })}
        >
          {displayName}
        </Button>
        <Modal
          title="Chi tiết"
          centered
          footer={null}
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText="Đóng"
          okButtonProps={{
            hidden: true,
          }}
          width={500}
        >
          <b>
            Đã điểm danh: {sessionAttendanced}/{sessions}
          </b>

          <List
            dataSource={classAttendanced}
            renderItem={(item) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CarryOutOutlined />}
                    title={`Thời gian tạo: ${moment(item.createAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}`}
                    description={`Hình thức: ${
                      item?.distance === 0 ? "Online" : "Offline"
                    }`}
                  />
                  {this.checkStudentAttendaced(item.id) && <div>check</div>}
                </List.Item>
              );
            }}
          />
        </Modal>
      </div>
    );
  }
}

InfoStudentButton.contextType = UserInfoContext;

export default InfoStudentButton;
