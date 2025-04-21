import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileUserDetailChange from "../../Components/ProfileComponents/ProfileUserDetailChange";
import ReqUserPostPart from "../../Components/ProfileComponents/ReqUserPostPart";
import { getAuth } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  followUserAction,
  getUidByUsernameAction,
  getUserByUsernameAction,
  getUserProfileAction,
  unFollowUserAction,
} from "../../Redux/User/Action";

const Profile = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store);
  // Get token
  const auth = getAuth();
  const [token, setToken] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy token
        let currentToken = null;
        if (auth.currentUser) {
          currentToken = await auth.currentUser.getIdToken();
          setToken(currentToken);
        }

        // Nếu không có username trong URL hoặc username trùng với người dùng hiện tại
        if (
          !username ||
          (user.reqUser?.username && username === user.reqUser.username)
        ) {
          console.log("Lấy thông tin người dùng hiện tại");
          await dispatch(getUserProfileAction(currentToken));
        } else {
          // Lấy thông tin người dùng khác
          console.log("Lấy thông tin người dùng khác:", username);
          await dispatch(getUserByUsernameAction(username, currentToken));
          await dispatch(getUidByUsernameAction(username, currentToken));
        }

        setLoading(false);
      } catch (error) {
        console.log("Error fetching user data:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

    // Xác định người dùng cần hiển thị
    const profileUser =
    username && user.reqUser?.username !== username
      ? user.userByUsername
      : user.reqUser;

  const handleFollow = async () => {
    try {
          
      console.log("Follow user:", auth.currentUser.uid);
      console.log("Followed user:", user.uid);

      const data = {
        followerId: auth.currentUser.uid,
        followedId: user.uid,
        token: token,
        showToast: (title, message, type) => {
          console.log(`${title}: ${message} (${type})`);
        }
      };

      await dispatch(followUserAction(data));
      
      // Cập nhật lại thông tin người dùng sau khi follow
      if (username) {
        await dispatch(getUserByUsernameAction(username, token));
      } else {
        await dispatch(getUserProfileAction(token));
      }
    } catch (error) {
      console.log("Error following user:", error);
      setError("Error following user");
    }
  };

  const handleUnfollow = async () => {
    try {

      console.log("Unfollow user:", profileUser.id);
      console.log("Current user:", auth.currentUser.uid);

      const data = {
        followerId: auth.currentUser.uid,
        followedId: user.uid,
        token: token,
        showToast: (title, message, type) => {
          console.log(`${title}: ${message} (${type})`);
        }
      };

      await dispatch(unFollowUserAction(data));
      
      // Cập nhật lại thông tin người dùng sau khi unfollow
      if (username) {
        await dispatch(getUserByUsernameAction(username, token));
      } else {
        await dispatch(getUserProfileAction(token));
      }
    } catch (error) {
      console.log("Error unfollowing user:", error);
      setError("Error unfollowing user");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        
      </div>
    );
  }


  if (!profileUser) {
    return <div className="text-center py-8">User not found</div>;
  }

  const isOwnProfile =
    !username || (user.reqUser && username === user.reqUser.username);
  const isFollowing = profileUser.followers?.includes(auth.currentUser?.uid);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileUserDetailChange
        userParam={profileUser}
        isOwnProfile={isOwnProfile}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        isFollowing={isFollowing}
      />
      <div className="mt-8">
        <ReqUserPostPart posts={profileUser.posts} />
      </div>
    </div>
  );
};

export default Profile;
