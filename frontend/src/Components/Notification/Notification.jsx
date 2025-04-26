import React, { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { searchUserAction } from "../../Redux/User/Action";
import useShowToast from "../../Redux/useShowToast";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Notification = ({ onClose }) => {
    const [userIndex, setUserIndex] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store);
  const navigate = useNavigate();

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const handleRemoveFromRecent = (id) => {
    setRecentSearches(recentSearches.filter((search) => search.id !== id));
  };

  const handleUserClick = (username) => {
    navigate(`/${username}`);
    onClose(); // Đóng search panel sau khi click
  };
  //format timestamp
  const formatRelativeTime = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };
  
  // lay token
  const getToken = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      } else {
        console.error("User chưa đăng nhập!");
        return null;
      }
    };
  
    

    useEffect(() => {
        const fetchData = async () => {
          const token = await getToken();
          if (!token) return;
      
          try {
            setLoading(true);
      
            const fetchUser = async () => {
              const res = await fetch("http://localhost:8080/api/users/req", {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              const dataUser = await res.json();
              setUserIndex(dataUser);
              return dataUser; // return để dùng luôn
            };
      
            const fetchNotifications = async (username) => {
              const res = await fetch(`http://localhost:9001/api/notifications/${username}`, {
                method: "GET",
                // headers: {
                //   "Authorization": `Bearer ${token}`,
                // },
              });
              const data = await res.json();
              setRecentSearches(data);
            };
      
            // Đầu tiên gọi fetchUser để lấy username, đồng thời chạy fetchNotification
            const userPromise = fetchUser(); // user promise
            const userData = await userPromise; // đợi user trả về
      
            if (userData?.username) {
              fetchNotifications(userData.username); // gọi fetch notification
            }
      
          } catch (error) {
            console.error("Lỗi khi fetch data:", error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchData();
      }, []);
      
      
      








  return (
    <div
      id="notification-panel"
      className="fixed left-20 top-0 h-screen w-[400px] bg-white border-r border-gray-300 z-50"
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-2xl font-semibold">Notifications</div>
        </div>
       
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Recent</div>
              <button
                onClick={handleClearAll}
                className="text-blue-500 text-sm font-semibold"
              >
                Clear all
              </button>
            </div>

            {/* Recent Search List */}
            <div className="space-y-3">
  {loading ? (
    // Animation loading
    <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    // List notifications
    recentSearches.map((noti) => (
      <div
        key={noti.id}
        onClick={() => handleUserClick(noti.username)}
        className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div>
            <div className="font-semibold">{noti.content}</div>
            <div className="text-gray-500">{formatRelativeTime(noti.timestamp)}</div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromRecent(noti.id);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
    ))
  )}
</div>

          </div>
      </div>
    </div>
  );
};

export default Notification;
