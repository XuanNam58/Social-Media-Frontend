import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsThreeDots,
} from "react-icons/bs";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import CommentModal from "../Comment/CommentModal";
import { useDisclosure } from "@chakra-ui/react";
import "./PostCard.css";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


const PostCard = ({ post,userLook,onPostDeleted }) => {
  const { postId, username, date, picture, content, video, numberOfLike, fullName, profilePicURL } = post;
  const [userIndex, setUserIndex] = useState({});
  const [showDropDown, setShowDropDown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(numberOfLike);
  const [isSaved, setIsSaved] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const dropdownRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const maxLength = 150; // số ký tự muốn hiển thị trước khi rút gọn
  const isTruncated = post.content.length > maxLength;
  const truncatedContent = isTruncated
    ? post.content.slice(0, maxLength) + "..."
    : post.content;


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropDown(false);
      }

      if (isEditModalOpen && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setIsEditModalOpen(false);
      }

      if (showConfirmModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowConfirmModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditModalOpen, showConfirmModal]);



  const handleOpenEditModal = () => {
    setEditedContent(content); // Load lại content hiện tại
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    } else {
      console.error("User chưa đăng nhập!");
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:9191/api/auth/users/req", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const dataUser = await response.json();
        setUserIndex(dataUser.result);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setIsPostLiked(false);
    const checkIfLiked = async () => {
      const token = await getToken();
      if (!userIndex.username) return;

      try {
        const response = await fetch(
          `http://localhost:9191/api/likes/check?username=${userIndex.username}&postID=${postId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.result.liked) {
          setIsPostLiked(true);
        }
      } catch (err) {
        console.error("Error checking like status", err);
      }
    };
    checkIfLiked();
  }, [userIndex.username, postId]);

  const handlePostLike = async () => {
    const token = await getToken();
    const like = {
      postID: postId,
      username: userIndex.username,
      tempContent: content,
      fullName: userIndex.fullName
    };

    try {
      const response = await fetch("http://localhost:9191/api/likes/likes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(like),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi gọi API like");
      }

      setIsPostLiked(!isPostLiked);
      setLikeCount(prev => isPostLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Lỗi khi xử lý like:", error.message);
    }
  };

  const handleSavePost = () => {
    setIsSaved(!isSaved);
  };

  const handleClick = () => {
    setShowDropDown(!showDropDown);
  };

  const handleOpenCommentModal = () => {
    onOpen();
  };

  const handleEdit = () => {
  setShowDropDown(false);
  // xử lý logic edit ở đây
};

const handleDelete = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:9191/api/posts/deletePost/${post.postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.code === 1000) {
        if (onPostDeleted) onPostDeleted(post.postId);
      } else {
        console.error("Xoá thất bại:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi xoá:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleSaveEdit = async () => {
    const token = await getToken();
    try {
      const response = await fetch(`http://localhost:9191/api/posts/updatePost/${postId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editedContent }),
      });

      const data = await response.json();
      if (response.ok && data.code === 1000) {
        post.content = editedContent; // Cập nhật local
        handleCloseEditModal();
      } else {
        console.error("Cập nhật thất bại:", data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
    }
  };

  return (
    <div>
      <div className="border rounded-[30px] w-full">
        <div className="flex justify-between items-center w-full py-4 px-5">
          <div className="flex items-center">
            <img
              className="h-12 w-12 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md"
              src={profilePicURL}
              alt=""
              onClick={() => navigate(`/${username}`)}
            />

            <div className="pl-2">
              <p className="font-semibold text-sm">{fullName}</p>
              <p className="font-thin text-sm">{date}</p>
            </div>
          </div>
          <div className="dropdown">
            <BsThreeDots
              className={`dots ${userIndex.username === userLook ? 'cursor-pointer' : 'cursor-default text-gray-400'}`}
              onClick={() => {
                if (userIndex.username === userLook) {
                  handleClick();
                }
              }}
            />
            <div ref={dropdownRef} className="relative inline-block text-left">
            {showDropDown && (
              <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <p
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer"
                    onClick={() => {
                      setShowDropDown(false);      
                      handleOpenEditModal();       
                    }}
                  >
                    <FiEdit className="mr-2" /> Edit
                  </p>
                  <p
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 cursor-pointer"
                    onClick={() => {
                      setShowDropDown(false);      
                      setShowConfirmModal(true);   
                    }}
                  >
                    <FiTrash className="mr-2" /> Delete
                  </p>
                </div>
              </div>
            )}
      {isEditModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div
          ref={editModalRef}
          className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Post</h2>
          <div className="flex items-center">
            <img
              className="h-12 w-12 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md"
              src={profilePicURL}
              alt=""
              onClick={() => navigate(`/${username}`)}
            />
            <div className="pl-2">
              <p className="font-semibold text-sm">{fullName}</p>
              <p className="font-thin text-sm">{date}</p>
            </div>
          </div>

          {/* Bọc nội dung bằng div có scroll nếu dài */}
          <div className="overflow-y-auto mt-4 mb-4 pr-1" style={{ maxHeight: '55vh' }}>
            <textarea
              className="w-full border border-gray-300 rounded p-2 resize-none mb-4"
              style={{ height: "60px" }}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />

            {picture && (
              <div className="w-full pb-4">
                <img className="w-full rounded-lg" src={picture} alt="" />
              </div>
            )}

            {video && (
              <div className="w-full pb-4">
                <video className="w-full rounded-lg" controls>
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCloseEditModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}




      {/* Confirm delete modal */}
          {showConfirmModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div
          ref={deleteModalRef}
          className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Confirm delete
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

            </div>


          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="font-semibold text-sm whitespace-pre-line">
            {isExpanded ? content : truncatedContent}
            {isTruncated && !isExpanded && (
              <span
                onClick={() => setIsExpanded(true)}
                className="font-semibold text-sm text-bray-300 cursor-pointer ml-2"
              >
                read more
              </span>
            )}
          </p>
        </div>


        {picture && (
          <div className="w-full">
            <img className="w-full" src={picture} alt="" />
          </div>
        )}

        {video && (
          <div className="w-full">
            <video className="w-full" controls>
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="flex justify-between items-center w-full px-5 py-4">
          <div className="flex items-center space-x-2">
            <div className="relative group">
              {isPostLiked ? (
                <AiFillHeart
                  className="text-2xl hover:opacity-50 cursor-pointer text-red-500"
                  onClick={handlePostLike}
                />
              ) : (
                <AiOutlineHeart
                  className="text-2xl hover:opacity-50 cursor-pointer"
                  onClick={handlePostLike}
                />
              )}
              <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 
                bg-white text-pink-600 text-sm font-medium rounded-full px-3 py-1 
                shadow-md border border-pink-200 opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 z-10 flex items-center space-x-1">
                <span>💖{likeCount} likes</span>
                
              </div>

            </div>

            <FaRegComment
              onClick={handleOpenCommentModal}
              className="text-xl hover:opacity-50 cursor-pointer"
            />
            <RiSendPlaneLine className="text-xl hover:opacity-50 cursor-pointer" />
          </div>

          <div className="cursor-pointer">
            {isSaved ? (
              <BsBookmarkFill
                onClick={handleSavePost}
                className="text-xl hover:opacity-50 cursor-pointer"
              />
            ) : (
              <BsBookmark
                onClick={handleSavePost}
                className="text-xl hover:opacity-50 cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="border border-t w-full">
          <div className="flex w-full items-center px-5">
            <BsEmojiSmile />
            <input
              className="commentInput"
              type="text"
              placeholder="Add a comment..."
            />
          </div>
        </div>
      </div>

      <CommentModal
        post={post}
        handlePostLike={handlePostLike}
        onClose={onClose}
        isOpen={isOpen}
        handleSavePost={handleSavePost}
        isPostLiked={isPostLiked}
        isSaved={isSaved}
      />
    </div>
    
  );
};



export default PostCard;
