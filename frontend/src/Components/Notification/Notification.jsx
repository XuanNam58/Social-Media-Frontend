import React, { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Notification = ({ onClose }) => {
  const [userIndex, setUserIndex] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store);
  const navigate = useNavigate();

  const formatRelativeTime = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    console.error("User chưa đăng nhập!");
    return null;
  };

  const fetchUserInfo = async (token) => {
    const res = await fetch("http://localhost:8080/api/auth/users/req", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setUserIndex(data.result);
    return data.result;
  };

  const fetchNotifications = async (username, token) => {
    const res = await fetch(`http://localhost:9001/api/notifications/${username}`,{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      try {
        const user = await fetchUserInfo(token);
        if (user?.username) {
          await fetchNotifications(user.username, token);
        }
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClearAll = () => setNotifications([]);
  const handleRemove = (id) => setNotifications(notifications.filter(n => n.id !== id));
  const handleNotificationClick = () => onClose();

  return (
    <div className="fixed left-20 top-0 h-screen w-[400px] bg-white border-r border-gray-300 z-50">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-2xl font-semibold">Notifications</div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold">Recent</div>
            <button onClick={handleClearAll} className="text-blue-500 text-sm font-semibold">
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              notifications.map((noti,index) => (
                <div
                  key={index}
                  onClick={handleNotificationClick}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                >
                   <div className="flex items-center space-x-3">
                      <img
                        src={noti.profilePicURL}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    <div>
                      <div className="font-semibold">{noti.content}</div>
                      <div className="text-gray-500">{formatRelativeTime(noti.timestamp)}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
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
