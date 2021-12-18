import React from "react";
import "./App.css";
import { Route, Switch, Redirect } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/LayoutMain";
import Student from "./pages/Student";
import User from "./pages/User";
import Class from "./pages/Class";
import { getDatabase, onValue, ref, set, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { cloneDeep, isPlainObject } from "lodash";
import { firebaseUUID } from "./utils";
import RequestApproval from "./pages/RequestApproval";

class App extends React.Component {
  auth = getAuth();
  database = getDatabase();
  teacherData = [];

  state = {
    isAuth: false,
    isRoot: false,
    isAccept: false,
    isLoading: true,
  };

  componentDidMount() {
    const teacherRef = ref(this.database, `/teachers`);
    const self = this;

    this.unSubcribeTeachers = onValue(teacherRef, (snapshot) => {
      const value = isPlainObject(snapshot.val()) ? snapshot.val() : {};

      this.teacherData = Object.keys(value).map((k) => ({
        id: k,
        ...value[k],
      }));

      self.initAuth();
    });
  }

  componentWillUnmount() {
    if (this.unSubcribeAuth) {
      this.unSubcribeAuth();
    }

    if (this.unSubcribeTeachers) {
      this.unSubcribeTeachers();
    }
  }

  initAuth = () => {
    const teacherRef = ref(this.database, `/teachers`);

    this.unSubcribeAuth = onAuthStateChanged(
      this.auth,
      async (user) => {
        const teacher = this.teacherData.find((t) => {
          return t && user && t.email === user.email;
        });

        if (teacher) {
          this.setState({
            isLoading: false,
            isAuth: !!user,
            isRoot: !!teacher.root,
            isAccept: !!teacher.isAccept,
          });

          return;
        }

        try {
          if (!user) throw new Error("User not found");

          await update(teacherRef, {
            [user.uid]: {
              displayName: user.displayName,
              email: user.email,
              id: user.uid,
              isAccept: false,
            },
          });

          this.setState({ isAuth: !!user, isLoading: false });
        } catch (error) {
          console.log(error);
          this.setState({ isAuth: false, isLoading: false });
        }
      },
      () => {
        this.setState({ isLoading: false });
      }
    );
  };

  render() {
    const { isLoading, isAuth, isRoot, isAccept } = this.state;

    if (isLoading) return null;

    if (!isAuth)
      return (
        <Switch>
          <Route exact path="/login">
            <Login />
          </Route>
          <Redirect to={"/login"} />
        </Switch>
      );

    if (!isRoot && !isAccept)
      return (
        <Switch>
          <Route path="/notification">
            <RequestApproval />
          </Route>
          <Redirect to={"/notification"} />
        </Switch>
      );

    if (!isRoot && isAccept)
      return (
        <Switch>
          <Route path="/">
            <Layout isShowUserMenu={false}>
              <Switch>
                <Route path="/class">
                  <Class />
                </Route>
                <Route path="/student">
                  <Student />
                </Route>
              </Switch>
            </Layout>
          </Route>
        </Switch>
      );

    return (
      <Switch>
        <Route path="/">
          <Layout>
            <Switch>
              <Route path="/class">
                <Class />
              </Route>
              <Route path="/student">
                <Student />
              </Route>
              <Route path="/user">
                <User />
              </Route>
            </Switch>
          </Layout>
        </Route>
      </Switch>
    );
  }
}

export default App;
