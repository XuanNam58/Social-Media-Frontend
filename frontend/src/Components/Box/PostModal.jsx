
import { Client, Storage } from "appwrite";
import { Smile, Image, Users, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const client = new Client();
client.setEndpoint("https://cloud.appwrite.io/v1").setProject("67f02a3c00396aab7f01"); // Thay bằng Project ID của bạn
const storage = new Storage(client);

export default function PostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaURL, setMediaURL] = useState("");

  //get token
  const [posts, setPosts] = useState([]);
    const [userIndex, setUserIndex] = useState({});
  
    const getToken = async () => {
      const auth = getAuth(); // Lấy instance của Firebase Auth
      const user = auth.currentUser; // Kiểm tra user hiện tại
  
      if (user) {
          const token = await user.getIdToken(); // Lấy ID Token của user
          console.log("Token:", token);
          return token;
      } else {
          console.error("User chưa đăng nhập!");
          return null;
      }
  };
  
  
      useEffect(() => {
        // Gọi API lấy thông tin user
        const fetchUser = async () => {
          const token = await getToken();
          if (!token) return;
          try {
            const idToken = ""
            const response = await fetch("http://localhost:8080/api/users/req", {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`, // Gửi token trong header
                  "Content-Type": "application/json"
              }
          }); // API lấy user
            const dataUser = await response.json();
            setUserIndex(dataUser);
          } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
          }
        };
  
        fetchUser();
      }, []); // Chạy 1 lần khi component mount


  // upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMedia(file);
    }
  };

  //lay ngay hien tai
  function getCurrentDate() {
    const today = new Date();
    
    const day = String(today.getDate()).padStart(2, '0');  // Lấy ngày, đảm bảo 2 chữ số
    const month = String(today.getMonth() + 1).padStart(2, '0');  // Lấy tháng (tháng bắt đầu từ 0, nên cộng 1)
    const year = today.getFullYear();  // Lấy năm
    
    return `${day}-${month}-${year}`;
  }

  const handlePost = async () => {
    if (!content.trim()) return;
  
    if (media) {
      setUploading(true);
  
      try {
        // Upload file lên Appwrite Storage
        const response = await storage.createFile("67f02a57000c66380420", "unique()", media);
        const fileID = response.$id;
  
        // Lấy URL của file đã upload
        const fileURL = storage.getFileView("67f02a57000c66380420", fileID);
        console.log(fileID);
  
        setUploading(false);
        submitPost(fileURL, media.type); // Truyền thêm media.type để xác định loại file
      } catch (error) {
        console.error("Upload failed:", error);
        setUploading(false);
      }
    } else {
      submitPost(null, null);
    }
  };
  

  const submitPost = async (uploadedMediaURL, mediaType) => {
    const newPost = {
      username: userIndex.username,
      content,
      date: getCurrentDate(),
      fullName: userIndex.fullName,
      profilePicURL: userIndex.profilePicURL,
    };
  
    // Chỉ thêm `picture` hoặc `video` nếu có file upload
    if (uploadedMediaURL) {
      if (mediaType.startsWith("image")) {
        newPost.picture = uploadedMediaURL;
      } else if (mediaType.startsWith("video")) {
        newPost.video = uploadedMediaURL;
      }
    }
  
    console.log(newPost);
  
    try {
      // Gửi POST request đến backend
      const response = await fetch("http://localhost:9000/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPost) // Chuyển đổi newPost thành JSON
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log("Post created successfully:", responseData);
      } else {
        console.error("Error creating post:", response.statusText);
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
    onClick={() => setIsOpen(false)} // Đóng modal khi click ra ngoài
  >
    <div 
      className="bg-white p-4 rounded-lg w-96 relative"
      onClick={(e) => e.stopPropagation()} // Ngăn chặn click lan truyền xuống video
    >
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-lg font-semibold">New Post</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-500">✕</button>
      </div>
      <div className="flex items-center space-x-3 mt-3">
        <img
          className="w-10 h-10 rounded-full"
          src={userIndex.profilePicURL}
          alt="Avatar"
        />
        <div>
          <p className="font-semibold">{userIndex.fullName}</p>
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
