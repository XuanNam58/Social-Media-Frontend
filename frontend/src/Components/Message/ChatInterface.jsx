"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Edit, Phone, Video, MoreHorizontal, ImageIcon, Smile, Paperclip, Send, Mic, Plus } from "lucide-react"
import axios from "axios"

// Utility function to replace cn
const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

export default function ChatInterface() {
  const [activeContact, setActiveContact] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [contacts, setContacts] = useState([])
  const [conversations, setConversations] = useState([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [token, setToken] = useState("");

  // Fetch contacts when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
            setIsLoading(true)
            try {
              const storedToken = localStorage.getItem("token");
              setToken(storedToken);
              if (!storedToken) {
                console.error("No token found");
                return;
              }
              
              // Fetch contacts
              const {data: contactsData} = await axios.get(
                "http://localhost:4000/social/api/message/get-all-contact",
                {
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                }
              }
              );
              setContacts(contactsData)
      
              // Set first contact as active if available
              if (contactsData.length > 0) {
                setActiveContact(contactsData[0].id)
      
                // Fetch detail conversations at once
                const {data: conversationsData} = await axios.post(
                  "http://localhost:4000/social/api/message/get-details-messages",
                  {
                    listUser: contactsData[0].id,
                  },
                  {
                    headers: {
                      "Authorization": `Bearer ${token}`,
                       "Content-Type": "application/json" 
                      },
                  }
                );
                setConversations(conversationsData)
              }
            } catch (error) {
              console.error("Error fetching data:", error)
            } finally {
              setIsLoading(false)
            }
          }

    loadInitialData()
  }, [])

  // Fetch messages when active contact changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeContact) return

      // If we already have messages for this contact, don't fetch again
      if (conversations[activeContact]?.length > 0) return

      try {
        const response = await axios.get(`/api/messages/${activeContact}`)
        setConversations((prev) => ({
          ...prev,
          [activeContact]: response.data,
        }))
      } catch (error) {
        console.error(`Error loading messages for contact ${activeContact}:`, error)
      }
    }

    loadMessages()
  }, [activeContact, conversations])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversations, activeContact])

  const handleSendMessage = async () => {
    if (message.trim() === "" || !activeContact) return

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    // Optimistically update UI
    setConversations((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMessage],
    }))

    // Clear input
    setMessage("")

    try {
        const {data: contactsData} = await axios.get(
          "http://localhost:4000/social/api/message/upload",
          {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactId: activeContact,
            message: newMessage.content,
          }),
        }
        );
      } catch (error) {
        console.error("Error sending message:", error)
        // Could add error handling or retry logic here
      }
    }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (files && files.length > 0 && activeContact) {
      // In a real app, you would upload the file to a server
      // Here we're just simulating by using a placeholder
      const newMessage = {
        id: Date.now().toString(),
        content: "https://via.placeholder.com/300x200",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isImage: true,
      }

      // Optimistically update UI
      setConversations((prev) => ({
        ...prev,
        [activeContact]: [...(prev[activeContact] || []), newMessage],
      }))

      try {
        await axios.get(
            "http://localhost:4000/social/api/message/upload",
            {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contactId: activeContact,
              message: newMessage.content,
            }),
          }
          );
        } catch (error) {
          console.error("Error sending message:", error)
          // Could add error handling or retry logic here
        }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const activeContactData = contacts.find((contact) => contact.id === activeContact)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Đoạn chat</h1>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Edit className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm trên Messenger"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={classNames(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                  activeContact === contact.id && "bg-gray-100",
                )}
                onClick={() => setActiveContact(contact.id)}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={contact.avatar || "/placeholder.svg"}
                      alt={contact.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.time}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-gray-50">
        {activeContactData ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={activeContactData.avatar || "/placeholder.svg"}
                    alt={activeContactData.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{activeContactData.name}</p>
                  <p className="text-xs text-gray-500">{activeContactData.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                {conversations[activeContact]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={classNames("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={classNames(
                        "max-w-[70%] rounded-2xl p-3",
                        msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800",
                      )}
                    >
                      {msg.isImage ? (
                        <div className="rounded-md overflow-hidden">
                          <img
                            src={msg.content || "/placeholder.svg"}
                            alt="Shared image"
                            className="max-w-full object-cover"
                          />
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <p className="text-xs opacity-70 text-right mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Plus className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </button>
                <div className="flex-1 mx-2">
                  <input
                    type="text"
                    placeholder="Aa"
                    className="w-full px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-800"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Smile className="h-5 w-5 text-gray-500" />
                </button>
                {message.trim() ? (
                  <button className="p-2 rounded-full hover:bg-gray-100" onClick={handleSendMessage}>
                    <Send className="h-5 w-5 text-blue-500" />
                  </button>
                ) : (
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Mic className="h-5 w-5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </>
  )
}

