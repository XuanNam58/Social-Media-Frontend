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

  useEffect(() => {
    if (!userIndex || !userIndex.username) return;

    const socket = new SockJS("http://localhost:9001/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("🔔 Connected to Notification WebSocket");

        stompClient.subscribe(
          `/topic/notifications`,
          (message) => {       
            setNotificationCount((prev) => prev + 1);
          }
        );
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [userIndex]);

  return (
    <>
      {showSearch && <Search onClose={handleCloseSearch} />}
      {showNotification && <Notification onClose={handleCloseNotification} />}
      <div
        className={`sticky top-0 h-[100vh] ${
          showSearch || showNotification ? "w-20" : "w-[250px]"
        } transition-all duration-200`}
      >
        <div
          className={`flex flex-col justify-between h-full ${
            showSearch || showNotification ? "px-2" : "px-10"
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
                  <div className="w-12 flex justify-center">
                    {activeTab === item.title ? item.activeIcon : item.icon}
                  </div>
                  {!(showSearch || showNotification) && (
                    <p
                      className={`${
                        activeTab === item.title
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
                <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
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
