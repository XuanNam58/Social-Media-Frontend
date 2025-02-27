import React, { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const CommentCard = () => {
  const [isCommentLike, setIsCommentLike] = useState();
  const handleLikeComment=()=>{
    setIsCommentLike(!isCommentLike);
  }

  return (
    <div>
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center">
          <div>
            <img
              className="w-9 h-9 rounded-full"
              src="https://cdn.pixabay.com/photo/2018/02/17/21/56/cute-3161014_1280.jpg"
              alt=""
            />
          </div>

          <div className="ml-3">
            <p>
              <span className="font-semibold">username</span>
              <span className="ml-2">quá đỉnh</span>
            </p>

            <div className="flex items-center space-x-3 text-xs opacity-60 pt-2">
              <span>3 min ago</span>
              <span>23 likes</span>
            </div>
          </div>
        </div>

        {isCommentLike ? (
          <AiFillHeart onClick={handleLikeComment} className="text-xs hover:opacity-50 cursor-pointer text-red-500" />
        ) : (
          <AiOutlineHeart onClick={handleLikeComment} className="text-xs hover:opacity-50 cursor-pointer" />
        )}
      </div>
    </div>
  );
};

export default CommentCard;
