import React from "react";
import PostCard from "../../Components/Post/PostCard";
import PostBox from "../../Components/Box/PostBox";
import ContactRight from "../../Components/ContactRight/ContactRight";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");

  const getToken = async () => {
    const auth = getAuth(); // Lấy instance của Firebase Auth
    const user = auth.currentUser; // Kiểm tra user hiện tại

    if (user) {
        const token = await user.getIdToken(); // Lấy ID Token của user
        console.log("Token:", token);
        return token;
    } else {
        console.error("User chưa đăng nhập!");
        return null;
    }
};


    useEffect(() => {
      // Gọi API lấy thông tin user
      const fetchUser = async () => {
        const token = await getToken();
        if (!token) return;
        try {
          const idToken = ""
          const response = await fetch("http://localhost:8080/api/users/req", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Gửi token trong header
                "Content-Type": "application/json"
            }
        }); // API lấy user
          const dataUser = await response.json();
          setUsername(dataUser.username);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
        }
      };

      fetchUser();
    }, []); // Chạy 1 lần khi component mount

    useEffect(() => {
      if (username === "") return; // Chỉ fetch nếu user đã có giá trị

      const fetchPosts = async () => {
        try {
          const response = await fetch(`http://localhost:9000/posts?username=${username}`); // Dùng template string
          const data = await response.json();
          setPosts(data);
        } catch (error) {
          console.error("Lỗi khi lấy bài post:", error);
        }
      };

      fetchPosts();
    }, [username]); // Chạy lại khi `user` thay đổi


  return (
    <div>
      <div className="mt-10 flex w-[100%] justify-center">
        <div className="w-[56%] px-10 ">
          {/* <div className="storyDiv flex space-x-2 border p-4 rounded-md">
            {[1, 1, 1].map((item) => (
              <StoryCircle />
            ))}
          </div> */}
          <div className="space-y-10 w-full mt-10 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <PostBox/>        
            {posts.length > 0 ? (
              posts.map((post, index) => <PostCard key={index} post={post} />)
            ) : (
              <p className="text-center text-gray-500">Đang tải bài viết...</p>
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
