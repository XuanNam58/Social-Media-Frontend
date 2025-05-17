import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Client, Storage } from "appwrite";
import { Smile, Image, Users, MoreHorizontal } from "lucide-react";

// Appwrite config
const client = new Client();
client.setEndpoint("https://cloud.appwrite.io/v1").setProject("67f02a3c00396aab7f01");
const storage = new Storage(client);

export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userIndex, setUserIndex] = useState({});

  // Get Firebase Token
  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("User chưa đăng nhập!");
      return null;
    }
    return await user.getIdToken();
  };

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/auth/users/req", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const dataUser = await response.json();
        setUserIndex(dataUser.result);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUser();
  }, []);

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(file);
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    if (media) {
      setUploading(true);
      try {
        const res = await storage.createFile("67f02a57000c66380420", "unique()", media);
        const fileID = res.$id;
        const fileURL = storage.getFileView("67f02a57000c66380420", fileID);

        setUploading(false);
        submitPost(fileURL, media.type);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploading(false);
      }
    } else {
      submitPost(null, null);
    }
  };

  const submitPost = async (mediaURL, mediaType) => {
    const newPost = {
      username: userIndex.username,
      fullName: userIndex.fullName,
      profilePicURL: userIndex.profilePicURL,
      content,
      date: getCurrentDate(),
    };

    if (mediaURL) {
      if (mediaType.startsWith("image")) newPost.picture = mediaURL;
      else if (mediaType.startsWith("video")) newPost.video = mediaURL;
    }

    try {
      const res = await fetch("http://localhost:9000/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Post created successfully:", data);
      } else {
        console.error("Error creating post:", res.statusText);
      }
    } catch (error) {
      console.error("Request failed:", error.message);
    }

    setIsOpen(false);
    setContent("");
    setMedia(null);
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">New Post</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 mt-3 pt-2">
              <img
                className="w-10 h-10 rounded-full"
                src={userIndex.profilePicURL}
                alt="Avatar"
              />
              <div>
                <p className="font-semibold">{userIndex.fullName}</p>
                <button className="text-gray-500 text-xs">Public</button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              className="w-full mt-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            {/* Media Preview */}
            {media && (
              <div className="mt-3">
                {media.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(media)}
                    alt="Preview"
                    className="w-full rounded"
                  />
                ) : (
                  <video controls className="w-full rounded">
                    <source src={URL.createObjectURL(media)} type={media.type} />
                  </video>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-4 mt-3">
              <label className="text-green-500 cursor-pointer">
                <Image />
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button className="text-blue-500">
                <Users />
              </button>
              <button className="text-yellow-500">
                <Smile />
              </button>
              <button>
                <MoreHorizontal />
              </button>
            </div>

            {/* Post button */}
            <button
              onClick={handlePost}
              disabled={!content.trim() || uploading}
              className={`w-full mt-3 px-4 py-2 rounded ${
                content.trim() && !uploading
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
