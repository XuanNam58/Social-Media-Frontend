import axios from "axios";
import {
  FOLLOW_USER,
  GET_FOLLOWER_LIST,
  GET_FOLLOWING_LIST,
  GET_FRIEND_LIST,
  GET_UID_BY_USERNAME,
  GET_USER_BY_USERNAME,
  GET_USERS_BY_USER_IDS,
  REQ_USER,
  UNFOLLOW_USER,
} from "./ActionType";

const AUTH_API = "http://localhost:9191/api/auth/users";
const FRIEND_API = "http://localhost:9191/api/friend/users";
export const followUserAction = (data) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${FRIEND_API}/follow`,
      {
        followerId: data.followerId,
        followedId: data.followedId,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );
    console.log("Follow user response:", res.data);
    dispatch({ type: FOLLOW_USER, payload: res.data });
  } catch (error) {
    console.log("Error following user: ", error);
    if (data.showToast) {
      data.showToast(
        "Error",
        "Error following user: " + error.message,
        "error"
      );
    }
  }
};

export const unFollowUserAction = (data) => async (dispatch) => {
  try {
    const res = await axios.delete(`${FRIEND_API}/unfollow`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
      data: {
        followerId: data.followerId,
        followedId: data.followedId,
      },
    });
    console.log("Unfollow user response:", res.data);
    dispatch({ type: UNFOLLOW_USER, payload: res.data });
  } catch (error) {
    console.log("Error unfollow user: ", error);
    if (data.showToast) {
      data.showToast("Error", "Error unfollow user: " + error.message, "error");
    }
  }
};


export const getUserByUsernameAction =
  (username, token) => async (dispatch) => {
    try {
      const res = await axios.get(
        `${AUTH_API}/get-user-by-username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Get user by username response:", res.data);
      dispatch({ type: GET_USER_BY_USERNAME, payload: res.data });
    } catch (error) {
      console.log("Error getting user by username: ", error);
    }
  };

export const getUidByUsernameAction = (username, token) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/uid?username=${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Get uid by username response:", res.data);
    dispatch({ type: GET_UID_BY_USERNAME, payload: res.data });
  } catch (error) {
    console.log("Error getting uid by username: ", error);
  }
};

export const getUserProfileAction = (token) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/req`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("User profile response:", res.data);
    dispatch({ type: REQ_USER, payload: res.data });
  } catch (error) {
    console.log("Error getting user profile: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

export const getUsersByUserIds = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/${data.type}`, {
      params: { ids: data.userIds.join(",") },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get user list by user ids response:", res.data);
    dispatch({ type: GET_USERS_BY_USER_IDS, payload: res.data });
  } catch (error) {
    console.log("Error getting user list by user ids response: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

// --------------------FRIEND-------------------
export const getFriendListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${FRIEND_API}/friends/${data.uid}`, {
      params: {
        page: data.page || 1,
        size: data.size || 5,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get friend list:", res.data);
    const action = {
      type: GET_FRIEND_LIST,
      payload: {
        result: res.data.result,
        page: data.page,
        hasMore: res.data.result.length === data.size,
      },
    };
    dispatch(action);
    return res.data.result; // Trả về kết quả trực tiếp
  } catch (error) {
    console.log("Get friend list: ", error);
    throw error;
  }
};


// --------------------FOLLOWER-------------------
export const getFollowerListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${FRIEND_API}/followers/${data.followedId}`, {
      params: {
        page: data.page || 1,
        size: data.size || 5,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("get follower list response:", res.data);
    const action = {
      type: GET_FOLLOWER_LIST,
      payload: {
        result: res.data.result,
        page: data.page,
        hasMore: res.data.result.length === data.size,
      },
    };
    dispatch(action);
    return action; // Trả về action để có thể sử dụng .then()
  } catch (error) {
    console.error("Error in get follower list:", error);
    throw error;
  }
};

// --------------------FOLLOWING-------------------
export const getFollowingListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${FRIEND_API}/following/${data.followerId}`, {
      params: {
        page: data.page || 1,
        size: data.size || 5,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("get following list response:", res.data);
    const action = {
      type: GET_FOLLOWING_LIST,
      payload: {
        result: res.data.result,
        page: data.page,
        hasMore: res.data.result.length === data.size,
      },
    };
    dispatch(action);
    return action; // Trả về action để có thể sử dụng .then()
  } catch (error) {
    console.error("Error in get following list:", error);
    throw error;
  }
};

