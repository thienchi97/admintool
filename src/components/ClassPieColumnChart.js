import React, { PureComponent } from "react";
import moment from "moment";
import { set, unionBy, values } from "lodash";
import { getDatabase, onValue, ref } from "firebase/database";
import { Pie } from "@ant-design/plots";
import { Typography } from "antd";

const PIE_TYPE = {
  ATTENDANCE: "Điểm danh",
  NOT_ATTENDANCE: "Vắng",
};

class ClassPieColumnChart extends PureComponent {
  state = {
    chartData: [],
    maxDateCalc: null,
  };

  database = getDatabase();

  defaultConfig = {
    appendPadding: 10,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      type: "spider",
      labelHeight: 28,
      content: "{name}\n{percentage}",
    },
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
    ],
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

      const total = Object.values(chartDataObj).length * siso;

      const totalAttendenced = Object.values(chartDataObj).reduce(
        (cur, val) => cur + val.attendenced.length,
        0
      );

      const maxDateCalc = moment
        .max(data.map((d) => moment(d.createAt)))
        .toDate();

      const percentAttendenced =
        totalAttendenced / total === Infinity ? 0 : totalAttendenced / total;

      const chartDataArr = [
        {
          type: PIE_TYPE.ATTENDANCE,
          value: percentAttendenced,
        },
        {
          type: PIE_TYPE.NOT_ATTENDANCE,
          value: 1 - percentAttendenced,
        },
      ];

      this.setState({ chartData: chartDataArr.flat(), maxDateCalc });
    });
  }

  render() {
    const { chartData, maxDateCalc } = this.state;

    const config = {
      data: chartData,
      ...this.defaultConfig,
    };

    return (
      <>
        <Pie {...config} autoFit padding={0} />
        <Typography.Title level={4}>
          Dữ liệu thống kê tính tới ngày:{" "}
          {maxDateCalc && moment(maxDateCalc).format("DD/MM/YYYY")}{" "}
        </Typography.Title>
      </>
    );
  }
}

export default ClassPieColumnChart;
