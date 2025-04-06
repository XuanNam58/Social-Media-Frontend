import React, { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const CommentCard = ({comment}) => {
  const { username, content, date } = comment;

  const [isCommentLike, setIsCommentLike] = useState(false);
  const [likeCount, setLikeCount] = useState(23); // Số likes ban đầu
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([
    { id: 1, username: "user1", text: "Mình cũng nghĩ vậy!"},
    { id: 2, username: "user2", text: "Chuẩn luôn!"},
  ]);
  const [replyText, setReplyText] = useState("");

  const handleLikeComment = () => {
    setIsCommentLike(!isCommentLike);
    setLikeCount(isCommentLike ? likeCount - 1 : likeCount + 1);
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleSendReply = () => {
    if (replyText.trim() === "") return;
    setReplies([...replies, { id: replies.length + 1, username: "You", text: replyText  }]);
    setReplyText("");
  };

  return (
    <div className="border-b pb-3">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <img
            className="w-9 h-9 rounded-full"
            src="https://cdn.pixabay.com/photo/2018/02/17/21/56/cute-3161014_1280.jpg"
            alt=""
          />
          <div className="ml-3">
            <p>
              <span className="font-semibold">{username}</span>
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
        {isCommentLike ? (
          <AiFillHeart
            onClick={handleLikeComment}
            className="text-xs hover:opacity-50 cursor-pointer text-red-500"
          />
        ) : (
          <AiOutlineHeart
            onClick={handleLikeComment}
            className="text-xs hover:opacity-50 cursor-pointer"
          />
        )}
      </div>

      {showReplies && (
        <div className="pl-5 mt-2">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-center space-x-3 mb-2">
              <img
                className="w-7 h-7 rounded-full"
                src="https://cdn.pixabay.com/photo/2018/02/17/21/56/cute-3161014_1280.jpg"
                alt=""
              />
              <div>
                <p>
                  <span className="font-semibold">{reply.username}</span>
                  <span className="ml-2">{reply.text}</span>
                </p>
              </div>
            </div>
          ))}

          {/* Ô nhập reply */}
          <div className="flex items-center mt-3">
            <input
              type="text"
              value={replyText}
              onChange={handleReplyChange}
              placeholder="Reply this comment..."
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
