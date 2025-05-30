import React, { useEffect, useState } from "react";
import FollowListModal from "./FollowListModal";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFollowerListAction,
  getFollowingListAction,
} from "../../Redux/User/Action";
import { getAuth } from "firebase/auth";
import axios from "axios";

const profile = {
  username: "ganknow",
  posts: 501,
  followers: "2,866",
  following: 268,
  name: "Gank",
  description:
    "Gank is a content membership platform that helps content creators accept donations, manage memberships and sell merch, for free.",
  avatar: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png"
};

const AUTH_API = "http://localhost:9191/api/auth/users";

const getToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return token;
  }
  return null;
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
  const [userProfile, setUserProfile] = useState(userParam);

  // State cho form chỉnh sửa
  const [editFullName, setEditFullName] = useState(userParam.fullName || "");
  const [editBio, setEditBio] = useState(userParam.bio || "");
  const [editFile, setEditFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Modal chỉnh sửa
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalTile, setModalTitle] = useState("");

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
    }
  };

  const handleEditProfile = () => {
    setEditFullName(userProfile.fullName || "");
    setEditBio(userProfile.bio || "");
    setEditFile(null);
    setPreviewAvatar(null);
    onEditOpen();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      if (editBio) formData.append("bio", editBio);
      if (editFullName) formData.append("fullName", editFullName);
      if (editFile) formData.append("file", editFile);

      const token = await getToken();
      console.log("userid", auth.currentUser.uid);

      // Gửi yêu cầu PUT để cập nhật
      await axios.put(
        `${AUTH_API}/update-user/${auth.currentUser.uid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật userProfile với dữ liệu mới
      setUserProfile({
        ...userProfile,
        bio: editBio || userProfile.bio,
        fullName: editFullName || userProfile.fullName,
        profilePicURL: editFile ? previewAvatar : userProfile.profilePicURL, // Sử dụng previewAvatar nếu có file
      });

      onEditClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra và sử dụng profilePicURL hoặc profilePicUrl
  const profilePicUrl =
    userProfile.profilePicURL || userProfile.profilePicUrl || profile.avatar;

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <img
          src={profilePicUrl}
          alt="Avatar"
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <h2 className="text-xl font-bold">{userProfile.username}</h2>
          <div className="flex space-x-2 mt-1">
            {isOwnProfile ? (
              <button
                className="bg-gray-200 text-gray-800 px-4 py-1 rounded-lg hover:bg-gray-300"
                onClick={handleEditProfile}
                disabled={isLoading}
              >
                Edit Profile
              </button>
            ) : localIsFollowing ? (
              <>
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
                <button className="border px-4 py-1 rounded-lg">Message</button>
              </>
            ) : (
              <>
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
                <button className="border px-4 py-1 rounded-lg">Message</button>
              </>
            )}
          </div>

          <div className="flex justify-center mt-4 text-gray-700 space-x-6 text-sm font-medium">
            
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={handleOpenFollowers}
            >
              {userProfile.followerNum} followers
            </span>
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={handleOpenFollowing}
            >
              {userProfile.followingNum} following
            </span>
          </div>

          {/* Modal Follow/Following */}
          <FollowListModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTile}
            userId={userProfile.uid}
          />

          {/* Modal Edit Profile */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Profile</ModalHeader>
              <ModalBody>
                <VStack spacing={4} align="start">
                  {/* Avatar */}
                  <HStack spacing={4} width="full">
                    <Image
                      src={previewAvatar || profilePicUrl}
                      alt="Avatar"
                      boxSize="80px"
                      borderRadius="full"
                      border="2px solid gray"
                    />
                    <VStack align="start" flex={1}>
                      <Text fontWeight="bold">{userProfile.username}</Text>
                      <label className="text-blue-500 cursor-pointer">
                        Change profile photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </VStack>
                  </HStack>

                  {/* Full Name */}
                  <VStack align="start" width="full">
                    <Text fontWeight="bold">Full Name</Text>
                    <Input
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </VStack>

                  {/* Bio */}
                  <VStack align="start" width="full">
                    <Text fontWeight="bold">Bio</Text>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Enter bio"
                      rows={3}
                    />
                  </VStack>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={handleSaveProfile}
                  isLoading={isLoading}
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={onEditClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-3">
        <h3 className="font-bold">{userProfile.fullName}</h3>
        <p className="text-gray-700 text-sm">{userProfile.bio}</p>
        <a
          href={profile.link}
          className="text-blue-500 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile.link}
        </a>
      </div>
    </div>
  );
};

export default ProfileUserDetailChange;