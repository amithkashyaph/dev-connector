import { combineReducers } from "redux";
import alertReducer from "./alertReducer";
import authreducer from "./authreducer";
import profileReducer from "./profileReducer";

export default combineReducers({
  alerts: alertReducer,
  auth: authreducer,
  profile: profileReducer,
});
