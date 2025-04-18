import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsThreeDots,
} from "react-icons/bs";
import "./PostCard.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import CommentModal from "../Comment/CommentModal";
import { useDisclosure } from "@chakra-ui/react";
  




const PostCard = ({ post }, usernameIndex) => {
  //post
  const { id, username, date, picture, content, video, numberOfLike } = post;
  const [userIndex, setUserIndex] = useState({}); // Tên người dùng
  const [showDropDown, setShowDropDown] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [userPost, setUserPost] = useState({});
  //lay token
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
  // Lấy thông tin user khi component mount
  const fetchUser = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const response = await fetch("http://localhost:8080/api/users/req", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const dataUser = await response.json();
      setUserIndex(dataUser);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
    }
  };
  fetchUser();
}, []); // Chạy khi component mount
  
const handleSavePost = () => {
    setIsSaved(!isSaved);
  };

  // kiem tra liked 
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!userIndex.username) return; // ⚠️ tránh gọi khi chưa có username
  
      try {
        const response = await fetch(
          `http://localhost:9000/api/likes/check?username=${userIndex.username}&postID=${id}`
        );
        const data = await response.json();
        if (data.liked) {
          setIsPostLiked(true);
        }
      } catch (err) {
        console.error("Error checking like status", err);
      }
    };
  
    checkIfLiked();
  }, [userIndex.username, id]); // 
  
  //lay userPost
  useEffect(() => {
    const findUsePost = async () => {
      const token = await getToken();
      if (!username || !token) return; // ⚠️ tránh gọi khi chưa có username
  
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/get-user-by-username/${username}`,{
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
          
        );
        const data = await response.json();
        
          setUserPost(data);
      
      } catch (err) {
        console.error("Error find userPost", err);
      }
    };
  
    findUsePost();
  }, [id]); // 

  //like
  const handlePostLike = async () => {
    const like = {
      postID: id,
      username: userIndex.username,
    };
  
    try {
      const response = await fetch("http://localhost:9000/api/likes/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(like),
      });
  
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API like");
      }
  
      // Nếu request thành công → đổi trạng thái liked
      setIsPostLiked(!isPostLiked);
    } catch (error) {
      console.error("Lỗi khi xử lý like:", error.message);
    }
  };
  
  const handleClick = () => {
    setShowDropDown(!showDropDown);
  };

  const handleOpenCommentModal = () => {
    onOpen();
  };
  return (
    <div>
      <div className="border rounded-[30px] w-full">
        <div className="flex justify-between items-center w-full py-4 px-5">
          <div className="flex items-center">
            <img
              className="h-12 w-12 rounded-full"
              src= {userPost.profilePicURL}
              alt=""
            />
            <div className="pl-2">
              <p className="font-semibold text-sm">{username}</p>
              <p className="font-thin text-sm">{date}</p>
            </div>
          </div>

          <div className="dropdown">
            <BsThreeDots className="dots" onClick={handleClick} />
            <div className="dropdown-content">
              {showDropDown && (
                <p className="bg-black text-white py-1 px-4 rounded-md cursor-pointer">
                  Delete
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <p>
            <span className="font-semibold">{content}</span>
          </p>
        </div>
             
        {picture && (
        <div className="w-full">
          <img
            className="w-full"
            src={picture}
            alt=""
          />

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
