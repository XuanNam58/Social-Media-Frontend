import { useState } from "react";
import { Smile, Image, Users, MoreHorizontal } from "lucide-react";

export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center space-x-2 text-green-500 hover:bg-gray-200 p-2 rounded-lg"
>
        Create
      </button>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-96">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">New Post</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="flex items-center space-x-3 mt-3">
            <img
                className="w-10 h-10 rounded-full"
                src="https://cdn.pixabay.com/photo/2025/01/09/16/59/forest-9322222_1280.jpg" // Ảnh đại diện
                alt="Avatar"
            />
              <div>
                <p className="font-semibold">Luân Lê</p>
                <button className="text-gray-500 text-xs">public</button>
              </div>
            </div>
            <textarea
              className="w-full mt-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's in your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className="flex items-center space-x-4 mt-3">
              <button className="text-green-500"><Image /></button>
              <button className="text-blue-500"><Users /></button>
              <button className="text-yellow-500"><Smile /></button>
              <button><MoreHorizontal /></button>
            </div>
            <button 
              className={`w-full mt-3 px-4 py-2 rounded ${content.trim() ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} 
              disabled={!content.trim()}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
