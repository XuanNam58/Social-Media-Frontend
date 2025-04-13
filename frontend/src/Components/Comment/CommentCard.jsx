import React, { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import axios from "axios";
import { getAuth } from "firebase/auth";

const CommentCard = ({ comment }) => {
  const { id, username, content, date } = comment;

  const [isCommentLike, setIsCommentLike] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [userComment, setUserComment] = useState({});
   const [userIndex, setUserIndex] = useState({});

   //Lay token
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

     //lay userPost
       useEffect(() => {
         const findUsePost = async () => {
           const token = await getToken();
           if (!username || !token) return; // ⚠️ tránh gọi khi chưa có username
       
           try {
             const response = await fetch(
               `http://localhost:8080/api/users/get-user-by-username/${username}`,{
                 method: "GET",
                 headers: {
                   "Authorization": `Bearer ${token}`,
                   "Content-Type": "application/json",
                 },
               },
               
             );
             const data = await response.json();
             
               setUserComment(data);
           
           } catch (err) {
             console.error("Error find userPost", err);
           }
         };
       
         findUsePost();
       }, [id]); // 

       const [replyUsers, setReplyUsers] = useState({});

      useEffect(() => {
        const fetchReplyUsers = async () => {
          const token = await getToken();
          if (!token || replies.length === 0) return;

          const newUserMap = { ...replyUsers };

          await Promise.all(
            replies.map(async (reply) => {
              if (!newUserMap[reply.username]) {
                try {
                  const res = await fetch(
                    `http://localhost:8080/api/users/get-user-by-username/${reply.username}`,
                    {
                      headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const data = await res.json();
                  newUserMap[reply.username] = data;
                } catch (err) {
                  console.error("Lỗi fetch reply user:", err);
                }
              }
            })
          );

          setReplyUsers(newUserMap);
        };

        fetchReplyUsers();
      }, [replies]);


  const handleLikeComment = () => {
    setIsCommentLike(!isCommentLike);
    setLikeCount(isCommentLike ? likeCount - 1 : likeCount + 1);
  };

  const handleToggleReplies = async () => {
    setShowReplies(!showReplies);
    if (!showReplies && replies.length === 0) {
      await loadMoreReplies(1); // Lần đầu load page 1
    }
  };

  const loadMoreReplies = async (requestedPage = page) => {
    if (loadingReplies || !hasMoreReplies) return;

    setLoadingReplies(true);
    try {
      const response = await axios.get("http://localhost:9000/replyComments", {
        method: "GET",
        params: {
          commentID: id,
          page: requestedPage,
          size: 5,
        },
      });

      const newReplies = response.data; // response trả về mảng replies
      if (newReplies.length < 5) {
        setHasMoreReplies(false);
      }

      setReplies((prev) => [...prev, ...newReplies]);
      setPage(requestedPage + 1); // Tăng page lên cho lần sau
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleSendReply = async () => {
    if (replyText.trim() === "") return;
  
    const replyData = {
      commentID: id,
      username: userIndex.username,
      content: replyText,
    };
  
    try {
      const response = await axios.post("http://localhost:9000/api/comments/reply", replyData);
      const newReply = response.data;
      setReplies([...replies, newReply]);
      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };
  

  return (
    <div className="border-b pb-3">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
          <img
            className="w-9 h-9 rounded-full"
            src= {userComment.profilePicURL}
            alt=""
          />
          <div className="ml-3">
            <p>
              <span className="font-semibold">{username}</span>
              <span className="ml-2">{content}</span>
            </p>
            <div className="flex items-center space-x-3 text-xs opacity-60 pt-2">
              <span>{date}</span>
              <span>{likeCount} likes</span>
              <button onClick={handleToggleReplies} className="text-blue-500">
                Reply
              </button>
            </div>
          </div>
        </div>
        {isCommentLike ? (
          <AiFillHeart
            onClick={handleLikeComment}
            className="text-xs hover:opacity-50 cursor-pointer text-red-500"
          />
        ) : (
          <AiOutlineHeart
            onClick={handleLikeComment}
            className="text-xs hover:opacity-50 cursor-pointer"
          />
        )}
      </div>

      {showReplies && (
      <div className="pl-5 mt-2">

        {/* Hiển thị nếu KHÔNG có reply */}
        {replies.length === 0 && !loadingReplies && (
          <p className="text-sm text-gray-500 italic mb-2">Not reply yet.</p>
        )}

        {/* Danh sách reply nếu có */}
        {replies.map((reply) => {
          const replyUser = replyUsers[reply.username];

          return (
            <div key={reply.id} className="flex items-center space-x-3 mb-2">
              <img
                className="w-7 h-7 rounded-full"
                src={
                  replyUser?.profilePicURL ||
                  "https://cdn.pixabay.com/photo/2018/02/17/21/56/cute-3161014_1280.jpg"
                }
                alt=""
              />
              <div>
                <p>
                  <span className="font-semibold">{reply.username}</span>
                  <span className="ml-2">{reply.content}</span>
                </p>
              </div>
            </div>
          );
        })}


        {/* Load more button */}
        {hasMoreReplies && replies.length > 0 && (
          <button
            onClick={() => loadMoreReplies(page)}
            className="text-blue-500 text-sm hover:underline mt-1"
          >
            {loadingReplies ? "Loading..." : "Load more replies"}
          </button>
        )}

        {/* Input reply */}
        <div className="flex items-center mt-3">
          <input
            type="text"
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Reply this comment..."
            className="border rounded-full px-3 py-1 w-full text-sm"
          />
          <button
            onClick={handleSendReply}
            className="ml-2 text-blue-500 hover:opacity-70"
          >
            Send
          </button>
        </div>
      </div>
    )}

    </div>
  );
};

export default CommentCard;
