import axios from "axios";
import {
  DELETE_SEARCH_HISTORY_SUCCESS,
  GET_RECENT_SEARCH,
  SEARCH_USER,
} from "./ActionType";

const SEARCH_API = "http://localhost:8080/api/auth/search";

export const searchUserAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${SEARCH_API}/?q=${data.query}`, {
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

export const getRecentSearchAction = (data) => async (dispatch) => {
  try {
    const res = await axios.get(`${SEARCH_API}/${data.searcherId}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Get recent search response:", res.data);
    dispatch({ type: GET_RECENT_SEARCH, payload: res.data });
  } catch (error) {
    console.log("Error get recent search user: ", error);
  }
};

export const addSearchHistoryAction = (data) => async (dispatch) => {
  try {
    await axios.post(
      `${SEARCH_API}/add-search-history`,
      {},
      {
        params: {
          searcherId: data.searcherId,
          targetUserId: data.targetUserId,
        },
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );
    console.log("Add search history successfully");
  } catch (error) {
    console.log("Error adding search history: ", error);
  }
};

export const deleteSearchHistoryAction = (data) => async (dispatch) => {
  try {
    await axios.delete(`${SEARCH_API}/delete-search-history`, {
      params: {
        searcherId: data.searcherId,
        targetUserId: data.targetUserId,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    dispatch({
      type: DELETE_SEARCH_HISTORY_SUCCESS,
      payload: {
        targetUserId: data.targetUserId,
      },
    });
    console.log("Delete search history successfully");
  } catch (error) {
    console.log("Error deleting search history: ", error);
  }
};

export const deleteAllSearchHistoryAction = (data) => async (dispatch) => {
  try {
    await axios.delete(`${SEARCH_API}/delete-all-search-history`, {
      params: {
        searcherId: data.searcherId,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });
    console.log("Delete all search history successfully");
  } catch (error) {
    console.log("Error deleting all search history: ", error);
  }
};
