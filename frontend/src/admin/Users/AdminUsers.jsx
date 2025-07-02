import React, { useEffect, useState } from "react";
import "./users.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.mainrole !== "superadmin") return navigate("/");

  const [users, setUsers] = useState([]);

  async function fetchUsers() {
    try {
      const { data } = await axios.get(`${server}/api/admin/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id) => {
    if (confirm("are you sure you want to update this user role")) {
      try {
        const { data } = await axios.put(
          `${server}/api/admin/user/${id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const deleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const { data } = await axios.delete(
          `${server}/api/admin/user/${id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const { data } = await axios.patch(
        `${server}/api/admin/user/${id}/status`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  console.log(users);
  return (
    <Layout>
      <div className="users">
        <h1>All Users</h1>
        <table border={"black"}>
          <thead>
            <tr>
              <td>#</td>
              <td>name</td>
              <td>email</td>
              <td>role</td>
              <td>status</td>
              <td>update role</td>
              <td>toggle status</td>
              <td>delete</td>
            </tr>
          </thead>

          {users &&
            users.map((e, i) => (
              <tbody>
                <tr>
                  <td>{i + 1}</td>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.role}</td>
                  <td>{e.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button
                      onClick={() => updateRole(e._id)}
                      className="common-btn"
                    >
                      Update Role
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleUserStatus(e._id)}
                      className="common-btn"
                      style={{ background: e.isActive ? "orange" : "green" }}
                    >
                      {e.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteUser(e._id)}
                      className="common-btn"
                      style={{ background: "red" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            ))}
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;
