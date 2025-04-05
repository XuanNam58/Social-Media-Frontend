import React from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { FaComment } from 'react-icons/fa'
import "./ReqUserPostCard.css"
const ReqUserPostCard = () => {
  return (
    <div className="p-2">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden group shadow-lg">
                <img
                    className="w-full h-full object-cover cursor-pointer group-hover:brightness-75 transition-all duration-300"
                    src="https://cdn.pixabay.com/photo/2020/09/11/00/06/spiderman-5561671_1280.jpg"
                    alt="Post"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="flex gap-4 text-white text-sm font-semibold">
                        <div className="flex items-center gap-1">
                            <AiFillHeart className="text-red-500 text-lg" />
                            <span>10</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FaComment className="text-lg" />
                            <span>30</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default ReqUserPostCard