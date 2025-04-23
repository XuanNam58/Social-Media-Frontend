import { AiFillHome, AiOutlineHome, AiOutlineSearch, AiFillCompass, AiOutlineCompass, AiFillHeart, AiOutlineHeart, AiFillMessage, AiOutlineMessage, AiOutlinePlusSquare, AiFillPlusSquare } from "react-icons/ai";
import { RiVideoFill, RiVideoLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { Search } from "lucide-react";

export const menu = [
  {
    title: "Home",
    icon: <AiOutlineHome className="text-2xl mr-5" />,
    activeIcon: <AiFillHome className="text-2xl mr-5" />,
  },
  {
    title: "Search",
    icon: <AiOutlineSearch className="text-2xl mr-5" />,
    activeIcon: <Search className="text-2xl mr-5" />,
  },
  {
    title: "Explore",
    icon: <AiOutlineCompass className="text-2xl mr-5" />,
    activeIcon: <AiFillCompass className="text-2xl mr-5" />,
  },
  {
    title: "Reels",
    icon: <RiVideoLine className="text-2xl mr-5" />,
    activeIcon: <RiVideoFill className="text-2xl mr-5" />,
  },
  {
    title: "Messages",
    icon: <AiOutlineMessage className="text-2xl mr-5" />,
    activeIcon: <AiFillMessage className="text-2xl mr-5" />,
  },
  {
    title: "Notifications",
    icon: <AiOutlineHeart className="text-2xl mr-5" />,
    activeIcon: <AiFillHeart className="text-2xl mr-5" />,
  },
  {
    title: "Create",
    icon: <AiOutlinePlusSquare className="text-2xl mr-5" />,
    activeIcon: <AiFillPlusSquare className="text-2xl mr-5" />,
  },
  {
    title: "Profile",
    icon: <CgProfile className="text-2xl mr-5" />,
    activeIcon: <CgProfile className="text-2xl mr-5" />,
  },
]; 