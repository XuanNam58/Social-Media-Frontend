import React, { useEffect, useState } from "react";
import FollowListModal from "./FollowListModal";
import { useDisclosure } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFollowerListAction,
  getFollowingListAction,
} from "../../Redux/User/Action";
import { getAuth } from "firebase/auth";
const profile = {
  username: "ganknow",
  posts: 501,
  followers: "2,866",
  following: 268,
  name: "Gank",
  description:
    "Gank is a content membership platform that helps content creators accept donations, manage memberships and sell merch, for free.",
  link: "https://linktree.com/ganknow",
  avatar: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
  highlights: [
    {
      title: "Giveaway",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "Reviews",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "Dota All-Star",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "MasterRame...",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "Gamepals",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "All-Star Valo",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
    {
      title: "Valorant",
      image:
        "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
    },
  ],
};

const ProfileUserDetailChange = ({
  userParam,
  isOwnProfile,
  onFollow,
  onUnfollow,
  isFollowing,
}) => {
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const auth = getAuth();
  const [token, setToken] = useState(null);
  const user = useSelector((store) => store.user);

  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setToken(token);
      }
    };
    getToken();
  }, [auth.currentUser]);

  useEffect(() => {
    setLocalIsFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollowClick = async () => {
    try {
      setIsLoading(true);
      setLocalIsFollowing(true);
      await onFollow();
    } catch (error) {
      setLocalIsFollowing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollowClick = async () => {
    try {
      setIsLoading(true);
      setLocalIsFollowing(false);
      await onUnfollow();
    } catch (error) {
      setLocalIsFollowing(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra và sử dụng profilePicURL hoặc profilePicUrl
  const profilePicUrl =
    userParam.profilePicURL || userParam.profilePicUrl || profile.avatar;

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalTile, setModalTitle] = useState("");

  const handleOpenFollowers = async () => {
    try {
      console.log("Opening followers modal");
      setModalTitle("Followers");
      
      await dispatch(
        getFollowerListAction({
          token,
          followedId: userParam.uid,
          page: 1,
          size: 5,
        })
      );
      
      onOpen();
    } catch (error) {
      console.error("Error fetching followers:", error);
      // Xử lý lỗi ở đây
    }
  };
  
  const handleOpenFollowing = async () => {
    try {
      setModalTitle("Following");
      
      await dispatch(
        getFollowingListAction({
          token,
          followerId: userParam.uid,
          page: 1,
          size: 5,
        })
      );
      
      onOpen();
    } catch (error) {
      console.error("Error fetching following:", error);
      // Xử lý lỗi ở đây
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <img
          src={profilePicUrl}
          alt="Avatar"
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <h2 className="text-xl font-bold">{userParam.username}</h2>
          <div className="flex space-x-2 mt-1">
            {!isOwnProfile &&
              (isFollowing ? (
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-300 flex items-center justify-center min-w-[100px]"
                  onClick={handleUnfollowClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Following"
                  )}
                </button>
              ) : (
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 flex items-center justify-center min-w-[100px]"
                  onClick={handleFollowClick}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Follow"
                  )}
                </button>
              ))}
            <button className="border px-4 py-1 rounded-lg">Message</button>
          </div>

          <div className="flex justify-center mt-4 text-gray-700 space-x-6 text-sm font-medium">
            <span>{userParam.postNum || 0} posts</span>
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={handleOpenFollowers}
            >
              {userParam.followerNum} followers
            </span>
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={handleOpenFollowing}
            >
              {userParam.followingNum} following
            </span>
          </div>

          {/* Modal */}
          <FollowListModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTile}
            userId={userParam.uid}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="mt-3">
        <h3 className="font-bold">{userParam.fullName}</h3>
        <p className="text-gray-700 text-sm">{userParam.bio}</p>
        <a
          href={profile.link}
          className="text-blue-500 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile.link}
        </a>
      </div>

      {/* Highlights */}
      <div className="flex space-x-4 mt-4 overflow-x-auto">
        {profile.highlights.map((highlight, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={highlight.image}
              alt={highlight.title}
              className="w-16 h-16 rounded-full border"
            />
            <span className="text-xs mt-1">{highlight.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileUserDetailChange;
