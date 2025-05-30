"use client";
import { useLocation } from "react-router-dom";

import { db } from "../../firebase/messageFirebase";
import {
  collection,
  onSnapshot,
  where,
  orderBy,
  query,
  doc,
  getDoc,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Edit,
  Phone,
  Video,
  MoreHorizontal,
  ImageIcon,
  Smile,
  Send,
  Mic,
} from "lucide-react";
import axios from "axios";
import { getAuth } from "firebase/auth";

dayjs.extend(relativeTime);

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const getToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return token;
  }
  return null;
};

export default function ChatInterface() {
  const { state } = useLocation();
  const [activeContact, setActiveContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [conversationMessages, setConversationMessages] = useState({});
  const [initialMessages, setInitialMessages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [firebaseToken, setToken] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [lastConversationSnapshot, setLastConversationSnapshot] = useState(null);
  const [firstMessageSnapshot, setFirstMessageSnapshot] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [targetUserInfo, setTargetUserInfo] = useState(null); // Lưu thông tin người lạ
  const { targetUser } = state || {};
  const initialTargetUserId = targetUser?.uid;

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        setToken(token);

        const { data: contactsData } = await axios.get(
          "http://localhost:4000/social/api/message/get-all-contact",
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        const userMap = {};
        contactsData.forEach((contact) => {
          contact.users?.forEach((user) => {
            if (user.id !== currentUser.userId) {
              userMap[user.id] = {
                fullName: user.fullName || "Unknown",
                avatarUrl: user.avatarUrl || "https://via.placeholder.com/40",
              };
            }
          });
        });

        // Cập nhật userDetails với targetUser nếu chưa có
        if (targetUser && !userMap[targetUser.uid]) {
          userMap[targetUser.uid] = {
            fullName: targetUser.fullName || "Unknown",
            avatarUrl: targetUser.profilePicURL || targetUser.profilePicUrl || "https://via.placeholder.com/40",
          };
        }

        setUserDetails(userMap);
        setContacts(contactsData.slice(0, 10));

        const { data: userData } = await axios.get(
          "http://localhost:4000/social/api/message/get-user",
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        let userInfo = { userId: userData.userId, username: "Unknown", avatar: "https://via.placeholder.com/40" };
        setCurrentUser(userInfo);

        if (targetUser) {
          const existingContact = contactsData.find((contact) =>
            contact.listUser?.includes(targetUser.uid) && contact.listUser?.includes(currentUser.userId)
          );
          if (existingContact) {
            setActiveContact(existingContact);
            setTargetUserInfo(null);
          } else {
            setTargetUserInfo({
              userId: targetUser.uid,
              fullName: targetUser.fullName || "Unknown",
              avatarUrl: targetUser.profilePicURL || targetUser.profilePicUrl || "https://via.placeholder.com/40",
            });
            setActiveContact({
              conversationId: null,
              listUser: [currentUser.userId, targetUser.uid],
              name: targetUser.fullName || "Unknown",
              avatarUrl: targetUser.profilePicURL || targetUser.profilePicUrl || "https://via.placeholder.com/40",
              lastMessage: "",
              lastUpdate: null,
              unreadCount: {},
            });
          }
        } else if (contactsData.length > 0) {
          setActiveContact(contactsData[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    loadInitialData();
  }, [targetUser, currentUser.userId]);

  useEffect(() => {
    const conversationId = activeContact?.conversationId;
    if (!conversationId || !firebaseToken) return;

    let initialLoad = true;
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.().getTime() || null,
        }))
        .reverse();

      setConversationMessages((prev) => {
        const existingMessages = prev[conversationId] || [];
        if (initialLoad) {
          initialLoad = false;
          setFirstMessageSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
          lastMessageCountRef.current = newMessages.length;
          setHasMoreMessages(snapshot.docs.length === 20);
          return { ...prev, [conversationId]: newMessages };
        }

        const hasNewMessages = newMessages.some((msg) => {
          return !existingMessages.find((em) => em.id === msg.id && em.timestamp === msg.timestamp);
        });

        if (!hasNewMessages) {
          return prev;
        }

        setFirstMessageSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
        lastMessageCountRef.current = newMessages.length;
        setHasMoreMessages(snapshot.docs.length === 20);
        const combinedMessages = [
          ...existingMessages.filter((msg) => !newMessages.find((nm) => nm.id === msg.id)),
          ...newMessages,
        ].sort((a, b) => a.timestamp - b.timestamp);

        return { ...prev, [conversationId]: combinedMessages };
      });
    }, (error) => {
      console.error("Lỗi messages:", error);
    });

    return () => unsub();
  }, [activeContact?.conversationId, firebaseToken]);


  // Load convert google.daytime
  useEffect(() => {
    let initialLoad = true;
    const q = query(collection(db, "conversations"), orderBy("lastUpdate", "desc"), limit(10));

    const unsub = onSnapshot(q, (snapshot) => {
      const updatedContacts = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Xử lý lastUpdate từ Firestore hoặc API
        let lastUpdateValue;
        if (data.lastUpdate && typeof data.lastUpdate === "object" && "toDate" in data.lastUpdate) {
          // Trường hợp từ Firestore (onSnapshot)
          lastUpdateValue = data.lastUpdate?.toDate?.().getTime() || null;
        } else {
          // Trường hợp từ API (đã là mili giây)
          lastUpdateValue = typeof data.lastUpdate === "number" ? data.lastUpdate : null;
        }

        return {
          conversationId: doc.id,
          ...data,
          lastUpdate: lastUpdateValue,
          users: data.users || [],
        };
      });

      if (initialLoad) {
        initialLoad = false;
        setContacts(updatedContacts);
        setLastConversationSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
        return;
      }

      setContacts((prevContacts) => {
        const updated = updatedContacts.map((newContact) => {
          const existingContact = prevContacts.find((c) => c.id === newContact.id);
          if (existingContact) {
            return {
              ...existingContact,
              ...newContact,
              unreadCount: newContact.unreadCount || existingContact.unreadCount,
            };
          }
          return newContact;
        });
        return updated;
      });
      setLastConversationSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
    }, (error) => {
      console.error("Lỗi conversations:", error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!messagesEndRef.current || !conversationMessages[activeContact?.conversationId]?.length) return;

    const currentMessages = conversationMessages[activeContact.conversationId];
    if (shouldAutoScrollRef.current || currentMessages.length > lastMessageCountRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      shouldAutoScrollRef.current = false;
    }
  }, [conversationMessages, activeContact]);

  const loadMoreConversations = async () => {
    if (!lastConversationSnapshot) return;

    try {
      const q = query(
        collection(db, "conversations"),
        orderBy("lastUpdate", "desc"),
        startAfter(lastConversationSnapshot),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const newContacts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdate: data.lastUpdate?.toDate?.().getTime() || null,
          users: data.users || [],
        };
      });
      setContacts((prev) => [...prev, ...newContacts]);
      setLastConversationSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (error) {
      console.error("Lỗi load more conversations:", error);
    }
  };

  const loadMoreMessages = async () => {
    const conversationId = activeContact?.conversationId;
    if (!conversationId || !firstMessageSnapshot || !firebaseToken || !hasMoreMessages) return;

    try {
      const scrollHeightBefore = messagesContainerRef.current.scrollHeight;
      const scrollTopBefore = messagesContainerRef.current.scrollTop;

      const firstMessageTimestamp = firstMessageSnapshot.data().timestamp;

      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        where("timestamp", "<", firstMessageTimestamp),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const newMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.().getTime() || null,
        }))
        .reverse();

      setConversationMessages((prev) => {
        const existingMessages = prev[conversationId] || [];
        const updatedMessages = [...newMessages, ...existingMessages];
        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });

      setFirstMessageSnapshot(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMoreMessages(snapshot.docs.length === 20);

      setTimeout(() => {
        const scrollHeightAfter = messagesContainerRef.current.scrollHeight;
        messagesContainerRef.current.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
      }, 0);
    } catch (error) {
      console.error("Lỗi load more messages:", error);
      setHasMoreMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!(messageInput.trim() || selectedFiles.length)) return;

    setMessageInput("");
    setSelectedFiles([]);

    let conversationId = activeContact?.conversationId;
    let updatedContact = { ...activeContact }; // Sao chép activeContact hiện tại

    if (!conversationId && targetUserInfo) {
      try {
        const formData = new FormData();
        formData.append("list-user", currentUser.userId);
        formData.append("list-user", targetUserInfo.userId);
        formData.append("context", messageInput);
        selectedFiles.forEach((file) => formData.append("listMediaFile", file));

        const response = await axios.post(
          "http://localhost:4000/social/api/message/upload",
          formData,
          { headers: { Authorization: `Bearer ${firebaseToken}` } }
        );
        conversationId = response.data.conversationId;

        // Cập nhật activeContact với thông tin từ targetUserInfo
        setActiveContact((prev) => ({
          ...prev,
          conversationId,
          name: targetUserInfo.fullName,
          avatarUrl: targetUserInfo.avatarUrl,
        }));

        // Không cần setTargetUserInfo(null), giữ lại cho đến khi cần
      } catch (error) {
        console.error("Gửi tin nhắn thất bại hoặc tạo conversation lỗi:", error);
        return;
      }
    } else if (conversationId) {
      // Trường hợp cuộc hội thoại đã tồn tại
      const formData = new FormData();
      activeContact.listUser.forEach((userId) => formData.append("list-user", userId));
      formData.append("context", messageInput);
      selectedFiles.forEach((file) => formData.append("listMediaFile", file));

      const response = await axios.post(
        "http://localhost:4000/social/api/message/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );

      // Lấy thông tin cuộc hội thoại mới nhất từ server hoặc Firestore
      const conversationDoc = await getDoc(doc(db, "conversations", conversationId));
      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data();
        updatedContact = {
          ...activeContact,
          lastMessage: messageInput || activeContact.lastMessage,
          lastUpdate: conversationData.lastUpdate?.toDate?.().getTime() || Date.now(),
          unreadCount: conversationData.unreadCount || activeContact.unreadCount,
        };
        setActiveContact(updatedContact);

        // Cập nhật danh sách contacts để đồng bộ
        setContacts((prev) =>
          prev.map((contact) =>
            contact.conversationId === conversationId
              ? { ...contact, ...updatedContact }
              : contact
          )
        );
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleConversationClick = async (contact) => {
    setActiveContact(contact);
    const conversationId = contact.conversationId;
    try {
      const unreadCount = await getUnreadCount(conversationId, currentUser.userId);
      console.log("Unread count before update:", unreadCount);
      if (unreadCount > 0) {
        await updateReadByStatus(conversationId, unreadCount);
        const updatedContacts = await fetchUpdatedContacts();
        setContacts(updatedContacts);
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
    shouldAutoScrollRef.current = true;
    setHasMoreMessages(true);
  };

  const getUnreadCount = async (conversationId, userId) => {
    const snapshot = await getDoc(doc(db, "conversations", conversationId));
    return snapshot.exists() ? snapshot.data().unreadCount?.[userId] || 0 : 0;
  };

  const updateReadByStatus = async (conversationId, unreadCount) => {
    if (unreadCount <= 0) return;
    await axios.post(
      "http://localhost:4000/social/api/message/update-unread",
      { conversationId, unreadCount },
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const fetchUpdatedContacts = async () => {
    const token = await getToken();
    if (!token) return [];
    const { data: contactsData } = await axios.get(
      "http://localhost:4000/social/api/message/get-all-contact",
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return contactsData.slice(0, 10);
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
          {contacts.map((contact) => {
            const isGroupChat = contact.listUser?.length >= 3;
            const otherUserId = isGroupChat
              ? null
              : contact.listUser?.find((id) => id !== currentUser.userId);
            const contactName = isGroupChat
              ? contact.name || "Nhóm chat"
              : userDetails[otherUserId]?.fullName || "Unknown";
            const contactAvatar = isGroupChat
              ? contact.avatarUrl || "https://via.placeholder.com/40"
              : userDetails[otherUserId]?.avatarUrl || "https://via.placeholder.com/40";
            const unreadCount = contact.unreadCount?.[currentUser.userId] || 0;
            return (
              <div
                key={contact.conversationId}
                className={classNames(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                  activeContact?.conversationId === contact.conversationId && "bg-gray-100"
                )}
                onClick={() => handleConversationClick(contact)}
              >
                <div className="relative">
                  <img
                    src={contactAvatar}
                    alt={contactName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className={classNames("text-sm truncate", unreadCount > 0 ? "font-bold" : "font-medium")}>
                      {contactName}
                    </p>
                    <span className="text-xs text-gray-500">{dayjs(new Date(contact.lastUpdate)).fromNow()}</span>
                  </div>
                  <p
                    className={classNames(
                      "text-xs truncate",
                      unreadCount > 0 ? "font-bold text-gray-800" : "font-normal text-gray-500"
                    )}
                  >
                    {contact.lastMessage || "No messages"}
                  </p>
                </div>
              </div>
            );
          })}
          {contacts.length > 0 && (
            <button
              onClick={loadMoreConversations}
              className="w-full py-2 text-blue-500 hover:text-blue-700"
            >
              Load More Conversations
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {activeContact ? (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={
                    activeContact?.conversationId
                      ? activeContact.avatarUrl || // Ưu tiên avatar từ activeContact
                      (activeContact.listUser?.length >= 3
                        ? activeContact.avatarUrl || "https://via.placeholder.com/40"
                        : userDetails[activeContact.listUser?.find((id) => id !== currentUser.userId)]?.avatarUrl ||
                        "https://via.placeholder.com/40")
                      : targetUserInfo?.avatarUrl || "https://via.placeholder.com/40"
                  }
                  alt="Contact avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-800">
                    {activeContact.conversationId
                      ? activeContact.listUser?.length >= 3
                        ? activeContact.name || "Nhóm chat"
                        : userDetails[activeContact.listUser?.find((id) => id !== currentUser.userId)]?.fullName || "Unknown"
                      : targetUserInfo?.fullName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">Đang hoạt động</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <Video className="h-5 w-5 text-gray-500" />
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
              {hasMoreMessages && (
                <button
                  onClick={loadMoreMessages}
                  className="w-full py-2 text-blue-500 hover:text-blue-700"
                >
                  Load More Messages
                </button>
              )}
              {(conversationMessages[activeContact?.conversationId] || []).map((msg, idx) => {
                const isUser = msg.sender === currentUser.userId;
                const isGroupChat = activeContact.listUser?.length >= 3;
                const sender = isUser
                  ? currentUser
                  : userDetails[msg.sender] || {
                    id: msg.sender,
                    fullName: "Unknown User",
                    avatarUrl: "https://via.placeholder.com/40",
                  };
                return (
                  <div
                    key={msg.id || idx}
                    className={classNames("flex flex-col", isUser ? "items-end" : "items-start")}
                  >
                    {!isUser && isGroupChat && (
                      <p className="text-xs text-gray-500 mb-1">{sender.fullName}</p>
                    )}
                    <div className="flex items-end max-w-[50%]">
                      {!isUser && (
                        <img
                          src={sender.avatarUrl}
                          alt={sender.fullName}
                          className="h-8 w-8 rounded-full mr-2 self-end"
                        />
                      )}
                      <div
                        className={classNames(
                          "break-words whitespace-pre-wrap rounded-2xl p-3",
                          isUser ? "bg-gray-300 text-black" : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {/* Hiển thị nhiều ảnh nếu msg.media là mảng */}
                        {msg.media &&
                          (Array.isArray(msg.media) ? (
                            msg.media.map((mediaUrl, index) => (
                              <img
                                key={index}
                                src={mediaUrl}
                                alt={`media-${index}`}
                                className="max-w-full rounded-lg mb-2"
                              />
                            ))
                          ) : (
                            <img src={msg.media} alt="media" className="max-w-full rounded-lg mb-2" />
                          ))}
                        {msg.context?.trim() && <p>{msg.context}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{dayjs(new Date(msg.timestamp)).fromNow()}</p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {selectedFiles.map((file, index) => {
                  const imageUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`preview-${index}`}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                          URL.revokeObjectURL(imageUrl);
                        }}
                        className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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