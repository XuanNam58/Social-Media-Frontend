import React from 'react';

const ReqUserPostPart = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có bài đăng nào
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div key={post.id} className="aspect-square">
          <img
            src={post.imageURL}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ReqUserPostPart;
