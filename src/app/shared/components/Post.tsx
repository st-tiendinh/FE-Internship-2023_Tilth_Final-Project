import React from 'react';
import PostImg from '../../assets/post-img.jpg';
import '../../../../src/stylesheet/style.scss';

const Post = () => {
  return (
    <div className="post">
      <div className="post-image-wrapper">
        <img className="post-image" src={PostImg} alt="beautiful beach" />
      </div>
      <div className="post-content">
        <span className="badge badge-secondary">Technology</span>
        <h4 className="post-title">
          The Impact of Technology on the Workplace: How Technology is Changing
        </h4>
        <div className="post-desc">
          <div className="post-author">
            <img className="post-author-avatar" src={PostImg} alt="" />
            <span className="post-author-name">John Doe Doe Doe Doe</span>
          </div>

          <span className="post-date">June 20, 2020</span>
        </div>
      </div>
    </div>
  );
};

export default Post;
