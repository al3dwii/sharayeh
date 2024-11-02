import React from 'react';
import { FaTwitter, FaLinkedin, FaTiktok, FaYoutube, FaFacebook } from 'react-icons/fa';

const SocialIcons = () => {
  return (
    <div className="social-icons">
      <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
        <FaTwitter />
      </a>
      <a href="https://linkedin.com" className="social-icon" aria-label="LinkedIn">
        <FaLinkedin />
      </a>
      <a href="https://tiktok.com" className="social-icon" aria-label="TikTok">
        <FaTiktok />
      </a>
      <a href="https://youtube.com" className="social-icon" aria-label="YouTube">
        <FaYoutube />
      </a>
      <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
        <FaFacebook />
      </a>
    </div>
  );
};

export default SocialIcons;
