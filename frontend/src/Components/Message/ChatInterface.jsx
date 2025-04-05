"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Edit, Phone, Video, MoreHorizontal, ImageIcon, Smile, Paperclip, Send, Mic, Plus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import axios from "axios"
import { Auth } from "firebase/firebase"

export default function ChatInterface() {
  const [activeContact, setActiveContact] = useState("")
  const [message, setMessage] = useState("")
  const [contacts, setContacts] = useState([])
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)

  // Fetch contacts and messages when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        localStorage.getItem("token");
        if (!token) {
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

    fetchData()
  }, [])

  // Fetch messages for a specific contact when active contact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContact) return

      try {
        const response = await fetch(`/api/messages/${activeContact}`)
        const data = await response.json()

        setConversations((prev) => ({
          ...prev,
          [activeContact]: data,
        }))
      } catch (error) {
        console.error(`Error fetching messages for contact ${activeContact}:`, error)
        // Messages will use the mock data if API fails
      }
    }

    // Only fetch if we don't already have the messages for this contact
    if (activeContact && !conversations[activeContact]) {
      fetchMessages()
    }
  }, [activeContact, conversations])

  const handleSendMessage = async () => {
    if (message.trim() === "") return

    const newMessage = {
      id: Date.now().toString(),
      content: message,
    }

    // Optimistically update UI
    setConversations((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMessage],
    }))

    setMessage("")

    // Send message to API
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
    if (files && files.length > 0) {
      const file = files[0]

      // Create a new message with a temporary placeholder
      const newMessage = {
        id: Date.now().toString(),
        content: "/placeholder.svg?height=200&width=300",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isImage: true,
        uploading: true,
      }

      // Optimistically update UI
      setConversations((prev) => ({
        ...prev,
        [activeContact]: [...(prev[activeContact] || []), newMessage],
      }))

      // In a real app, you would upload the file to a server
      try {
        // Simulate file upload
        const formData = new FormData()
        formData.append("file", file)
        formData.append("contactId", activeContact)

        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Update the message with the "uploaded" image URL
        setConversations((prev) => {
          const updatedMessages = [...prev[activeContact]]
          const messageIndex = updatedMessages.findIndex((msg) => msg.id === newMessage.id)

          if (messageIndex !== -1) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              uploading: false,
              // In a real app, this would be the URL returned from the server
              content: "/placeholder.svg?height=200&width=300",
            }
          }

          return {
            ...prev,
            [activeContact]: updatedMessages,
          }
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        // Handle upload error
      }
    }
  
  
  }

  //get token
  const fetchFirebaseToken = async () => {
    localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return null;
    }
};

const fetchChatData = async (listUser) => {
  try {
    const token = await fetchFirebaseToken();
    if (!token) return;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ listUser }),
    });

    const data = await response.json();
    if (response.ok) {
      setConversations((prev) => ({ ...prev, [activeContact]: data.messages }));
    }
  } catch (error) {
    console.error("Error fetching chat data:", error);
  }
};

const handleContactClick = (contact) => {
  setActiveContact(contact.id);
  fetchChatData(contact.listUser);
};

  const activeContactData = contacts.find((contact) => contact.id === activeContact)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input placeholder="Tìm kiếm trên Messenger" className="pl-10 bg-gray-100 border-gray-200 text-gray-800" />
          </div>
        </div>

        <div className="p-2 bg-gray-100 mx-2 my-2 rounded-md">
          <p className="text-sm text-gray-600">
            Thiếu lịch sử chat. <span className="text-blue-600">Khôi phục ngay</span>
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                  activeContact === contact.id && "bg-gray-100",
                )}
                onClick={() => setActiveContact(contact.id)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border border-gray-200">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-gray-200 text-gray-700">{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
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
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-red-50 to-gray-50">
        {/* Chat Header */}
        <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeContactData?.avatar} alt={activeContactData?.name} />
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {activeContactData?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium text-gray-800">{activeContactData?.name}</p>
              <p className="text-xs text-gray-500">{activeContactData?.status}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {conversations[activeContact]?.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl p-3",
                    msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800",
                    msg.uploading && "opacity-70",
                  )}
                >
                  {msg.isImage ? (
                    <div className="rounded-md overflow-hidden">
                      <Image
                        src={msg.content || "/placeholder.svg"}
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                      {msg.uploading && <div className="mt-1 text-xs text-center">Đang tải...</div>}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p className="text-xs opacity-70 text-right mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 mx-2">
              <Input
                placeholder="Aa"
                className="bg-gray-100 border-gray-200 text-gray-800"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Smile className="h-5 w-5" />
            </Button>
            {message.trim() ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-500 hover:text-blue-600"
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

