"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriendListAction,
  getMutualFollowIdsAction,
} from "../../Redux/User/Action";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function FriendPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const friendsPerPage = 5;

  // Get token
  const auth = getAuth();
  const [token, setToken] = useState(null);
  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }
    };
    getToken();
  }, [auth.currentUser]);

  const dispatch = useDispatch();
  const { user } = useSelector((store) => store);
  const navigate = useNavigate();

  const handleUserClick = (username) => {
    navigate(`/${username}`);
  };

  useEffect(() => {
    if (token && user.reqUser?.followers && user.reqUser?.following) {
      dispatch(
        getMutualFollowIdsAction({
          followers: user.reqUser.followers,
          following: user.reqUser.following,
          token: token,
        })
      );
    }

    console.log("user.reqUser?.followers", user.reqUser?.followers);
  }, [user.reqUser?.followers, user.reqUser?.following, token, dispatch]);

  useEffect(() => {
    if (user?.mutualFollowIds.length > 0) {
      dispatch(
        getFriendListAction({
          userIds: user.mutualFollowIds,
          type: "friend-list",
          token: token,
        })
      );
    }
  }, [user?.mutualFollowIds, token, dispatch]);

  const friends = user?.findUsersByIds || [];
  console.log("FRIEND", friends);
  // Filter friends based on search query
  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredFriends.length / friendsPerPage);
  const indexOfLastFriend = currentPage * friendsPerPage;
  const indexOfFirstFriend = indexOfLastFriend - friendsPerPage;
  const currentFriends = filteredFriends.slice(
    indexOfFirstFriend,
    indexOfLastFriend
  );

  // Pagination handlers
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>

      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search friends..."
            className="pl-10 w-full py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Friends list */}
      <div className="bg-white rounded-lg shadow">
        {currentFriends.length > 0 ? (
          currentFriends.map((friend) => (
            <div
              key={friend.uid}
              className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
              onClick={() => handleUserClick(friend.username)}
            >
              <div className="flex items-center">
                <img
                  src={friend.profilePicURL || "/placeholder.svg"}
                  alt={friend.fullName}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-medium text-gray-900">{friend.username}</p>
                  <p className="text-sm text-gray-500">{friend.fullName}</p>
                </div>
              </div>
              <button className="px-5 py-1.5 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors">
                Follow
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">No friends found</div>
        )}
      </div>

      {/* Pagination */}
      {filteredFriends.length > friendsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center px-4 py-2 rounded ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center px-4 py-2 rounded ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-50"
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
