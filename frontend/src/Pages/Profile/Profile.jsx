import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileUserDetailChange from "../../Components/ProfileComponents/ProfileUserDetailChange";
import ReqUserPostPart from "../../Components/ProfileComponents/ReqUserPostPart";
import { getAuth } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  followUserAction,
  getFollowerIdsAction,
  getUidByUsernameAction,
  getUserByUsernameAction,
  getUserProfileAction,
  unFollowUserAction,
} from "../../Redux/User/Action";
import axios from "axios";

const Profile = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
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
          user.reqUser?.result.username &&
          username === user.reqUser.result.username
        ) {
          console.log("Lấy thông tin người dùng hiện tại");
          await dispatch(getUserProfileAction(currentToken));
        } else {
          // Lấy thông tin người dùng khác
          console.log("Lấy thông tin người dùng khác:", username);
          await dispatch(getUserByUsernameAction(username, currentToken));
          // await dispatch(getUidByUsernameAction(username, currentToken));
        }

        setLoading(false);
      } catch (error) {
        console.log("Error fetching user data:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, auth.currentUser]);

  // Kiểm tra trạng thái follow
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (
        token &&
        user.reqUser?.result?.uid &&
        user.userByUsername?.result?.uid
      ) {
        try {
          const response = await axios.get(
            "http://localhost:8081/api/friend/users/check-following",
            {
              params: {
                followerId: user.reqUser.result.uid,
                followedId: user.userByUsername.result.uid,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setIsFollowing(response.data.result);
        } catch (error) {
          console.error("Error checking following status:", error);
        }
      }
    };

    checkFollowingStatus();
  }, [
    user.reqUser?.result?.followingNum,
    user.userByUsername?.result?.followerNum,
    token,
    user.reqUser?.result?.uid,
    user.userByUsername?.result?.uid,
  ]);

  // Xác định người dùng cần hiển thị
  const profileUser =
    username && user.reqUser?.result.username !== username
      ? user.userByUsername?.result
      : user.reqUser?.result;

  const handleFollow = async () => {
    try {
      console.log("Follow user:", auth.currentUser.uid);
      console.log("Followed user:", user.uid);

      const data = {
        followerId: auth.currentUser.uid,
        followedId: user.userByUsername.result.uid,
        token: token,
        showToast: (title, message, type) => {
          console.log(`${title}: ${message} (${type})`);
        },
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
      const data = {
        followerId: auth.currentUser.uid,
        followedId: user.userByUsername.result.uid,
        token: token,
        showToast: (title, message, type) => {
          console.log(`${title}: ${message} (${type})`);
        },
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
    !username || (user.reqUser && username === user.reqUser.result.username);

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
