// SidebarConfig.js
import {
  AiFillHeart,
  AiFillHome,
  AiFillMessage,
  AiOutlineHeart,
  AiOutlineHome,
  AiOutlineMessage,
  AiOutlineSearch,
} from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { HiOutlineUsers, HiUsers } from "react-icons/hi2";
import NotificationIcon from "../../Icon/NotificationIcon";

export const menu = (notificationCount) => [
  {
    title: "Home",
    icon: <AiOutlineHome className="text-2xl mr-5" />,
    activeIcon: <AiFillHome className="text-2xl mr-5" />,
  },
  {
    title: "Search",
    icon: <AiOutlineSearch className="text-2xl mr-5" />,
    activeIcon: <AiOutlineSearch className="text-2xl mr-5" />,
  },
  {
    title: "Message",
    icon: <AiOutlineMessage className="text-2xl mr-5" />,
    activeIcon: <AiFillMessage className="text-2xl mr-5" />,
  },
  {
    title: "Notifications",
    icon: <NotificationIcon notificationCount={notificationCount} />,
    activeIcon: <NotificationIcon hasNotification={true} />,
  },
  {
    title: "Friend",
    icon: <HiOutlineUsers className="text-2xl mr-5" />,
    activeIcon: <HiUsers className="text-2xl mr-5" />,
  },
  {
    title: "Profile",
    icon: <CgProfile className="text-2xl mr-5" />,
    activeIcon: <CgProfile className="text-2xl mr-5" />,
  },
];
