import React, { useEffect, useState, useRef } from "react";
import PostCard from "../../Components/Post/PostCard";
import PostBox from "../../Components/Box/PostBox";
import ContactRight from "../../Components/ContactRight/ContactRight";
import { getAuth } from "firebase/auth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [userIndex, setUserIndex] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Trạng thái xem có bài mới không
  const containerRef = useRef(null);

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
    const socket = new SockJS("http://localhost:9000/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe("/topic/posts", (message) => {
          const newPost = JSON.parse(message.body);
          setPosts((prev) => [newPost, ...prev]);
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (!userIndex.username) return;

    const fetchPosts = async () => {
      const token = await getToken();
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:9000/api/posts?page=${page}&size=5`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPosts((prevPosts) => [...prevPosts, ...data]);
        setHasMore(data.length > 0); // Kiểm tra xem có thêm bài viết không
      } catch (error) {
        console.error("Lỗi khi lấy bài post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userIndex.username, page]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop + clientHeight >= scrollHeight - 100 && !loading) {
      setLoading(true);
      setTimeout(() => {
        setPage((prevPage) => prevPage + 1);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div>
      <div className="mt-10 flex w-[100%] justify-center">
        <div className="w-[56%] px-10">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="space-y-10 w-full mt-10 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
          >
            <PostBox userIndex={userIndex} />
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <PostCard key={index} post={post} usernameIndex={userIndex.username} />
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
        <div className="w-[25%]">
          <ContactRight />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
