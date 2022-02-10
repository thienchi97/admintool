import React, { PureComponent } from "react";
import moment from "moment";
import { set, unionBy, values } from "lodash";
import { getDatabase, onValue, ref } from "firebase/database";
import { Column } from "@ant-design/plots";

const COLUMNS_TYPE = {
  ATTENDANCE: "Điểm danh",
  NOT_ATTENDANCE: "Vắng",
};

class ClassStackColumnChart extends PureComponent {
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

export default ClassStackColumnChart;
