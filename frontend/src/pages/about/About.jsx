import React from "react";
import "./about.css";
import { FaGraduationCap, FaUsers, FaAward, FaLightbulb } from "react-icons/fa";

const About = () => {
  return (
    <div className="about">
      <div className="hero-section">
        <h1>About E-Learning</h1>
        <p className="hero-text">
          Empowering minds through innovative online education
        </p>
      </div>

      <div className="mission-section">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            We are dedicated to providing high-quality online courses that help
            individuals learn, grow, and excel in their desired fields. Our
            experienced instructors ensure that each course is tailored for
            effective learning and practical application.
          </p>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaGraduationCap className="feature-icon" />
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of experience</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Community Learning</h3>
              <p>Join a vibrant community of learners and grow together</p>
            </div>
            <div className="feature-card">
              <FaAward className="feature-icon" />
              <h3>Certified Courses</h3>
              <p>Earn certificates that add value to your professional profile</p>
            </div>
            <div className="feature-card">
              <FaLightbulb className="feature-icon" />
              <h3>Innovative Content</h3>
              <p>Access cutting-edge curriculum designed for modern learners</p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Students Enrolled</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Courses Available</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Expert Instructors</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="vision-section">
        <div className="container">
          <h2>Our Vision</h2>
          <p>
            To become the leading platform for online education, making quality
            learning accessible to everyone, everywhere. We believe in the power
            of education to transform lives and create opportunities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
