import React, { PureComponent } from "react";
import { Button, Radio } from "antd";
import Modal from "antd/lib/modal/Modal";
import { Column } from "@ant-design/plots";
import { getDatabase, onValue, ref } from "firebase/database";
import { set, groupBy, union, values, cloneDeep, unionBy } from "lodash";
import moment from "moment";

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

const COLUMNS_TYPE = {
  ATTENDANCE: "Điểm danh",
  NOT_ATTENDANCE: "Vắng",
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

          <div style={{ height: "100%", padding: "15px 0px" }}>
            {chartType === CHART_TYPE.COLUMN.id && (
              <StackColumnChart record={record} />
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

class StackColumnChart extends PureComponent {
  state = {
    chartData: [],
  };

  database = getDatabase();

  defaultConfig = {
    isStack: true,
    xField: "date",
    yField: "value",
    seriesField: "type",

    label: {
      // 可手动配置 label 数据标签位置
      position: "middle", // 'top', 'bottom', 'middle'
    },
    interactions: [
      {
        type: "active-region",
        enable: false,
      },
    ],
    columnBackground: {
      style: {
        fill: "rgba(0,0,0,0.1)",
      },
    },
  };

  componentDidMount() {
    const { record } = this.props;
    const { siso = 0, startAt } = record;
    const attendanceRef = ref(this.database, `attendence/${record.id}`);

    onValue(attendanceRef, (snapShot) => {
      const data = values(snapShot.val());

      data.sort((a, b) => {
        return a.createAt - b.createAt;
      });

      let firstData = {};

      if (startAt) {
        const date = moment(startAt).format("DD/MM/YYYY");

        firstData[date] = {
          date,
          attendenced: [],
        };
      }

      const chartDataObj = data.reduce((res, val) => {
        const { attendenced = [], createAt } = val;
        const date = moment(createAt).format("DD/MM/YYYY");

        //prettier-ignore
        if (res[date]) {
          const curAttendance = res[date].attendenced;
          const unionAttendance = unionBy([...curAttendance, ...attendenced], 'id')
          set(res, [date, "attendenced"], unionAttendance);
          return res;
        }

        res[date] = {
          date,
          attendenced,
        };

        return res;
      }, firstData);

      const chartDataArr = Object.values(chartDataObj).map((data) => {
        const attendenceCount = data.attendenced.length || null;
        const notAttendenceCount = Math.abs(siso - attendenceCount) || null;

        return [
          {
            date: data.date,
            value: attendenceCount,
            type: COLUMNS_TYPE.ATTENDANCE,
          },
          {
            date: data.date,
            value: notAttendenceCount,
            type: COLUMNS_TYPE.NOT_ATTENDANCE,
          },
        ];
      });

      this.setState({ chartData: chartDataArr.flat() });
    });
  }

  render() {
    const { chartData } = this.state;

    const config = {
      data: chartData,
      ...this.defaultConfig,
    };

    return <Column {...config} autoFit padding={20} />;
  }
}

export default ClassStatisticButton;
