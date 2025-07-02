import React, { useEffect, useState } from "react";
import "./coursedetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { UserData } from "../../context/UserContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "../../components/loading/Loading";

const CourseDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourse, course, fetchCourses } = CourseData();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    price: "",
    duration: ""
  });

  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id, fetchCourse]);

  useEffect(() => {
    if (course && !isEditing) {
      setEditData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        duration: course.duration || ''
      });
    }
  }, [course, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/admin/course/${params.id}`,
        editData,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message);
      setIsEditing(false);
      fetchCourse(params.id);
      fetchCourses();
    } catch (error) {
      toast.error(error.response.data.message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: course.title,
      description: course.description,
      price: course.price,
      duration: course.duration
    });
  };

  const handleEnroll = () => {
    if (isAuth) {
      navigate(`/course/${params.id}`);
    } else {
      navigate("/login");
    }
  };

  if (!course) return <Loading />;

  const isAdmin = user && user.role === "admin";
  const canEdit = isAdmin;

  return (
    <div className="course-details">
      <div className="course-details-container">
        <div className="course-image-section">
          <img src={`${server}/${course.image}`} alt={course.title} className="course-detail-image" />
        </div>
        
        <div className="course-info-section">
          {isEditing ? (
            <div className="edit-form">
              <p>Title :</p>
              <input
                type="text"
                value={editData.title || ''}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                className="edit-input"
                placeholder="Course Title"
              />
              <p>Description :</p>
              <textarea
                value={editData.description || ''}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="edit-textarea"
                placeholder="Course Description"
                rows="4"
              />
              <p>Price :</p>
              <input
                type="text"
                value={editData.price || ''}
                onChange={(e) => setEditData({...editData, price: e.target.value})}
                className="edit-input"
                placeholder="Price"
              />
              <p>Duration (weeks) : </p>
              <input
                type="text"
                value={editData.duration || ''}
                onChange={(e) => setEditData({...editData, duration: e.target.value})}
                className="edit-input"
                placeholder="Duration (weeks)"
              />
              <div className="edit-buttons">
                <button onClick={handleSave} disabled={loading} className="save-btn">
                  {loading ? "Saving..." : "Save"}
                </button>
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="course-title">{course.title}</h1>
              <div className="course-description">
                {(course.description || '').split('\n').map((paragraph, index) => (
                  <p key={index} className="description-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <div className="course-meta">
                <div className="meta-item">
                  <span className="meta-label">Instructor:</span>
                  <span className="meta-value">{course.createdBy}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Duration:</span>
                  <span className="meta-value">{course.duration} weeks</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Price:</span>
                  <span className="meta-value">${course.price}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="action-buttons">
                {isAuth && user && user.role === "admin" && (
                  <button onClick={handleEdit} className="edit-btn" style={{display: 'inline-block'}}>
                    Edit Course
                  </button>
                )}
                {!isAuth || (user && user.role !== "admin") ? (
                  <button onClick={handleEnroll} className="enroll-btn">
                    {isAuth ? "Enroll Now" : "Login to Enroll"}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;