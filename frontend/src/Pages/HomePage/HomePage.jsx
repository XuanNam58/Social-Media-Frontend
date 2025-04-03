import React from "react";
import StoryCircle from "../../Components/Story/StoryCircle";
import HomeRight from "../../Components/HomeRight/HomeRight";
import PostCard from "../../Components/Post/PostCard";
import PostBox from "../../Components/Box/PostBox";
import ContactRight from "../../Components/ContactRight/ContactRight";


const HomePage = () => {
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
            {[1].map((item) => (
              <PostCard />
            ))}
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
