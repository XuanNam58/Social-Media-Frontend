import {
  FOLLOW_USER,
  GET_MUTUAL_FOLLOW_IDS,
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
  mutualFollowIds: []
};
export const UserReducer = (store = initialValue, { type, payload }) => {
  switch (type) {
    case REQ_USER:
      return { ...store, reqUser: payload };
    case GET_USERS_BY_USER_IDS:
      return { ...store, findUsersByIds: payload };
    case FOLLOW_USER:
      return { ...store, followUser: payload };
    case UNFOLLOW_USER:
      return { ...store, unFollowUser: payload };
    case SEARCH_USER:
      return { ...store, searchUser: payload };
    case GET_USER_BY_USERNAME:
      return { ...store, userByUsername: payload };
    case GET_UID_BY_USERNAME:
      return { ...store, uid: payload };
      case GET_MUTUAL_FOLLOW_IDS:
      return { ...store, mutualFollowIds: payload };
  }

  return store;
};
