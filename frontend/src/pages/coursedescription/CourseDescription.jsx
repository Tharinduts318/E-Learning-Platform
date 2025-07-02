import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id, fetchCourse]);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    
    // Redirect to Stripe payment page
    navigate(`/stripe-payment/${params.id}`);
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={`${server}/${course.image}`}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h1>{course.title}</h1>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>Created by {course.createdBy}</span>
                    <span>Duration: {course.duration}</span>
                  </div>
                  <button
                    disabled={loading}
                    onClick={checkoutHandler}
                    className="buy-btn"
                  >
                    Buy Now ${course.price}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
