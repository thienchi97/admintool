import React, { PureComponent } from "react";
import { Button, Modal, message, Typography, Spin } from "antd";
import moment from "moment";
import { getDatabase, onValue, ref, set } from "firebase/database";
import * as uuid from "uuid";
import QRCode from "react-qr-code";
import AES from "crypto-js/aes";

const DISTANCE = 0;
const ACTIVE_TIME = 1;

class QrCreateButton extends PureComponent {
  state = {
    startTime: null,
    endTime: null,
    modalVisible: false,
    qrData: null,
    isCreating: true,
    latitude: 0,
    longitude: 0,
  };

  qrId = null;
  geoQuery = null;
  database = getDatabase();

  componentDidMount() {
    const { classInfo } = this.props;
    const attendanceRef = ref(this.database, `/attendence/${classInfo.id}`);

    onValue(attendanceRef, (snapshot) => {
      const currentTime = Date.now();
      const data = snapshot.val() || {};
      const existKey = Object.keys(data).find((k) => {
        const attendence = data[k];
        return moment(currentTime).isBetween(
          moment(attendence?.startAt),
          moment(attendence.endAt),
          undefined,
          "[]"
        );
      });

      if (!existKey) return;
      this.setState({
        isCreating: false,
        qrData: {
          ...data[existKey],
          classId: classInfo.id,
          attendenceId: existKey,
        },
      });
    });
  }

  componentDidUpdate(_, prevState) {
    if (
      !prevState.modalVisible &&
      this.state.modalVisible &&
      !this.state.qrData
    ) {
      this.generateAttendanceQR();
    }
  }

  generateAttendanceQR = () => {
    const cbSuccess = (pos) => {
      this.setState(
        {
          isCreating: false,
          latitude: pos?.coords?.latitude,
          longitude: pos?.coords?.longitude,
        },
        this.createAttendanceQR
      );
    };

    const cbError = (error) => {
      console.log(error);
    };

    this.getLocationPermission(cbSuccess, cbError);
  };

  getLocationPermission = async (cbSuccess, cbError) => {
    try {
      this.geoQuery = await navigator.permissions.query({
        name: "geolocation",
      });

      const allowState = ["granted", "prompt"];

      if (allowState.includes(this.geoQuery.state)) {
        navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
      } else {
        cbError(new Error("User block share location"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  createAttendanceQR = () => {
    const { classInfo } = this.props;
    const { latitude, longitude } = this.state;

    const attendenceId = uuid.v4();

    const attendanceRef = ref(
      this.database,
      `/attendence/${classInfo.id}/${attendenceId}`
    );

    const startTime = Date.now();
    const endTime = moment(startTime).add(ACTIVE_TIME, "week").valueOf();

    const dataInsert = {
      id: attendenceId,
      startAt: startTime,
      endAt: endTime,
      attendenced: [],
      createAt: startTime,
      duration: endTime - startTime, // milisecond
      latitude,
      longitude,
      distance: DISTANCE,
    };

    set(attendanceRef, dataInsert)
      .then(() => message.success("Tạo mả QR thành công"))
      .catch(() => message.error("Tạo mả QR thất bại"));
  };

  render() {
    const { qrData, isCreating } = this.state;
    const qrString = JSON.stringify({
      classId: qrData?.classId,
      attendenceId: qrData?.attendenceId,
      latitude: qrData?.latitude,
      longitude: qrData?.longitude,
    });
    const qrEncrypt = qrData
      ? AES.encrypt(
          qrString,
          process.env.REACT_APP_QR_ENCRYPT_SECRECT_KEY
        ).toString()
      : "";

    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.setState({ modalVisible: true })}
        >
          Tạo mã điểm danh QR code
        </Button>
        <Modal
          title="Tạo mã điểm danh"
          centered
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          cancelText={"Đóng"}
          okButtonProps={{
            hidden: true,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Typography.Text type="danger">
              *Vui lòng cho phép chia sẻ vị trí để tạo QR
            </Typography.Text>
            {isCreating || !qrData ? (
              <Spin />
            ) : (
              <div
                style={{
                  objectFit: "fill",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QRCode value={qrEncrypt} size={256} />
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default QrCreateButton;
