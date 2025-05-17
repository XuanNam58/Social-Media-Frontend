import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
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
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import CommentCard from "./CommentCard";
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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userIndex, setUserIndex] = useState({});
  const [userPost, setUserPost] = useState({});
  const stompClientRef = useRef(null);

  const getCurrentDate = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()}`;
  };

  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    const commentData = {
      postID: post.postId,
      username: userIndex.username,
      content: newComment,
      date: getCurrentDate(),
      fullName: userIndex.fullName,
      profilePicURL: userIndex.profilePicURL,
    };

    try {
      const res = await fetch("http://localhost:9000/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });

      const saved = await res.json();
      setComments((prev) => [...prev, saved]);
      setNewComment("");
    } catch (err) {
      console.error("Lỗi khi gửi comment:", err);
    }
  };

  const fetchCurrentUser = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/auth/users/req", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserIndex(data.result);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin user:", err);
    }
  };

  const fetchUserPost = async () => {
    const token = await getToken();
    if (!token || !post.username) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/get-user-by-username/${post.username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setUserPost(data.result);
    } catch (err) {
      console.error("Lỗi khi lấy userPost:", err);
    }
  };

  const fetchComments = async () => {
    const token = await getToken();
    if (!token || !post.username || !userIndex.username) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:9000/comments?postID=${post.postId}&page=${page}&size=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setComments((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Lỗi khi lấy comments:", err);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket setup
  useEffect(() => {
    const socket = new SockJS("http://localhost:9000/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe("/topic/comments", (msg) => {
          const newComment = JSON.parse(msg.body);
          setComments((prev) => [newComment, ...prev]);
        });
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (post.id) {
      setComments([]);
      setPage(1);
      setNewComment("");
      fetchUserPost();
    }
  }, [post.id]);

  useEffect(() => {
    fetchComments();
  }, [page, userIndex.username, post.id]);

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <div className="flex h-[75vh]">
            {/* Left */}
            <div className="w-[45%] flex flex-col">
              <div className="flex items-center pt-3">
                <img
                  className="h-12 w-12 rounded-full"
                  src={post.profilePicURL}
                  alt=""
                />
                <div className="pl-2">
                  <p className="font-semibold text-sm">{post.fullName}</p>
                  <p className="font-thin text-sm">{post.date}</p>
                </div>
              </div>
              <div className="pt-3 pb-3 px-2">
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
                      className="text-2xl text-red-500 cursor-pointer hover:opacity-50"
                      onClick={handlePostLike}
                    />
                  ) : (
                    <AiOutlineHeart
                      className="text-2xl cursor-pointer hover:opacity-50"
                      onClick={handlePostLike}
                    />
                  )}
                  <FaRegComment className="text-xl cursor-pointer hover:opacity-50" />
                  <RiSendPlaneLine className="text-xl cursor-pointer hover:opacity-50" />
                </div>
                {isSaved ? (
                  <BsBookmarkFill
                    className="text-xl cursor-pointer hover:opacity-50"
                    onClick={handleSavePost}
                  />
                ) : (
                  <BsBookmark
                    className="text-xl cursor-pointer hover:opacity-50"
                    onClick={handleSavePost}
                  />
                )}
              </div>
            </div>

            {/* Right */}
            <div className="w-[55%] pl-10 relative">
              <div className="flex justify-between items-center py-4 border-b border-gray-300">
                <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
                <BsThreeDots className="text-xl text-gray-500 cursor-pointer hover:opacity-60" />
              </div>

              <div className="comment mt-2 max-h-[380px] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500">Loading comments...</p>
                ) : comments.length ? (
                  comments.map((c, idx) => <CommentCard key={idx} comment={c} />)
                ) : (
                  <p className="text-center text-gray-500">No comments yet.</p>
                )}
              </div>

              {comments.length > 0 && !loading && (
                <div className="text-center mt-5">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Load More
                  </button>
                </div>
              )}

              <div className="absolute bottom-0 w-[90%]">
                <div className="flex items-center">
                  <input
                    className="commentInput border rounded-full px-3 py-1 w-full text-sm"
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
