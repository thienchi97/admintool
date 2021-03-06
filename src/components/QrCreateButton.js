import React, { PureComponent } from "react";
import { Button, Modal, message, Typography, Spin, Switch } from "antd";
import moment from "moment";
import { getDatabase, onValue, ref, set, update } from "firebase/database";
import * as uuid from "uuid";
import QRCode from "react-qr-code";
import AES from "crypto-js/aes";
import { omit } from "lodash";

const QR_CONFIG = {
  OFF: {
    DISTANCE: 10,
  },
  ON: {
    DISTANCE: 0,
  },
};

const ACTIVE_TIME = 30;

class QrCreateButton extends PureComponent {
  state = {
    startTime: null,
    endTime: null,
    modalVisible: false,
    qrData: null,
    isCreating: false,
    latitude: 0,
    longitude: 0,
    online: false,
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
        return (
          !attendence.expired &&
          moment(currentTime).isBetween(
            moment(attendence?.startAt),
            moment(attendence.endAt),
            undefined,
            "[]"
          )
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

  generateAttendanceQR = () => {
    if (this.state.isCreating) return;
    this.setState({ isCreating: true });

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
      this.setState({ isCreating: false });
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
    const { latitude, longitude, online } = this.state;

    const attendenceId = uuid.v4();

    const attendanceRef = ref(
      this.database,
      `/attendence/${classInfo.id}/${attendenceId}`
    );

    const startTime = Date.now();
    const endTime = moment(startTime).add(ACTIVE_TIME, "minutes").valueOf();
    const distance = online ? QR_CONFIG.ON.DISTANCE : QR_CONFIG.OFF.DISTANCE;

    const dataInsert = {
      id: attendenceId,
      startAt: startTime,
      endAt: endTime,
      attendenced: [],
      createAt: startTime,
      duration: endTime - startTime, // milisecond
      latitude,
      longitude,
      distance,
    };

    set(attendanceRef, dataInsert)
      .then(() => message.success("T???o m??? QR th??nh c??ng"))
      .catch(() => message.error("T???o m??? QR th???t b???i"));
  };

  makeQrExpired = async () => {
    const { qrData } = this.state;
    const { classInfo } = this.props;
    const newData = omit(qrData, ["classId", "attendenceId"]);

    const qrRef = ref(
      this.database,
      `/attendence/${classInfo.id}/${qrData.id}`
    );

    this.setState({ qrData: null });

    try {
      await update(qrRef, {
        ...newData,
        expired: true,
      });

      message.success("H???y QR code th??nh c??ng.");
    } catch (error) {
      console.error(error);
      message.error("H???y QR code th???t b???i.");
    }
  };

  renderCreateButton = () => {
    return (
      <>
        <Typography.Text type="danger">
          *Vui l??ng cho ph??p chia s??? v??? tr?? ????? t???o QR
        </Typography.Text>
        <div className="flex justify-center items-center w-full">
          <Switch
            checkedChildren="Online"
            unCheckedChildren="Offline"
            checked={this.state.online}
            onChange={() => this.setState({ online: !this.state.online })}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 0px",
          }}
        >
          <Button
            size="large"
            type="dashed"
            onClick={this.generateAttendanceQR}
          >
            T???o QR Code
          </Button>
        </div>
      </>
    );
  };

  renderQRCode = () => {
    const { qrData, isCreating } = this.state;

    const qrString = JSON.stringify({
      classId: qrData?.classId,
      attendenceId: qrData?.attendenceId,
      latitude: qrData?.latitude,
      longitude: qrData?.longitude,
      distance: qrData?.distance ?? 0,
    });

    const qrEncrypt = qrData
      ? AES.encrypt(
          qrString,
          process.env.REACT_APP_QR_ENCRYPT_SECRECT_KEY
        ).toString()
      : "";

    if (isCreating) return <Spin />;

    return (
      <div
        style={{
          objectFit: "fill",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <QRCode value={qrEncrypt} size={256} />
        <Button type="primary" onClick={this.makeQrExpired}>
          H???y QR
        </Button>
      </div>
    );
  };

  render() {
    const { qrData, isCreating } = this.state;

    return (
      <div>
        <Button
          type="primary"
          onClick={(event) => {
            this.setState({ modalVisible: true });
          }}
        >
          T???o m?? ??i???m danh
        </Button>
        <Modal
          title="T???o m?? ??i???m danh"
          centered
          destroyOnClose
          visible={this.state.modalVisible}
          onCancel={(event) => {
            this.setState({ modalVisible: false });
          }}
          cancelText={"????ng"}
          okButtonProps={{
            hidden: true,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(qrData || isCreating) && this.renderQRCode()}
            {!qrData && this.renderCreateButton()}
          </div>
        </Modal>
      </div>
    );
  }
}

export default QrCreateButton;
