import { get, getDatabase, query, ref } from "firebase/database";
import React, { PureComponent } from "react";

export default class AttendanceClassName extends PureComponent {
  state = {
    classInfo: null,
  };

  database = getDatabase();

  async componentDidMount() {
    let classInfo;
    const { classId } = this.props;

    try {
      const classRef = ref(this.database, `classroom/${classId}`);
      classInfo = (await get(query(classRef))).toJSON();
    } catch (error) {
      console.error(error);
    }

    this.setState({ classInfo });
  }

  render() {
    const { classInfo } = this.state;

    return <div>{classInfo?.subjectName}</div>;
  }
}
