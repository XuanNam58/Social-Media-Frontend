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

const initialValue = {
  reqUser: null,
  findUsersByIds: [],
  followUser: null,
  unFollowUser: null,
  userByUsername: null,
  uid: null,
  friendList: { result: [], page: 1, hasMore: true },
  followerList: { result: [], page: 1, hasMore: true },
  followingList: { result: [], page: 1, hasMore: true },
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
    case GET_USER_BY_USERNAME:
      return { ...state, userByUsername: action.payload };
    case GET_UID_BY_USERNAME:
      return { ...state, uid: action.payload };
    case GET_FRIEND_LIST:
      return {
        ...state,
        friendList: {
          ...state.friendList,
          result:
            action.payload.page === 1
              ? action.payload.result || []
              : [...state.friendList.result, ...(action.payload.result || [])],
          page: action.payload.page,
          hasMore: action.payload.hasMore,
        },
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
    case GET_FOLLOWER_LIST:
      return {
        ...state,
        followerList: {
          ...state.friendList,
          result:
            action.payload.page === 1
              ? action.payload.result || []
              : [...state.followerList.result, ...(action.payload.result || [])],
          page: action.payload.page,
          hasMore: action.payload.hasMore,
        },
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
    case GET_FOLLOWING_LIST:
      return {
        ...state,
        followingList: {
          ...state.followingList,
          result:
            action.payload.page === 1
              ? action.payload.result || []
              : [...state.followingList.result, ...(action.payload.result || [])],
          page: action.payload.page,
          hasMore: action.payload.hasMore,
        },
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
    default:
      return state;
  }
};