import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  SIGNUP_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
} from "./ActionType";

const initialState = {
  user: null,
  loading: false,
  error: null,
  signup: null,
};
export const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
      return { ...state, loading: true };
    case LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload };
    case SIGNUP_SUCCESS:
      return { ...state, loading: false, signup: action.payload };
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
