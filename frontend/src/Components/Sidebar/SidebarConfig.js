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

export const menu = [
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
  // {
  //   title: "Explore",
  //   icon: <AiOutlineCompass className="text-2xl mr-5" />,
  //   activeIcon: <AiFillCompass className="text-2xl mr-5" />,
  // },
  // {
  //   title: "Reels",
  //   icon: <RiVideoLine className="text-2xl mr-5" />,
  //   activeIcon: <RiVideoFill className="text-2xl mr-5" />,
  // },
  {
    title: "Message",
    icon: <AiOutlineMessage className="text-2xl mr-5" />,
    activeIcon: <AiFillMessage className="text-2xl mr-5" />,
  },
  {
    title: "Notifications",
    icon: <AiOutlineHeart className="text-2xl mr-5" />,
    activeIcon: <AiFillHeart className="text-2xl mr-5" />,
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
