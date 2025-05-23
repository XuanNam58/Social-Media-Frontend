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
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    const res = await fetch("http://localhost:9191/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    const responseData = await res.json();

    if (!res.ok) {
      dispatch({ type: LOGIN_FAILURE, payload: responseData.message });
      showToast("Error", responseData.message || "Login failed", "error");
      return;
    }

    const token = responseData.result.token;
    dispatch({ type: LOGIN_SUCCESS, payload: token });
  } catch (error) {
    let errorMessage = "An error occurred during login";
    
    if (error.code === "auth/invalid-credential") {
      errorMessage = "Incorrect email or password. Please try again";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed login attempts. Please try again later";
    }

    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
    showToast("Error", errorMessage, "error");
  }
};

export const signupAction = (data, showToast) => async (dispatch) => {
  try {
    dispatch({ type: SIGNUP_REQUEST });
    const res = await fetch("http://localhost:9191/api/auth/signup", {
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
