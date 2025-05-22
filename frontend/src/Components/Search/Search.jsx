import React, { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useShowToast from "../../Redux/useShowToast";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  addSearchHistoryAction,
  deleteAllSearchHistoryAction,
  deleteSearchHistoryAction,
  searchUserAction,
} from "../../Redux/Search/Action";

const Search = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  // const [recentSearch, setRecentSearch] = useState("");

  const dispatch = useDispatch();
  const showToast = useShowToast();

  // Get token
  const auth = getAuth();
  const [token, setToken] = useState(null);
  useEffect(() => {
    const getToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setToken(token);
      }
    };
    getToken();
  }, [auth.currentUser]);

  const user = useSelector((store) => store.user);
  const search = useSelector((store) => store.search);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      dispatch(
        searchUserAction({
          query: e.target.value,
          token,
          showToast,
        })
      );
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearAll = () => {
    dispatch(deleteAllSearchHistoryAction({
      searcherId: auth.currentUser.uid,
      token: token
    }))
  };

  const handleRemoveFromRecent = (targetUserId) => {
    search.recentSearch.result.filter((search) => search.uid !== targetUserId);
    dispatch(
      deleteSearchHistoryAction({
        searcherId: auth.currentUser.uid, // uid của người tìm
        targetUserId: targetUserId, // uid của người được tìm
        token: token
      })
    );

    console.log("deleteSearchHistoryAction", auth.currentUser.uid, " ", targetUserId)
  };

  const handleUserClick = (username, targetUserId) => {
    navigate(`/${username}`);
    dispatch(addSearchHistoryAction({
      searcherId: auth.currentUser.uid,
      targetUserId: targetUserId,
      token: token
    }))
    onClose(); // Đóng search panel sau khi click
  };

  return (
    <div
      id="search-panel"
      className="fixed left-20 top-0 h-screen w-[400px] bg-white border-r border-gray-300 z-50"
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-2xl font-semibold">Search</div>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-100 rounded-lg py-2 px-4 pr-10 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery &&
          search.searchUser &&
          search.searchUser.result.length > 0 && (
            <div className="space-y-3">
              {search.searchUser.result.map((user) => (
                <div
                  key={user.username}
                  onClick={() => handleUserClick(user.username, user.uid)}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full">
                      {user.profilePicURL && (
                        <img
                          src={user.profilePicURL}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{user.username}</div>
                      <div className="text-gray-500">{user.fullName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Recent Searches */}
        {!searchQuery && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold">Recent</div>
              <button
                onClick={handleClearAll}
                className="text-blue-500 text-sm font-semibold"
              >
                Clear all
              </button>
            </div>

            {/* Recent Search List */}
            <div className="space-y-3">
              {search?.recentSearch?.result.map((search) => (
                <div
                  key={search.uid}
                  onClick={() => handleUserClick(search.username, search.uid)}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full">
                      {search.profilePicURL && (
                        <img
                          src={search.profilePicURL}
                          alt={search.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{search.username}</div>
                      <div className="text-gray-500">{search.fullName}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromRecent(search.uid);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
