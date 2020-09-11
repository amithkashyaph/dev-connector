import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import "./App.css";
import LandingPage from "./components/layouts/LandingPage";
import Navbar from "./components/layouts/Navbar";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

// Redux
import { Provider } from "react-redux";
import store from "./store";

//
import Alert from "./components/layouts/Alert";
import setAuthToken from "./utils/setAuthToken";
import { loadUser } from "./actions/auth";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./routing/PrivateRoute";
import CreateProfile from "./components/profile-form/CreateProfile";
import EditProfile from "./components/profile-form/EditProfile";
import AddExperience from "./components/profile-form/AddExperience";
import AddEducation from "./components/profile-form/AddEducation";
import Profiles from "./components/profiles/Profiles";
import Profile from "./components/profile/Profile";
import Posts from "./components/posts/Posts";
import Post from "./components/post/Post";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <BrowserRouter>
        <React.Fragment>
          <Navbar />
          <Route path="/" exact component={LandingPage} />

          <section className="container">
            <Alert />
            <Switch>
              <Route path="/register" exact component={Register} />
              <Route path="/login" exact component={Login} />
              <Route path="/profiles" exact component={Profiles} />
              <Route path="/profile/:id" exact component={Profile} />
              <PrivateRoute path="/dashboard" exact component={Dashboard} />
              <PrivateRoute
                path="/create-profile"
                exact
                component={CreateProfile}
              />
              <PrivateRoute
                path="/edit-profile"
                exact
                component={EditProfile}
              />
              <PrivateRoute
                path="/add-experience"
                exact
                component={AddExperience}
              />
              <PrivateRoute
                path="/add-education"
                exact
                component={AddEducation}
              />
              <PrivateRoute path="/posts" exact component={Posts} />
              <PrivateRoute path="/posts/:id" exact component={Post} />
            </Switch>
          </section>
        </React.Fragment>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
