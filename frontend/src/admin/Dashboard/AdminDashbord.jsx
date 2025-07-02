import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import "./dashboard.css";
import { FaGraduationCap, FaUsers, FaVideo } from "react-icons/fa";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();
  // Initialize stats as an object
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  if (user && user.role !== "admin") return navigate("/");

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${server}/api/admin/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || "Admin"}!</h1>
          <p>Here's an overview of your e-learning platform</p>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <div className="card-icon">
              <FaGraduationCap />
            </div>
            <div className="card-content">
              <h3>Total Courses</h3>
              <p className="stats-number">{stats.totalCourses ?? 0}</p>
            </div>
          </div>

          <div className="stats-card ">
            <div className="card-icon">
              <FaVideo />
            </div>
            <div className="card-content">
              <h3>Total Lectures</h3>
              <p className="stats-number">{stats.totalLectures ?? 0}</p>
            </div>
          </div>

          <div className="stats-card ">
            <div className="card-icon">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>Total Users</h3>
              <p className="stats-number">{stats.totalUsers ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashbord;
