import { FaUsers } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";

const friends = [
  { name: "Thanh Thủy", avatar: "https://cdn.pixabay.com/photo/2018/11/08/23/52/man-3803551_1280.jpg" },
  { name: "Quang Tran", avatar: "https://cdn.pixabay.com/photo/2017/01/27/16/09/girl-2013447_1280.jpg" },
  { name: "Nghia Nguyen", avatar: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_960_720.png" },
];

const communityChats = [
  { name: "Wuthering Waves - Sóng thần", description: "Wuthering Waves Việt Nam (Official)" },
  { name: "Hội IT Việt Nam", description: "Code khó vờ lờ" },
  { name: "Hội Fan anh Cơ", description: "T1 vô địch!" },

];

const groupChats = [
  { name: "Lập trình hướng dịch vụ", icon: <FaUsers className="text-gray-500" /> },
  { name: "Super Idol <3", icon: <FaUsers className="text-gray-500" /> },
  { name: "Lu và những người có bồ", icon: <FaUsers className="text-gray-500" /> },
  { name: "3 chàng ngự lâmm", icon: <FaUsers className="text-gray-500" /> },
  { name: "Dế mèn phiêu lưu ký", icon: <FaUsers className="text-gray-500" /> },
];

export default function ChatSidebar() {
  return (
    <div className="w-80 p-4 bg-white text-black rounded-lg shadow-lg">
      <div className="mb-4">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center space-x-3 mb-2">
            <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
            <span>{friend.name}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-2">
        <h3 className="text-gray-600 text-sm mb-2">Community chats</h3>
        {communityChats.map((chat, index) => (
          <div key={index} className="flex items-center space-x-3 mb-2">
            <FiMessageSquare className="text-gray-500" />
            <div>
              <span className="text-black">{chat.name}</span>
              <p className="text-gray-600 text-xs">{chat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-2">
        <h3 className="text-gray-600 text-sm mb-2">Group chats</h3>
        {groupChats.map((chat, index) => (
          <div key={index} className="flex items-center space-x-3 mb-2">
            {typeof chat.icon === "string" ? <span>{chat.icon}</span> : chat.icon}
            <span>{chat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
