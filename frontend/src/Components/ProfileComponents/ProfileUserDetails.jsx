import React from "react";
import { TbCircleDashed } from "react-icons/tb";

const ProfileUserDetails = () => {
  return (
    <div className="py-10 w-full border mt-5 rounded-[30px]">
      <div className="flex items-center ml-16">
        <div className="w-[15%]">
          <img
            className="w-32 h-32 rounded-full"
            src="https://cdn.pixabay.com/photo/2025/02/19/06/17/winter-9416919_1280.jpg"
            alt=""
          />
        </div>

        <div>
          <div className="flex space-x-10 items-center">
            <p>Professor</p>
            <button>Edit Profile</button>
            <TbCircleDashed></TbCircleDashed>
          </div>

          <div className="flex space-x-10">
            <div>
                <span className="font-semibold mr-2">10</span>
                <span>posts</span>
            </div>

            <div>
                <span className="font-semibold mr-2">5</span>
                <span>followers</span>
            </div>

            <div>
                <span className="font-semibold mr-2">7</span>
                <span>following</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">Bella ciao bella ciao</p>
            <p className="font-thin text-sm">😎 Charming Prince 🔥</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUserDetails;
