import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { AuthReducer } from "../Auth/Reducer";
import { thunk } from "redux-thunk";
import { UserReducer } from "../User/Reducer";

const rootReducer = combineReducers({
    auth: AuthReducer,
    user: UserReducer
})

export const store = legacy_createStore(rootReducer,applyMiddleware(thunk));