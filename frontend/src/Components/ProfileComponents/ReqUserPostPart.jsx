import React, { useEffect, useState, useRef } from "react";
import PostCard from "../../Components/Post/PostCard";
import { getAuth } from "firebase/auth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ReqUserPostPart = ({user}) => {
  const {username} = user;
  const [posts, setPosts] = useState([]);
  const [userIndex, setUserIndex] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    } else {
      console.error("User chưa đăng nhập!");
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:9191/api/auth/users/req", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const dataUser = await response.json();
        setUserIndex(dataUser.result);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };
    fetchUser();
  }, []);

  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!userIndex.username) return;

    const fetchPosts = async () => {
      const token = await getToken();
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:9191/api/posts/getPosts-user?username=${user.username}&page=${page}&size=5`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setPosts((prevPosts) => [...prevPosts, ...data.result]);
        setHasMore(data.result.length > 0);
      } catch (error) {
        console.error("Lỗi khi lấy bài post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userIndex.username, page]);

  // Scroll ở window
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100 && !loading && hasMore) {
        setLoading(true);
        setTimeout(() => {
          setPage((prevPage) => prevPage + 1);
          setLoading(false);
        }, 1000);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore]);

  const handleRemoveFromList = (postId) => {
  setPosts((prev) => prev.filter((p) => p.postId !== postId));
};


  return (
    <div>
      <div className="mt-10 flex w-[100%] justify-center">
        <div className="w-[80%] px-10">
          <div className="space-y-10 w-full mt-10">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <PostCard key={index} post={post} userLook={user.username} onPostDeleted={handleRemoveFromList} />
              ))
            ) : (
              <p className="text-center text-gray-500">Đang tải bài viết...</p>
            )}

            {loading && (
              <div className="text-center mt-5">
                <p className="text-gray-500">Đang tải thêm bài viết...</p>
              </div>
            )}

            {!hasMore && !loading && (
              <div className="text-center mt-5">
                <p className="text-gray-500">Bạn đã xem hết bài viết!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReqUserPostPart;
