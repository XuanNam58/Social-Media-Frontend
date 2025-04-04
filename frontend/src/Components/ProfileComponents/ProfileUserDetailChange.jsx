import React from "react";

const profile = {
  username: "ganknow",
  posts: 501,
  followers: "2,866",
  following: 268,
  name: "Gank",
  description:
    "Gank is a content membership platform that helps content creators accept donations, manage memberships and sell merch, for free.",
  link: "https://linktree.com/ganknow",
  avatar: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png",
  highlights: [
    { title: "Giveaway", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "Reviews", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "Dota All-Star", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "MasterRame...", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "Gamepals", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "All-Star Valo", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
    { title: "Valorant", image: "https://cdn.pixabay.com/photo/2024/02/15/16/57/cat-8575768_1280.png" },
  ],
};

export default function InstagramProfile() {
  return (
    
    <div className="w-full p-4 border mt-12 rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <img
          src={profile.avatar}
          alt="Avatar"
          className="w-20 h-20 rounded-full border"
        />
        <div>
            <h2 className="text-xl font-bold">{profile.username}</h2>
            <div className="flex space-x-2 mt-1">
                <button className="bg-blue-500 text-white px-4 py-1 rounded-lg">
                Follow
                </button>
                <button className="border px-4 py-1 rounded-lg">Message</button>
            </div>
            
            <div className="flex justify-center mt-4 text-gray-700 space-x-6 text-sm font-medium">
                <span>{profile.posts} posts</span>
                <span>{profile.followers} followers</span>
                <span>{profile.following} following</span>
            </div>
        </div>
      </div>

      

      {/* Bio */}
      <div className="mt-3">
        <h3 className="font-bold">{profile.name}</h3>
        <p className="text-gray-700 text-sm">{profile.description}</p>
        <a
          href={profile.link}
          className="text-blue-500 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile.link}
        </a>
      </div>

      {/* Highlights */}
      <div className="flex space-x-4 mt-4 overflow-x-auto">
        {profile.highlights.map((highlight, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={highlight.image}
              alt={highlight.title}
              className="w-16 h-16 rounded-full border"
            />
            <span className="text-xs mt-1">{highlight.title}</span>
          </div>
        ))}
      </div>
    </div>
    
  );
}
