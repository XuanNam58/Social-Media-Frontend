import React, { useState } from "react";
import { AiOutlineTable, AiOutlineUser } from "react-icons/ai";
import { BiBookmark } from "react-icons/bi";
import { RiVideoAddLine } from "react-icons/ri";
import ReqUserPostCard from "./ReqUserPostCard";

const ReqUserPostPart = () => {
  const [activeTab, setActiveTab] = useState();

  const tabs = [
    {
      tab: "Post",
      icon: <AiOutlineTable />,
      activeTab: "",
    },

    {
      tab: "Reels",
      icon: <RiVideoAddLine />,
    },

    {
      tab: "Saved",
      icon: <BiBookmark />,
    },
    {
      tab: "Tagged",
      icon: <AiOutlineUser />,
    },
  ];
  return (
    <div>
      <div className="flex space-x-8 border-t relative mt-4 text-gray-600 text-xs font-medium">
        {tabs.map((item) => (
          <div 
            onClick={() => setActiveTab(item.tab)} 
            className={`${activeTab === item.tab ? "border-t-2 border-black text-black" : "opacity-60 hover:opacity-100"} flex items-center cursor-pointer py-2 px-2 transition-all duration-200`}
          >
            <p>{item.icon}</p>
            <p className="ml-1">{item.tab}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex flex-wrap">
            {[1,1,1,1,1].map((item) => <ReqUserPostCard/>)}
        </div>
      </div>
    </div>
  );
};

export default ReqUserPostPart;
