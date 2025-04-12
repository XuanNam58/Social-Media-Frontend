import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  BsBookmark,
  BsBookmarkFill,
  BsEmojiSmile,
  BsThreeDots,
} from "react-icons/bs";
import CommentCard from "./CommentCard";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiSendPlaneLine } from "react-icons/ri";
import "./CommentModal.css";

const CommentModal = ({
  post,
  onClose,
  isOpen,
  isSaved,
  isPostLiked,
  handlePostLike,
  handleSavePost,
}) => {
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [comments, setComments] = useState([]);
  const [userPost, setUserPost] = useState({});

  // lay ngay hien tai
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  //lay token
  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    } else {
      console.error("User chưa đăng nhập!");
      return null;
    }
  };

  const handleSendComment = async () => {
    if (newComment.trim() === "") return;
  
    const commentData = {
      postID: post.id,
      username: username,
      content: newComment,
      date: getCurrentDate(),
    };

    console.log(commentData);
  
    try {
      const response = await fetch("http://localhost:9000/api/comments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
  
      const savedComment = await response.json();
      setComments([...comments, savedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Lỗi khi gửi comment:", error.message);
    }
  };
  

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  //lay thong tin user
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/users/req", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const dataUser = await response.json();
        setUsername(dataUser.username);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };
    fetchUser();
  }, []);

  // Reset khi post mới
  useEffect(() => {
    setComments([]);
    setPage(1);
    setNewComment("");
  }, [post.id]);

//lay userPost
  useEffect(() => {
    const findUsePost = async () => {
      const token = await getToken();
      if (!post.username|| !token) return; // ⚠️ tránh gọi khi chưa có username
  
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/get-user-by-username/${post.username}`,{
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
  }, [post.id]); // 

  //lay comment
  useEffect(() => {
    if (!username) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:9000/comments?postID=${post.id}&page=${page}&size=5`
        );
        const data = await response.json();
        setComments((prev) => [...prev, ...data]);
      } catch (error) {
        console.error("Lỗi khi lấy comments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [page, post.id, username]);

  return (
    <Modal size={"4xl"} onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <div className="flex h-[75vh]">
            {/* Bên trái */}
            <div className="w-[45%] flex flex-col justify-center">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src={userPost.profilePicURL}
                  alt=""
                />
                <div className="pl-2">
                  <p className="font-semibold text-sm">{post.username}</p>
                  <p className="font-thin text-sm">{post.date}</p>
                </div>
              </div>

              <div className="px-2 pb-2">
                <p>
                  <span className="font-semibold">{post.content}</span>
                </p>
              </div>

              {post.picture && (
                <img className="max-h-full w-full" src={post.picture} alt="" />
              )}
              {post.video && (
                <video className="w-full" controls>
                  <source src={post.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="flex justify-between items-center w-full py-4">
                <div className="flex items-center space-x-2">
                  {isPostLiked ? (
                    <AiFillHeart
                      className="text-2xl text-red-500 hover:opacity-50 cursor-pointer"
                      onClick={handlePostLike}
                    />
                  ) : (
                    <AiOutlineHeart
                      className="text-2xl hover:opacity-50 cursor-pointer"
                      onClick={handlePostLike}
                    />
                  )}
                  <FaRegComment className="text-xl hover:opacity-50 cursor-pointer" />
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
            </div>

            {/* Bên phải */}
            <div className="w-[55%] pl-10 relative">
              <div className="flex justify-between items-center py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
                <BsThreeDots className="text-xl text-gray-500 cursor-pointer hover:opacity-60 transition-opacity duration-200" />
              </div>

              <div className="comment mt-2 max-h-[380px] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <CommentCard key={index} comment={comment} />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No comments yet.</p>
                )}
              </div>

              {comments.length > 0 && !loading && (
                <div className="text-center mt-5">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Load More
                  </button>
                </div>
              )}

            

              <div className="absolute bottom-0 w-[90%]">
                <div className="flex items-center w-full">
                  <input
                    className="commentInput border rounded-full px-3 py-1 w-full text-sm"
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <button
                    onClick={handleSendComment}
                    className="ml-2 text-blue-500 hover:opacity-70"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CommentModal;
