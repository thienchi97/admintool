import React, { PureComponent } from "react";
import { Button, Modal, DatePicker, Space, message } from "antd";
import moment from "moment";
import { getDatabase, ref, set } from "firebase/database";
import * as uuid from "uuid";
import QRCode from "react-qr-code";

const { RangePicker } = DatePicker;

class QrCreateButton extends PureComponent {
  state = {
    startTime: null,
    endTime: null,
    modalVisible: false,
    qrData: null,
  };

  database = getDatabase();

  onChange = (value) => {
    let startTime = null,
      endTime = null;

    if (value) {
      startTime = value[0];
      endTime = value[1];
    }

    this.setState({
      startTime,
      endTime,
    });
  };

  onOkModal = () => {
    const { classInfo } = this.props;
    const { startTime, endTime, qrData } = this.state;

    if (!!qrData) {
      this.setState({ modalVisible: false });
      return;
    }

    const attendenceId = uuid.v4();

    const attendanceRef = ref(
      this.database,
      `/attendence/${classInfo.id}/${attendenceId}`
    );

    const dataInsert = {
      startAt: startTime.valueOf(),
      endAt: endTime.valueOf(),
      attendenced: [],
      createAt: Date.now(),
      duration: endTime.valueOf() - startTime.valueOf(),
    };

    set(attendanceRef, dataInsert)
      .then(() => {
        this.setState({
          qrData: {
            ...dataInsert,
            classId: classInfo.id,
            attendenceId: attendenceId,
          },
        });

        message.success("Tạo mả QR thành công");
      })
      .catch(() => message.error("Tạo mả QR thất bại"));
  };

  render() {
    const { startTime, endTime, qrData } = this.state;
    const isDisableCreate = !startTime || !endTime;
    const qrString = qrData
      ? JSON.stringify({
          classId: qrData.classId,
          attendenceId: qrData.attendenceId,
        })
      : "";

    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Quet QR
        </Button>
        <Modal
          title="Quet QR"
          centered
          visible={this.state.modalVisible}
          onOk={this.onOkModal}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelButtonProps={{
            hidden: !!qrData,
          }}
          okButtonProps={{
            disabled: isDisableCreate,
          }}
          okText={!!qrData ? "Close" : null}
        >
          {!qrData ? (
            <>
              <label>Thời gian hiệu lực</label>
              <Space direction="vertical" size={12}>
                <RangePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  onChange={this.onChange}
                  disabledDate={(currentDate) =>
                    moment(currentDate).isBefore(moment(), "d")
                  }
                />
              </Space>
            </>
          ) : (
            <div
              style={{
                objectFit: "fill",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <QRCode value={qrString} size={256} />
            </div>
          )}
        </Modal>
      </div>
    );
  }
}

export default QrCreateButton;
