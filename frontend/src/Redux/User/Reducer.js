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

const initialValue = {
  reqUser: null,
  findUsersByIds: [],
  followUser: null,
  unFollowUser: null,
  searchUser: null,
  userByUsername: null,
  uid: null,
  friendIds: [],
  followerIds: [],
  followingIds: [],

  page: 1,
  hasMore: true,
  modalType: null,
};
export const UserReducer = (state = initialValue, action) => {
  switch (action.type) {
    case REQ_USER:
      return { ...state, reqUser: action.payload };
    case GET_USERS_BY_USER_IDS:
      return {
        ...state,
        findUsersByIds:
          state.page === 1
            ? action.payload
            : [...state.findUsersByIds, ...action.payload],
      };
    case FOLLOW_USER:
      return { ...state, followUser: action.payload };
    case UNFOLLOW_USER:
      return { ...state, unFollowUser: action.payload };
    case SEARCH_USER:
      return { ...state, searchUser: action.payload };
    case GET_USER_BY_USERNAME:
      return { ...state, userByUsername: action.payload };
    case GET_UID_BY_USERNAME:
      return { ...state, uid: action.payload };
    case GET_FRIEND_IDS:
      return { ...state, friendIds: action.payload };
    case GET_FOLLOWER_IDS:
      return {
        ...state,
        followerIds:
          action.payload.page === 1
            ? action.payload.ids
            : [...state.followerIds, ...action.payload.ids],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
    case GET_FOLLOWING_IDS:
      return {
        ...state,
        followingIds:
          action.payload.page === 1
            ? action.payload.ids
            : [...state.followingIds, ...action.payload.ids],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
  }

  return state;
};
