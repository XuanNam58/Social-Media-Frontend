import React from "react";
import { FaPhotoVideo, FaSmile } from "react-icons/fa";
import PostModal from "./PostModal";

const PostBox = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-black">
      {/* Ô nhập trạng thái */}
      <div className="flex items-center space-x-3">
        <img
          className="w-10 h-10 rounded-full"
          src="https://cdn.pixabay.com/photo/2025/01/09/16/59/forest-9322222_1280.jpg" // Ảnh đại diện
          alt="Avatar"
        />
        <input
          type="text"
          placeholder="What's on your mind?"
          className="flex-1 bg-gray-100 p-2 rounded-full outline-none text-black placeholder-gray-500"
        />
      </div>

      {/* Dòng chia cách */}
      <hr className="my-3 border-gray-300" />

      {/* Các nút chức năng */}
      <div className="flex justify-around">
        <PostModal />

        <button className="flex items-center space-x-2 text-green-500 hover:bg-gray-200 p-2 rounded-lg">
          <FaPhotoVideo />
          <span>Image/video</span>
        </button>

        <button className="flex items-center space-x-2 text-yellow-400 hover:bg-gray-200 p-2 rounded-lg">
          <FaSmile />
          <span>Emotion/Activity</span>
        </button>
      </div>
    </div>
  );
};

export default PostBox;
