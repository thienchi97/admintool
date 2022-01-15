import * as React from "react";
import { getAuth } from "firebase/auth";
import { get, getDatabase, onValue, query, ref } from "firebase/database";
import { values } from "lodash";
import { Spin } from "antd";

export const UserInfoContext = React.createContext();

class UserInfoProvider extends React.Component {
  auth = getAuth();
  database = getDatabase();

  state = {
    loading: true,
    isRoot: false,
    classManaged: [],
  };

  async componentDidMount() {
    let isRootTeacher = false;
    const email = this.auth.currentUser.email;
    const user = this.auth.currentUser;
    const classRef = ref(this.database, "classroom");
    const teacherRef = ref(this.database, "teachers");

    try {
      const teacherList = await get(query(teacherRef));
      const teacherListArr = values(teacherList.val());
      isRootTeacher =
        teacherListArr.findIndex((t) => t.email === email && !!t.root) > -1;
    } catch (error) {
      console.log(error);
    }

    this.unsubscribe = onValue(
      classRef,
      (snapshot) => {
        const data = values(snapshot.val());
        this.setState({
          loading: false,
          isRoot: isRootTeacher,
          classManaged: isRootTeacher
            ? data
            : data.filter((d) => d?.teacherObject?.email === user.email),
        });
      },
      () => {
        this.setState({
          loading: false,
          isRoot: isRootTeacher,
          classManaged: [],
        });
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  render() {
    if (this.state.loading) {
      return (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin></Spin>
        </div>
      );
    }

    return (
      <UserInfoContext.Provider value={this.state}>
        {this.props.children}
      </UserInfoContext.Provider>
    );
  }
}

export default UserInfoProvider;
