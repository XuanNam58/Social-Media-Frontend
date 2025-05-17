import React, { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import axios from "axios";
import { getAuth } from "firebase/auth";

const CommentCard = ({ comment }) => {
  const { commentId, username, content, date, fullName, profilePicURL } = comment;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(23); // TODO: Replace with real like count
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});

  // Lấy token Firebase
  const getToken = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User chưa đăng nhập!");
      return null;
    }
    return await currentUser.getIdToken();
  };

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/auth/users/req", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setUser(data.result);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleToggleReplies = () => {
    setShowReplies((prev) => !prev);
    if (!showReplies && replies.length === 0) {
      loadReplies(1);
    }
  };

  const loadReplies = async (requestedPage) => {
    if (loading || !hasMore) return;

    const token = await getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:9000/replyComments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          commentID: commentId,
          page: requestedPage,
          size: 5,
        },
      });

      const newReplies = res.data;
      setReplies((prev) => [...prev, ...newReplies]);
      setPage(requestedPage + 1);
      if (newReplies.length < 5) setHasMore(false);
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const newReply = {
      commentID: commentId,
      username: user.username,
      content: replyText,
    };

    try {
      const res = await axios.post("http://localhost:9000/api/comments/reply", newReply);
      setReplies((prev) => [...prev, res.data]);
      setReplyText("");
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  return (
    <div className="border-b pb-3">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <img src={profilePicURL} alt="" className="w-9 h-9 rounded-full" />
          <div className="ml-3">
            <p>
              <span className="font-semibold">{fullName}</span>
              <span className="ml-2">{content}</span>
            </p>
            <div className="flex items-center space-x-3 text-xs opacity-60 pt-2">
              <span>{date}</span>
              <span>{likeCount} likes</span>
              <button onClick={handleToggleReplies} className="text-blue-500">
                Reply
              </button>
            </div>
          </div>
        </div>
        {isLiked ? (
          <AiFillHeart
            onClick={handleToggleLike}
            className="text-xs text-red-500 hover:opacity-50 cursor-pointer"
          />
        ) : (
          <AiOutlineHeart
            onClick={handleToggleLike}
            className="text-xs hover:opacity-50 cursor-pointer"
          />
        )}
      </div>

      {showReplies && (
        <div className="pl-5 mt-2">
          {replies.length === 0 && !loading && (
            <p className="text-sm text-gray-500 italic mb-2">No replies yet.</p>
          )}

          {replies.map((reply) => (
            <div key={reply.id} className="flex items-center space-x-3 mb-2">
              <img
                src={reply.profilePicURL}
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <div>
                <p>
                  <span className="font-semibold">{reply.fullName}</span>
                  <span className="ml-2">{reply.content}</span>
                </p>
              </div>
            </div>
          ))}

          {hasMore && replies.length > 0 && (
            <button
              onClick={() => loadReplies(page)}
              className="text-blue-500 text-sm hover:underline mt-1"
            >
              {loading ? "Loading..." : "Load more replies"}
            </button>
          )}

          <div className="flex items-center mt-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to this comment..."
              className="border rounded-full px-3 py-1 w-full text-sm"
            />
            <button
              onClick={handleSendReply}
              className="ml-2 text-blue-500 hover:opacity-70"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
