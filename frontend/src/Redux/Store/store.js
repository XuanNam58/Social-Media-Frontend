import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { AuthReducer } from "../Auth/Reducer";
import { thunk } from "redux-thunk";
import { UserReducer } from "../User/Reducer";
import { SearchReducer } from "../Search/Reducer";

const rootReducer = combineReducers({
    auth: AuthReducer,
    user: UserReducer,
    search: SearchReducer
})

export const store = legacy_createStore(rootReducer,applyMiddleware(thunk));