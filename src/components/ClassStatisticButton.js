import React, { PureComponent } from "react";
import { Button, Radio } from "antd";
import Modal from "antd/lib/modal/Modal";
import ClassStackColumnChart from "./ClassStackColumnChart";
import ClassPieColumnChart from "./ClassPieColumnChart";

const CHART_TYPE = {
  COLUMN: {
    id: "column",
    label: "Biểu đồ cột",
  },
  PIE: {
    id: "pie",
    label: "Biểu đồ tròn",
  },
};

class ClassStatisticButton extends PureComponent {
  state = {
    chartType: CHART_TYPE.COLUMN.id,
    modalVisible: false,
  };

  render() {
    const { chartType } = this.state;
    const { record, subjectName } = this.props;

    return (
      <React.Fragment>
        <Button
          type="link"
          onClick={(event) => {
            this.setState({ modalVisible: true });
          }}
        >
          {subjectName}
        </Button>
        <Modal
          title="Thống kê"
          centered
          visible={this.state.modalVisible}
          onCancel={(event) => {
            this.setState({ modalVisible: false });
          }}
          cancelText={"Đóng"}
          okButtonProps={{
            hidden: true,
          }}
          width={1000}
          bodyStyle={{
            height: "80vh",
            padding: "1.5rem",
          }}
        >
          <Radio.Group
            value={chartType}
            onChange={(e) => this.setState({ chartType: e.target.value })}
          >
            <Radio.Button value={CHART_TYPE.COLUMN.id}>
              {CHART_TYPE.COLUMN.label}
            </Radio.Button>
            <Radio.Button value={CHART_TYPE.PIE.id}>
              {CHART_TYPE.PIE.label}
            </Radio.Button>
          </Radio.Group>

          {chartType === CHART_TYPE.COLUMN.id && (
            <div style={{ height: "100%", padding: "15px 0px" }}>
              <ClassStackColumnChart record={record} />
            </div>
          )}

          {chartType === CHART_TYPE.PIE.id && (
            <div style={{ height: "100%", padding: "40px 0px" }}>
              <ClassPieColumnChart record={record} />
            </div>
          )}
        </Modal>
      </React.Fragment>
    );
  }
}

export default ClassStatisticButton;
