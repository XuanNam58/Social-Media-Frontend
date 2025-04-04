import { useState } from "react";
import { Smile, Image, Users, MoreHorizontal } from "lucide-react";

export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaURL, setMediaURL] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMedia(file);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    if (media) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", media);

      try {
        const response = await fetch("http://localhost:8080/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setMediaURL(data.url);
        setUploading(false);
        submitPost(data.url);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploading(false);
      }
    } else {
      submitPost("");
    }
  };

  const submitPost = (uploadedMediaURL) => {
    console.log("New post:", { content, mediaURL: uploadedMediaURL });
    setIsOpen(false);
    setContent("");
    setMedia(null);
    setMediaURL("");
  };

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
                src="https://cdn.pixabay.com/photo/2025/01/09/16/59/forest-9322222_1280.jpg"
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
            {media && (
              <div className="mt-3">
                {media.type.startsWith("image") ? (
                  <img src={URL.createObjectURL(media)} alt="Preview" className="w-full rounded" />
                ) : (
                  <video controls className="w-full rounded">
                    <source src={URL.createObjectURL(media)} type={media.type} />
                  </video>
                )}
              </div>
            )}
            <div className="flex items-center space-x-4 mt-3">
              <label className="text-green-500 cursor-pointer">
                <Image />
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button className="text-blue-500"><Users /></button>
              <button className="text-yellow-500"><Smile /></button>
              <button><MoreHorizontal /></button>
            </div>
            <button 
              onClick={handlePost}
              className={`w-full mt-3 px-4 py-2 rounded ${content.trim() ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} 
              disabled={!content.trim() || uploading}>
              {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
