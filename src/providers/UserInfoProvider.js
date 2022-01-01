import * as React from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import { values } from "lodash";

const UserInfoContext = React.createContext();

class UserInfoProvider extends React.Component {
  auth = getAuth();
  database = getDatabase();

  state = {
    isRoot: !!this.auth.currentUser.isRoot,
    classManaged: [],
  };

  componentDidMount() {
    const user = this.auth.currentUser;
    const classRef = ref(this.database, "classroom");

    onValue(classRef, (snapshot) => {
      const data = values(snapshot.val());
      this.setState({
        classManaged: data.filter((d) => d?.teacher?.email === user.email),
      });
    });
  }

  render() {
    return (
      <UserInfoContext.Provider value={this.state}>
        {this.props.children}
      </UserInfoContext.Provider>
    );
  }
}

export default UserInfoProvider;
