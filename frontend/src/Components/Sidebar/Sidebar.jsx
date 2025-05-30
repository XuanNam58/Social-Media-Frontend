import React, { useEffect, useRef, useState } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { menu } from "./SidebarConfig";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileAction } from "../../Redux/User/Action";
import { logoutAction } from "../../Redux/Auth/Action";
import Search from "../Search/Search";
import Notification from "../Notification/Notification";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  Settings,
  BarChart2,
  Bookmark,
  Moon,
  MessageSquare,
  LogOut,
  Users,
} from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { getRecentSearchAction } from "../../Redux/Search/Action";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [token, setToken] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userIndex, setUserIndex] = useState(null);
  const [messageNotificationCount, setMessageNotificationCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const wsRef = useRef(null);

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
    if (isLoggingOut) return;
    const getToken = async () => {
      if (!isLoggingOut && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
    };
    getToken();
  }, [isLoggingOut, auth.currentUser]);

  useEffect(() => {
    if (isLoggingOut || !token || !auth.currentUser) return;
    if (token && auth.currentUser) {
      dispatch(getUserProfileAction(token));
    }
  }, [token, auth.currentUser, isLoggingOut, dispatch]);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTabClick = (title) => {
    if (title === "Search") {
      const auth = getAuth()
      dispatch(getRecentSearchAction({
        searcherId: auth.currentUser.uid,
        token: token
    }))
      setShowSearch(!showSearch);
      if (showNotification) setShowNotification(false); // Đóng notification nếu đang mở
      return;
    }
    if (title === "Notifications") {
      setShowNotification(!showNotification);
      setNotificationCount(0);
      if (showSearch) setShowSearch(false); // Đóng search nếu đang mở
      return;
    }
    if (showSearch) setShowSearch(false);
    if (showNotification) setShowNotification(false);

    setActiveTab(title);

    if (title === "Profile") {
      navigate(`/${user.reqUser?.result.username}`);
    } else if (title === "Home") {
      navigate("/");
    } else if (title === "Message") {
      navigate("/message");
    } else if (title === "Friend") {
      navigate("/friend");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchElement = document.getElementById("search-panel");
      const searchIcon = document.getElementById("search-icon");
      if (
        showSearch &&
        searchElement &&
        !searchElement.contains(event.target) &&
        !searchIcon.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setToken(null);
      dispatch(logoutAction());
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:9191/api/auth/users/req", {
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

  useEffect(() => {
    if (!userIndex || !userIndex.username) return;

    const socket = new SockJS("http://localhost:9001/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("🔔 Connected to Notification WebSocket");

        stompClient.subscribe(`/topic/notifications/${userIndex.username}`, (message) => {
          try {
            const sender = message.body; 
            console.log("sender",sender);
            console.log("index",userIndex.username)
            if (sender !== userIndex.username) {
              setNotificationCount((prev) => prev + 1);
            }
          } catch (error) {
            console.error("Lỗi khi xử lý notification message:", error);
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [userIndex]);

  //Dùng WebSocket thuần cho tin nhắn
  useEffect(() => {
    if (!token || !auth.currentUser?.uid) return;

    const client = new Client({
      webSocketFactory: () => new WebSocket("ws://localhost:4000/social/api/message/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log("Message WebSocket Debug:", str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("Đã kết nối WebSocket cho tin nhắn");
      client.subscribe("/topic/conversations", (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.type === "conversation_update") {
            setConversations((prev) => {
              const updatedConversation = {
                conversationId: data.conversationId,
                listUser: data.listUser,
                name: data.name,
                avatarUrl: data.avatarUrl,
                lastMessage: data.lastMessage,
                lastUpdate: new Date(data.lastUpdate).getTime(),
                unreadCount: data.unreadCount || {},
              };

              const existingIndex = prev.findIndex(
                (c) => c.conversationId === data.conversationId
              );
              let updatedConversations;
              if (existingIndex !== -1) {
                updatedConversations = [...prev];
                updatedConversations[existingIndex] = updatedConversation;
              } else {
                updatedConversations = [updatedConversation, ...prev];
              }

              const totalUnread = updatedConversations.reduce(
                (sum, conv) => sum + (conv.unreadCount[auth.currentUser.uid] || 0),
                0
              );
              setMessageNotificationCount(totalUnread);

              return updatedConversations.sort((a, b) => b.lastUpdate - a.lastUpdate);
            });
          }
        } catch (error) {
          console.error("Lỗi xử lý WebSocket message:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Lỗi WebSocket tin nhắn:", frame);
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket tin nhắn ngắt kết nối");
    };

    client.activate();
    wsRef.current = client;

    return () => {
      client.deactivate();
      console.log("WebSocket tin nhắn đã ngắt kết nối");
    };
  }, [token, auth.currentUser?.uid]);

  useEffect(() => {
    if (!token || !auth.currentUser?.uid) return;

    const fetchInitialConversations = async () => {
      try {
        const response = await fetch("http://localhost:4000/social/api/message/get-all-contact", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Lỗi tải hội thoại");
        const contacts = await response.json();
        setConversations(contacts);
        const totalUnread = contacts.reduce(
          (sum, conv) => sum + (conv.unreadCount?.[auth.currentUser.uid] || 0),
          0
        );
        setMessageNotificationCount(totalUnread);
      } catch (error) {
        console.error("Lỗi tải danh sách cuộc hội thoại:", error);
      }
    };

    fetchInitialConversations();
  }, [token, auth.currentUser?.uid]);

  return (
    <>
      {showSearch && <Search onClose={handleCloseSearch} />}
      {showNotification && <Notification onClose={handleCloseNotification} />}
      <div
        className={`sticky top-0 h-[100vh] ${showSearch || showNotification ? "w-20" : "w-[250px]"
          } transition-all duration-200`}
      >
        <div
          className={`flex flex-col justify-between h-full ${showSearch || showNotification ? "px-2" : "px-10"
            }`}
        >
          <div>
            <div className="pt-10">
              <img
                className="w-24"
                src="/Images/logo.png"
                alt=""
              />
            </div>

            <div className="mt-10">
              {menu(notificationCount).map((item) => (
                <div
                  key={item.title}
                  id={item.title === "Search" ? "search-icon" : ""}
                  onClick={() => handleTabClick(item.title)}
                  className="flex items-center mb-5 cursor-pointer text-lg"
                >
                  <div className="w-12 flex justify-center relative">
                    {activeTab === item.title ? item.activeIcon : item.icon}
                    {item.title === "Message" && messageNotificationCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {messageNotificationCount}
                      </span>
                    )}
                    {item.title === "Notifications" && notificationCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </div>
                  {!(showSearch || showNotification) && (
                    <p
                      className={`${activeTab === item.title
                          ? "font-bold"
                          : "font-semibold"
                        }`}
                    >
                      {item.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!(showSearch || showNotification) && (
            <div
              className="flex items-center cursor-pointer pb-10"
              onClick={toggleDropdown}
            >
              <div className="w-12 flex justify-center">
                <IoReorderThreeOutline className="text-2xl" />
              </div>
              <p className="ml-5">More</p>
            </div>
          )}

          {isOpen && !(showSearch || showNotification) && (
            <div
              ref={dropdownRef}
              className="absolute bottom-20 left-0 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 ml-5"
            >
              <div className="py-2">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                  <BarChart2 className="w-5 h-5" />
                  <span>Your activity</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                  <Bookmark className="w-5 h-5" />
                  <span>Saved</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                  <Moon className="w-5 h-5" />
                  <span>Switch appearance</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                  <MessageSquare className="w-5 h-5" />
                  <span>Report a problem</span>
                </button>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="py-2">
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                  <Users className="w-5 h-5" />
                  <span>Switch accounts</span>
                </button>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;