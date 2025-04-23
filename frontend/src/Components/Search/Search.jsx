import React, { useEffect, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { searchUserAction } from "../../Redux/User/Action";
import useShowToast from "../../Redux/useShowToast";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Search = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    {
      id: 1,
      username: "aadsfa",
      fullName: "namm",
    },
    {
      id: 2,
      username: "asdfaf",
      fullName: "luan",
    },
    {
      id: 3,
      username: "asdfasdf",
      fullName: "thien",
    },
    {
      id: 4,
      username: "werqwe",
      fullName: "asdf",
    },
  ]);
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

  const { user } = useSelector((store) => store);
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
    setRecentSearches([]);
  };

  const handleRemoveFromRecent = (id) => {
    setRecentSearches(recentSearches.filter((search) => search.id !== id));
  };

  const handleUserClick = (username) => {
    navigate(`/${username}`);
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
        {searchQuery && user.searchUser && user.searchUser.length > 0 && (
          <div className="space-y-3">
            {user.searchUser.map((user) => (
              <div
                key={user.username}
                onClick={() => handleUserClick(user.username)}
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
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  onClick={() => handleUserClick(search.username)}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="font-semibold">{search.username}</div>
                      <div className="text-gray-500">{search.fullName}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromRecent(search.id);
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
