import React, { useEffect, useRef, useState } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { menu } from "./SidebarConfig";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileAction } from "../../Redux/User/Action";
import { logoutAction } from "../../Redux/Auth/Action";
import Search from "../Search/Search";
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

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState();
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useSelector((store) => store);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = getAuth();
  const token = auth.currentUser.getIdToken();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
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

  useEffect(() => {
    if (token) dispatch(getUserProfileAction(token));
  }, [token]);

  const handleTabClick = (title) => {
    if (title === "Search") {
      setShowSearch(!showSearch);
      return;
    }

    if (showSearch) {
      setShowSearch(false);
    }
    setActiveTab(title);
    if (title === "Profile") {
      navigate(`/${user.reqUser?.username}`);
    } else if (title === "Home") {
      navigate("/");
    } else if (title === "Friend") {
      navigate("/friend");
    }
  };

  // Close search when clicking outside
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

  const handleLogout = () => async () => {
    // localStorage.removeItem("token");
    await signOut(auth);
    dispatch(logoutAction());
    window.location.href = "/auth";
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
  };

  return (
    <>
      {showSearch && <Search onClose={handleCloseSearch} />}
      <div
        className={`sticky top-0 h-[100vh] ${
          showSearch ? "w-20" : "w-[250px]"
        } transition-all duration-200`}
      >
        <div
          className={`flex flex-col justify-between h-full ${
            showSearch ? "px-2" : "px-10"
          }`}
        >
          <div>
            <div className="pt-10">
              <img
                className="w-24"
                src="/Images/logo.png"
                // src="https://i.imgur.com/zqpwkLQ.png"
                alt=""
              />
            </div>

            <div className="mt-10">
              {menu.map((item) => (
                <div
                  key={item.title}
                  id={item.title === "Search" ? "search-icon" : ""}
                  onClick={() => handleTabClick(item.title)}
                  className="flex items-center mb-5 cursor-pointer text-lg"
                >
                  <div className="w-12 flex justify-center">
                    {activeTab === item.title ? item.activeIcon : item.icon}
                  </div>
                  {!showSearch && (
                    <p
                      className={`${
                        activeTab === item.title ? "font-bold" : "font-semibold"
                      }`}
                    >
                      {item.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!showSearch && (
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

          {/* Dropdown menu */}
          {isOpen && !showSearch && (
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
