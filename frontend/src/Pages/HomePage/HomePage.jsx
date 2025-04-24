import React, { useEffect, useState, useRef } from "react";
import PostCard from "../../Components/Post/PostCard";
import PostBox from "../../Components/Box/PostBox";
import ContactRight from "../../Components/ContactRight/ContactRight";
import { getAuth } from "firebase/auth";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const HomePage = () => {
  const [posts, setPosts] = useState([]); // Danh sách bài viết
  const [userIndex, setUserIndex] = useState(""); // Tên người dùng
  const [page, setPage] = useState(1); // Trang hiện tại (ban đầu là trang 1)
  const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API

  
  
  
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
    // Lấy thông tin user khi component mount
    const fetchUser = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/users/req", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const dataUser = await response.json();
        setUserIndex(dataUser);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };
    fetchUser();
  }, []); // Chạy khi component mount

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
//websocket thong bao
useEffect(() => {
  if (!userIndex || !userIndex.username) return;

  const socket = new SockJS("http://localhost:9001/ws");
  const stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log("🔔 Connected to Notification WebSocket");

      // Subscribe để nhận thông báo riêng của user
      stompClient.subscribe(`/topic/notifications/${userIndex.username}`, (message) => {
        const notification = JSON.parse(message.body);
        console.log("📩 New notification:", notification.content);
        alert(`📢 Bạn có thông báo mới: ${notification.content}`);
        // Bạn có thể lưu vào state nếu muốn hiển thị trong UI
      });
    },
  });

  stompClient.activate();

  return () => {
    stompClient.deactivate();
  };
}, [userIndex]);


  useEffect(() => {
    // Lấy bài viết khi username thay đổi hoặc khi trang thay đổi
    if (userIndex.username === "") return;

    const fetchPosts = async () => {
      const token = await getToken();
      if (!token) return;
      setLoading(true); // Set loading true khi gọi API
      try {
        const response = await fetch(
          `http://localhost:9000/posts?page=${page}&size=5`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,         
            },
      });
        const data = await response.json();
        setPosts((prevPosts) => [...prevPosts, ...data]); // Thêm bài viết mới vào danh sách cũ
      } catch (error) {
        console.error("Lỗi khi lấy bài post:", error);
      } finally {
        setLoading(false); // Set loading false sau khi hoàn thành API
      }
    };

    fetchPosts();
  }, [userIndex.username, page]); // Chạy khi `username` hoặc `page` thay đổi

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1); // Tăng trang mỗi khi ấn "Load More"
  };

  return (
    <div>
      <div className="mt-10 flex w-[100%] justify-center">
        <div className="w-[56%] px-10">
          <div className="space-y-10 w-full mt-10 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <PostBox userIndex={userIndex}/>
            {posts.length > 0 ? (
              posts.map((post, index) => <PostCard key={index} post={post} usernameIndex ={userIndex.username}/>)
            ) : (
              <p className="text-center text-gray-500">Đang tải bài viết...</p>
            )}

            {/* Hiển thị nút Load More nếu có bài viết */}
            {posts.length > 0 && !loading && (
              <div className="text-center mt-5">
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Load More
                </button>
              </div>
            )}

            {/* Hiển thị loading khi đang tải thêm bài viết */}
            {loading && (
              <div className="text-center mt-5">
                <p className="text-gray-500">Đang tải thêm bài viết...</p>
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
