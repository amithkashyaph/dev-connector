import axios from "axios";

export default (token) => {
  if (token) {
    console.log("Token is being set");
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    console.log("There is n o token");

    delete axios.defaults.headers.common["x-auth-token"];
  }
};
