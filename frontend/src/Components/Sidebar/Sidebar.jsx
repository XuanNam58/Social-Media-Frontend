import React, { useEffect, useRef, useState } from "react";
import { IoReorderThreeOutline } from "react-icons/io5";
import { menu } from "./SidebarConfig";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileAction } from "../../Redux/User/Action";
import { logoutAction } from "../../Redux/Auth/Action";
import {
  Settings,
  BarChart2,
  Bookmark,
  Moon,
  MessageSquare,
  LogOut,
  Users,
} from "lucide-react";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState();
  const { user } = useSelector((store) => store);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

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
    setActiveTab(title);
    if (title === "Profile") {
      navigate(`/${user.reqUser?.username}`);
    } else if (title === "Home") {
      navigate("/");
    } else if (title === "Message") {
      navigate("/message");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logoutAction());
    navigate("/auth");
  };

  return (
    <div className="sticky top-0 h-[100vh]">
      <div className="flex flex-col justify-between h-full px-10">
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
                onClick={() => handleTabClick(item.title)}
                className="flex items-center mb-5 cursor-pointer text-lg"
              >
                {activeTab === item.title ? item.activeIcon : item.icon}
                <p
                  className={`${
                    activeTab === item.title ? "font-bold" : "font-semibold"
                  }`}
                >
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center cursor-pointer pb-10" onClick={toggleDropdown}>
          <IoReorderThreeOutline className="text-2xl" />
          <p className="ml-5">More</p>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div ref={dropdownRef} className="absolute bottom-20 left-0 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 ml-5">
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
              <button onClick={handleLogout}
               className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 text-left">
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
