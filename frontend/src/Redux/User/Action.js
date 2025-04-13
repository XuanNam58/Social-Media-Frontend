import axios from "axios";
import { FOLLOW_USER, GET_MUTUAL_FOLLOW_IDS, GET_UID_BY_USERNAME, GET_USER_BY_USERNAME, GET_USERS_BY_USER_IDS, REQ_USER, SEARCH_USER, UNFOLLOW_USER } from "./ActionType";

const BASE_API = "http://localhost:8080/api/users";
const FRIEND_API = "http://localhost:8081/api/users";
export const followUserAction =
  (data) => async (dispatch) => {
    try {
      console.log("Follow user data:", data);
      const res = await axios.post(`${FRIEND_API}/follow`, {
        followerId: data.followerId,
        followedId: data.followedId,
      }, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        }
      });
      console.log("Follow user response:", res.data);
      dispatch({ type: FOLLOW_USER, payload: res.data });
    } catch (error) {
      console.log("Error following user: ", error);
      if (data.showToast) {
        data.showToast("Error", "Error following user: " + error.message, "error");
      }
    }
  };

export const unFollowUserAction =
  (data) => async (dispatch) => {
    try {
      console.log("Unfollow user data:", data);
      const res = await axios.delete(`${FRIEND_API}/unfollow`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        data: {
          followerId: data.followerId,
          followedId: data.followedId,
        }
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

export const searchUserAction =
  (data) => async (dispatch) => {
    try {
      const res = await axios.get(`${BASE_API}/search?q=${data.query}`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        }
      });
      console.log("Search user response:", res.data);
      dispatch({ type: SEARCH_USER, payload: res.data });
    } catch (error) {
      console.log("Error searching user: ", error);
      data.showToast("Error", "Error searching user: " + error.message, "error");
    }
  };

export const getUserByUsernameAction = (username, token) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_API}/get-user-by-username/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("Get user by username response:", res.data);
    dispatch({ type: GET_USER_BY_USERNAME, payload: res.data });
  } catch (error) {
    console.log("Error getting user by username: ", error);
  }
};

export const getUidByUsernameAction = (username, token) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_API}/uid?username=${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("Get uid by username response:", res.data);
    dispatch({ type: GET_UID_BY_USERNAME, payload: res.data });
  } catch (error) {
    console.log("Error getting uid by username: ", error);
  }
};

export const getUserProfileAction = (token) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_API}/req`, {
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
    const res = await axios.get(`${BASE_API}/${data.type}`, {
      params:{ids: data.userIds.join(',')},
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

export const getMutualFollowIdsAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${FRIEND_API}/get-mutual-follows`, {
      params:{
        followers: data.followers.join(','),
        following: data.following.join(',')
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get mutual follow id list:", res.data);
    dispatch({ type: GET_MUTUAL_FOLLOW_IDS, payload: res.data });
  } catch (error) {
    console.log("Get mutual follow id list: ", error);
    // Có thể thêm showToast ở đây nếu cần
  }
};

export const getFriendListAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_API}/${data.type}`, {
      params:{ids: data.userIds.join(',')},
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