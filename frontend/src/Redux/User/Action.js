import axios from "axios";
import { REQ_USER } from "./ActionType";

const BASE_API = "http://localhost:8081/api/users/";

export const followUserAction =
  (token, followerId, followedId) => async (dispatch) => {
    try {
      const res = await axios.post(`${BASE_API}/follow`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          followerId: followerId,
          followedId: followedId,
        },
      });
      console.log(res.data)
    } catch (error) {
         console.log("Error following user: ", error)
    }
  };

export const getUserProfileAction=(token)=>async(dispatch) =>{
    try {
        const res=await fetch("http://localhost:8080/api/users/req", {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        }
    })

    const reqUser = await res.json();
    console.log(reqUser)

    dispatch({type:REQ_USER, payload: reqUser});
    } catch (error) {
        console.log("catch ", error)
    }
    

}