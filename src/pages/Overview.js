import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import * as classes from "./OverviewTable.module.css";
import { Select, Button, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Bar, Line, Doughnut } from "react-chartjs-2";

const attendantsData = {
  labels: [],
  datasets: [
    {
      label: "Attendant",
      fill: true,
      lineTension: 0.1,
      backgroundColor: " #11998e",
      borderColor: "rgba(75,192,192,1)",
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [],
    },
  ],
};
const options = {
  plugins: {
    datalabels: {
      label: "attendant",
      align: "center",
      color: "white",
      display: true,
      font: {
        weight: "bold",
      },
    },
  },
  scales: {
    yAxes: [
      {
        ticks: {
          display: false,
          beginAtZero: true,
          min: 0,
        },
      },
    ],
  },
  aspectRatio: 5,
};

class Overview extends Component {
  render() {
    return;
    <React.Fragment>
      <div>
        <h3 style={{ fontFamily: "Monaco" }}>Attendant info</h3>
        <Bar ref="chart" options={options} data={attendantsData} />
        <Divider></Divider>
      </div>
    </React.Fragment>;
  }
}
export default withRouter(Overview);
