import { DELETE_SEARCH_HISTORY_SUCCESS, GET_RECENT_SEARCH, SEARCH_USER } from "./ActionType";

const initialValue = {
  searchUser: null,
  recentSearch: null,
};

export const SearchReducer = (state = initialValue, action) => {
  switch (action.type) {
    case SEARCH_USER:
      return { ...state, searchUser: action.payload };
    case GET_RECENT_SEARCH:
      return { ...state, recentSearch: action.payload };
    case DELETE_SEARCH_HISTORY_SUCCESS:
      return {
        ...state,
        recentSearch: {
          ...state.recentSearch,
          result: state.recentSearch.result.filter(
            (user) => user.uid !== action.payload.targetUserId
          ),
        },
      };
    default:
      return state;
  }
};
