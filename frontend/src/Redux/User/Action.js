import axios from "axios";
import {
  FOLLOW_USER,
  GET_FOLLOWER_IDS,
  GET_FOLLOWING_IDS,
  GET_FRIEND_IDS,
  GET_UID_BY_USERNAME,
  GET_USER_BY_USERNAME,
  GET_USERS_BY_USER_IDS,
  REQ_USER,
  SEARCH_USER,
  UNFOLLOW_USER,
} from "./ActionType";

const AUTH_API = "http://localhost:8080/api/users";
const FRIEND_API = "http://localhost:8081/api/users";
export const followUserAction = (data) => async (dispatch) => {
  try {
    console.log("Follow user data:", data);
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
    console.log("Unfollow user data:", data);
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

export const searchUserAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/search?q=${data.query}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Search user response:", res.data);
    dispatch({ type: SEARCH_USER, payload: res.data });
  } catch (error) {
    console.log("Error searching user: ", error);
    data.showToast("Error", "Error searching user: " + error.message, "error");
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
export const getFriendIdsAction = (data) => async (dispatch) => {
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
    console.log("Get friend id list:", res.data);
    dispatch({ type: GET_FRIEND_IDS, payload: res.data });
  } catch (error) {
    console.log("Get friend id list: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

export const getFriendListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/${data.type}`, {
      params: { ids: data.userIds.join(",") },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get friend list:", res.data);
    dispatch({ type: GET_USERS_BY_USER_IDS, payload: res.data });
  } catch (error) {
    console.log("Get friend list: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

// --------------------FOLLOWER-------------------
export const getFollowerIdsAction = (data) => async (dispatch) => {
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
    console.log("getFollowerIdsAction response:", res.data);
    const action = {
      type: GET_FOLLOWER_IDS,
      payload: {
        ids: res.data.result,
        page: data.page,
        hasMore: res.data.result.length === data.size,
      },
    };
    dispatch(action);
    return action; // Trả về action để có thể sử dụng .then()
  } catch (error) {
    console.error("Error in getFollowerIdsAction:", error);
    throw error;
  }
};

export const getFollowerListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/${data.type}`, {
      params: { ids: data.userIds.join(",") },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get follower list:", res.data);
    dispatch({
      type: GET_USERS_BY_USER_IDS,
      payload: res.data,
    });
  } catch (error) {
    console.log("Get follower list: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

// --------------------FOLLOWING-------------------
export const getFollowingIdsAction = (data) => async (dispatch) => {
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
    console.log("getFollowingIdsAction response:", res.data);
    const action = {
      type: GET_FOLLOWING_IDS,
      payload: {
        ids: res.data.result,
        page: data.page,
        hasMore: res.data.result.length === data.size,
      },
    };
    dispatch(action);
    return action; // Trả về action để có thể sử dụng .then()
  } catch (error) {
    console.error("Error in getFollowingIdsAction:", error);
    throw error;
  }
};

export const getFollowingListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${AUTH_API}/${data.type}`, {
      params: { ids: data.userIds.join(",") },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get following list:", res.data);
    dispatch({ type: GET_USERS_BY_USER_IDS, payload: res.data });
  } catch (error) {
    console.log("Get following list: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};
