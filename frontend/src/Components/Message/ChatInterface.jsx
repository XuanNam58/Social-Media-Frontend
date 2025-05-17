"use client"
import { db } from "../../firebase/messageFirebase";
import { collection, onSnapshot, where, orderBy, query, doc, getDoc, limit, writeBatch, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useRef, useEffect } from "react"
import { Search, Edit, Phone, Video, MoreHorizontal, ImageIcon, Smile, Send, Mic } from "lucide-react"
import axios from "axios"

dayjs.extend(relativeTime);

// Utility function to replace cn
const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

export default function ChatInterface() {
  const [activeContact, setActiveContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [conversationMessages, setConversationMessages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [token, setToken] = useState("");


  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch contacts & first conversation
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) return;
        setToken(storedToken);

        const { data: contactsData } = await axios.get(
          "http://localhost:4000/social/api/message/get-all-contact",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setContacts(contactsData);

        const { data: userData } = await axios.get(
          "http://localhost:4000/social/api/message/get-user",
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCurrentUser(userData.userId);

        if (contactsData.length > 0) {
          const first = contactsData[0];
          setActiveContact(first);

          const { data: initialMessages } = await axios.post(
            "http://localhost:4000/social/api/message/get-details-messages",
            {
              conversationId: first.conversationId,
            },
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          setConversationMessages((prev) => ({
            ...prev,
            [first.conversationId]: initialMessages,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Real-time messages for active conversation
  useEffect(() => {
    const conversationId = activeContact?.conversationId;
    if (!conversationId) return;

    console.log("converId ",conversationId);

    //Gọi backend API để lấy dữ liệu ban đầu
    if (!conversationMessages[conversationId]) {
    console.log("converMess ",conversationMessages[conversationId]);

      const fetchInitialMessages = async () => {
        try {
          const { data: initialMessages } = await axios.post(
            "http://localhost:4000/social/api/message/get-details-messages",
            {
              conversationId: conversationId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setConversationMessages((prev) => ({
            ...prev,
            [conversationId]: initialMessages,
          }));
        } catch (error) {
          console.error("Lỗi khi fetch messages từ backend:", error);
        }
      };

      fetchInitialMessages();
    }

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || null,
        };
      });

      setConversationMessages((prev) => {
        const existingMessages = prev[conversationId] || [];
        const isSame =
          existingMessages.length === newMessages.length &&
          existingMessages.every((msg, idx) => msg.id === newMessages[idx].id);

        if (isSame) return prev;

        return {
          ...prev,
          [conversationId]: newMessages,
        };
      });
    });

    return () => unsub();
  }, [activeContact?.conversationId]);



  //Conversation real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "conversations"),
      (snapshot) => {
        const updatedContacts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            lastUpdate: data.lastUpdate?.toDate?.() || null,
          };
        });
        setContacts(updatedContacts);

      },
      (error) => {
        console.error("Real-time conversation update error:", error);
      }
    );

    return () => unsub();
  }, []);


  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [conversationMessages, activeContact]);

  // Send message
  const handleSendMessage = async () => {
    const hasText = messageInput.trim() !== "";
    const hasImage = selectedFiles.length > 0;

    if (!hasText && !hasImage) return;

    setMessageInput("");
    setSelectedFiles([]);

    const formData = new FormData();
    activeContact.listUser.forEach((userId) => {
      formData.append("list-user", userId);
    });

    formData.append("context", messageInput);

    selectedFiles.forEach((file) => {
      formData.append("listMediaFile", file);
    });

    try {
      await axios.post("http://localhost:4000/social/api/message/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });


    } catch (error) {
      console.error("Gửi tin nhắn thất bại:", error);
    }
  };

  //handle enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //handleImg
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  //handle click conversation
  const handleConversationClick = async (contact) => {
    setActiveContact(contact);

    const conversationId = contact.conversationId;

    try {
      // Cập nhật tin nhắn đã đọc
      const unreadCount = await getUnreadCount(conversationId, currentUser);
      if (unreadCount > 0) {
        await updateReadByStatus(conversationId, unreadCount);
      }

    } catch (err) {
      console.error("Error when updating read status:", err);
    }
  };



  const getUnreadCount = async (conversationId, userId) => {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnapshot = await getDoc(conversationRef);

    if (conversationSnapshot.exists()) {
      const unreadCount = conversationSnapshot.data().unreadCount[userId] || 0;
      return unreadCount;
    }
    return 0;
  };


  const updateReadByStatus = async (conversationId, unreadCount) => {
    if (unreadCount <= 0) return; // Không cần cập nhật

    await axios.post(
            "http://localhost:4000/social/api/message/update-unread",
            {
              conversationId: conversationId,
              unreadCount: unreadCount,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
  };




  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Danh sách liên hệ */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Đoạn chat</h1>
          <button className="text-gray-500 hover:text-gray-700">
            <Edit className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 border-none text-gray-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts
            // Sắp xếp theo thời gian cập nhật mới nhất
            .sort((a, b) => {
              // Đảm bảo lastUpdate là đối tượng Date hợp lệ
              const timeA = a.lastUpdate instanceof Date ? a.lastUpdate : new Date(a.lastUpdate);
              const timeB = b.lastUpdate instanceof Date ? b.lastUpdate : new Date(b.lastUpdate);
              // Sắp xếp giảm dần (mới nhất lên đầu)
              return timeB - timeA;
            })
            .map((contact) => {
            // Lấy số tin nhắn chưa đọc (nếu có) từ contact
            const unreadCount = contact.unreadCount?.[currentUser] || 0;
            const hasUnread = unreadCount > 0;
            
            return (
              <div
                key={contact.id}
                className={classNames(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                  activeContact?.id === contact.id && "bg-gray-100"
                )}
                onClick={() => handleConversationClick(contact)}
              >
                <div className="relative">
                  <img
                    src={contact.avatar || "https://via.placeholder.com/40"}
                    alt={contact.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className={classNames(
                      "text-sm truncate",
                      hasUnread ? "font-bold" : "font-medium"
                    )}>
                      {contact.name}
                    </p>
                    <span className="text-xs text-gray-500">{dayjs(contact.lastUpdate).fromNow()}</span>
                  </div>
                  <p className={classNames(
                    "text-xs truncate",
                    hasUnread ? "font-bold text-gray-800" : "font-normal text-gray-500"
                  )}>
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phần chính - Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {activeContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={activeContact.avatar || "https://via.placeholder.com/40"}
                  alt={activeContact.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{activeContact.name}</p>
                  <p className="text-xs text-gray-500">Đang hoạt động</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <Video className="h-5 w-5 text-gray-500" />
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(conversationMessages[activeContact.conversationId] || []).map((msg, idx) => {
                const isUser = msg.sender === currentUser;
                return (
                  <div
                    key={msg.id || idx}
                    className={classNames("flex flex-col", isUser ? "items-end" : "items-start")}
                  >
                    {!isUser && (
                      <p className="text-xs text-gray-500 mb-1">{activeContact.name}</p>
                    )}

                    <div className="flex items-end max-w-[50%]">
                      {!isUser && (
                        <img
                          src={activeContact.avatar || "https://via.placeholder.com/40"}
                          alt={activeContact.name}
                          className="h-8 w-8 rounded-full mr-2 self-end"
                        />
                      )}
                      <div
                        className={classNames(
                          "break-words whitespace-pre-wrap rounded-2xl p-3",
                          isUser ? "bg-gray-300 text-black" : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {msg.media && (
                          <img
                            src={msg.media}
                            className="max-w-full rounded-lg"
                          />
                        )}
                        {msg.context?.trim() && (
                          <p>{msg.context}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {dayjs(msg.timestamp).fromNow()}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {/* Preview ảnh */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {selectedFiles.map((file, index) => {
                  const imageUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`preview-${index}`}
                        className="h-35 w-35 object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                          URL.revokeObjectURL(imageUrl); // giải phóng bộ nhớ
                        }}
                        className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ô nhập và nút gửi */}
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="text-gray-500 hover:text-gray-700 h-5 w-5" />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </button>

              <input
                type="text"
                placeholder="Aa"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-gray-800"
              />

              <button className="text-gray-500 hover:text-gray-700">
                <Smile className="h-5 w-5" />
              </button>

              {(messageInput.trim() || selectedFiles.length > 0) ? (
                <button onClick={handleSendMessage} className="text-blue-500 hover:text-blue-700">
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <button className="text-gray-500 hover:text-gray-700">
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </div>

          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}



