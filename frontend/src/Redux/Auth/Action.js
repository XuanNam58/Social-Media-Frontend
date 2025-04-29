import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  SIGNUP_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  LOGOUT,
} from "./ActionType";

export const loginAction = (data, showToast) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    // const userDoc = await getDoc(doc(firestore, "users", userCredential.user.uid));
    const user = userCredential.user;
    // Lấy Firebase ID token
    const idToken = await user.getIdToken();

    // Gửi token đến backend
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      showToast("Error", errorData.message || "Login failed", "error");
    }

    const responseData = await res.json();
    const token = responseData.result.token;

    console.log("login", token);

    // localStorage.setItem("token", token);
    dispatch({ type: LOGIN_SUCCESS, payload: token });
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.message });
    showToast("Error", error.message, "error");
  }
};

export const signupAction = (data, showToast) => async (dispatch) => {
  try {
    dispatch({ type: SIGNUP_REQUEST });
    const res = await fetch("http://localhost:8080/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json();
      showToast("Error", errorData.message || "Signup failed", "error");
    }

    const user = await res.json();
    console.log("signup user", user.result);

    dispatch({ type: SIGNUP_SUCCESS, payload: user.result });
  } catch (error) {
    dispatch({ type: SIGNUP_FAILURE, payload: error.message})
    showToast("Error", error.message, "error");
  }
};

export const logoutAction = () => {
  return {
    type: LOGOUT,
  };
};
