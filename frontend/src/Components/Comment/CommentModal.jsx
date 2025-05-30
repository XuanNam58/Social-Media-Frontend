import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Skeleton,
  Stack,
  Button,
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
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [userIndex, setUserIndex] = useState({});
  const [userPost, setUserPost] = useState({});
  const stompClientRef = useRef(null);
  const commentContainerRef = useRef(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
  };

  const getCompactTimestamp = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${now.getFullYear()}${String(now.getHours()).padStart(
      2,
      "0"
    )}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
  };

  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  const handleSendComment = async () => {
    const token = await getToken();
    if (!newComment.trim()) return;

    const commentData = {
      commentId: userIndex.username + getCompactTimestamp(),
      postID: post.postId,
      username: userIndex.username,
      content: newComment,
      date: getCurrentDateTime(),
      fullName: userIndex.fullName,
      profilePicURL: userIndex.profilePicURL,
    };

    try {
      await fetch("http://localhost:9191/api/comments/createComment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
      setNewComment("");
    } catch (err) {
      console.error("Lỗi khi gửi comment:", err);
    }
  };

  const fetchCurrentUser = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("http://localhost:9191/api/auth/users/req", {
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
        `http://localhost:9191/api/users/get-user-by-username/${post.username}`,
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
    if (!token || !post.username || !userIndex.username || loading) return;

    const container = commentContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:9191/api/comments/getComments?postID=${post.postId}&page=${page}&size=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.result.length < 5) {
        setHasMoreComments(false);
      }

      setComments((prev) => [...prev, ...data.result]);

      // Giữ vị trí cuộn cũ
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight + container.scrollTop;
        }
      }, 0);
    } catch (err) {
      console.error("Lỗi khi lấy comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:9000/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/comments/${post.postId}`, (msg) => {
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
  }, [post.postId]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (post.postId) {
      setComments([]);
      setPage(1);
      setNewComment("");
      setHasMoreComments(true);
      fetchUserPost();
    }
  }, [post.postId]);

  useEffect(() => {
    if (userIndex.username && post.postId && hasMoreComments) {
      fetchComments();
    }
  }, [page, post.postId, userIndex.username]);

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <div className="flex h-[75vh]">
            {/* Left */}
            <div className="w-[45%] flex flex-col overflow-y-auto max-h-[70vh] pr-2">
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

              <div
                className="comment mt-2 max-h-[380px] overflow-y-auto pr-1"
                ref={commentContainerRef}
              >
                {loading && page === 1 ? (
                  <Stack spacing={4}>
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <Skeleton height="40px" width="40px" borderRadius="full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton height="12px" width="60%" />
                          <Skeleton height="12px" width="40%" />
                        </div>
                      </div>
                    ))}
                  </Stack>
                ) : comments.length ? (
                  <>
                    {comments.map((comment, idx) => (
                      <CommentCard key={idx} comment={comment} />
                    ))}
                    {hasMoreComments && (
                      <div className="text-center my-3">
                        <Button
                          onClick={() => setPage((prev) => prev + 1)}
                          isLoading={loading}
                          colorScheme="blue"
                          size="sm"
                        >
                          Load more comments
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-500">No comments yet.</p>
                )}
              </div>

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
