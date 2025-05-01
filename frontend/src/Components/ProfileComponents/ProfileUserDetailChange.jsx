import React, { useEffect, useState } from "react";
import FollowListModal from "./FollowListModal";
import { useDisclosure } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFollowerIdsAction,
  getFollowerListAction,
  getFollowingIdsAction,
  getFollowingListAction,
  getUsersByUserIds,
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
      setLocalIsFollowing(true);
      await onFollow();
    } catch (error) {
      setLocalIsFollowing(false);
    }
  };

  const handleUnfollowClick = async () => {
    try {
      setLocalIsFollowing(false);
      await onUnfollow();
    } catch (error) {
      setLocalIsFollowing(true);
    }
  };

  // Kiểm tra và sử dụng profilePicURL hoặc profilePicUrl
  const profilePicUrl =
    userParam.profilePicURL || userParam.profilePicUrl || profile.avatar;

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalTile, setModalTitle] = useState("");

  const handleOpenFollowers = () => {
    console.log("Opening followers modal");
    setModalTitle("Followers");
    dispatch(
      getFollowerIdsAction({
        token,
        followedId: userParam.uid,
        page: 1,
        size: 5,
      })
    )
      .then((action) => {
        if (action && action.payload && action.payload.ids) {
          const newIds = action.payload.ids;
          dispatch(
            getFollowerListAction({
              token,
              userIds: newIds,
              type: "follower-list",
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error getting followers:", error);
      });
    onOpen();
  };

  const handleOpenFollowing = () => {
    console.log("Opening following modal");
    setModalTitle("Following");
    dispatch(
      getFollowingIdsAction({
        token,
        followerId: userParam.uid,
        page: 1,
        size: 5,
      })
    )
      .then((action) => {
        if (action && action.payload && action.payload.ids) {
          const newIds = action.payload.ids;
          dispatch(
            getFollowingListAction({
              token,
              userIds: newIds,
              type: "following-list",
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error getting following:", error);
      });
    onOpen();
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
                  className="bg-gray-200 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-300"
                  onClick={handleUnfollowClick}
                >
                  Following
                </button>
              ) : (
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
                  onClick={handleFollowClick}
                >
                  Follow
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
