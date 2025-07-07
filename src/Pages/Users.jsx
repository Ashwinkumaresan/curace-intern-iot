import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyNavbar from "../Component/Navbar/Navbar";

const defaultColumns = {
  username: true,
  email: true,
  userRole: true,
  status: true,
  createdOn: true,
};

export default function Component() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  // The activeTab state will still manage 'Active', 'Inactive', 'all'.
  // 'Pending' users will implicitly be part of 'all' and excluded from 'Active'/'Inactive'.
  const [activeTab, setActiveTab] = useState("Active");
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Form and Edit state
  const [formData, setFormData] = useState({ username: "", email: "", userRole: "", status: "Active" }); // Added status to formData
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null); // Local ID for table mapping
  // NEW: State to store the backend's unique objectId for the user being edited
  const [editingUserObjectId, setEditingUserObjectId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        searchTerm === "" ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userRole.toLowerCase().includes(searchTerm.toLowerCase());

      const roleMatch = userRoleFilter === "all" || user.userRole === userRoleFilter;

      // Status match now considers 'Pending' not part of 'Active' or 'Inactive' tabs
      const statusMatch =
        activeTab === "all" ||
        (activeTab === "Active" && user.status === "Active") ||
        (activeTab === "Inactive" && user.status === "Inactive");

      return searchMatch && roleMatch && statusMatch;
    });
  }, [users, searchTerm, userRoleFilter, activeTab]);

  const columnLabels = {
    username: "Name",
    email: "Email",
    userRole: "Role",
    status: "Status",
    createdOn: "Created On",
  };

  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.userRole) {
      errors.userRole = "Role is required";
    }
    // No validation needed for status, as it's typically set by backend or system.

    // Check for duplicate email (excluding current user when editing)
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase() && user.id !== editingUserId
    );
    if (existingUser) {
      errors.email = "This email is already in use";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ username: "", email: "", userRole: "", status: "Active" }); // Reset status to default for new user
    setIsEditing(false);
    setEditingUserId(null);
    setEditingUserObjectId(null); // IMPORTANT: Reset the objectId here
    setFormErrors({});
  };

  // Centralized function to close the modal
  const closeModal = () => {
    const modalElement = document.getElementById("addUserModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    } else {
      modalElement.classList.remove("show");
      modalElement.style.display = "none";
      modalElement.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }
  };

  const handleModalClose = () => {
    resetForm();
    closeModal();
  };

  const handleEdit = (user) => {
    // Set form data with current user's details, including status
    setFormData({ username: user.username, email: user.email, userRole: user.userRole, status: user.status });
    setIsEditing(true);
    setEditingUserId(user.id); // Set local ID for UI purposes
    setEditingUserObjectId(user.objectId); // IMPORTANT: Set the backend's objectId here
    setFormErrors({});

    // Show modal
    const modalElement = document.getElementById("addUserModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    } else {
      modalElement.classList.add("show");
      modalElement.style.display = "block";
      modalElement.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    }
  };

  const handleAddNew = () => {
    resetForm(); // Ensure form is reset for new user
    // Show modal
    const modalElement = document.getElementById("addUserModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    } else {
      modalElement.classList.add("show");
      modalElement.style.display = "block";
      modalElement.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    }
  };

  // make active or inactive
  const handleToggleUserStatus = async (user) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token not found. Please log in.");
      alert("Authentication required. Please log in.");
      localStorage.clear();
      navigate("/");
      return;
    }

    let endpoint = "";
    let successMessage = "";

    // Determine the action based on the current status
    if (user.status === "Active" || user.status === "Pending") {
      // If currently Active or Pending, the action is to Inactivate
      endpoint = "http://62.72.13.179:5000/users/inactivate/";
      successMessage = "User inactivated successfully!";
    } else if (user.status === "Inactive") {
      // If currently Inactive, the action is to Activate
      endpoint = "http://62.72.13.179:5000/users/activate/";
      successMessage = "User activated successfully!";
    } else {
      // Handle any other unexpected status or default to activate if unsure
      console.warn("Unexpected user status, defaulting to activate:", user.status);
      endpoint = "http://62.72.13.179:5000/users/activate/";
      successMessage = "User status updated successfully!";
    }

    try {
      const payload = {
        objectId: user.objectId,
      };

      const response = await axios.patch(
        endpoint,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`User status operation successful:`, response.data);
      alert(successMessage);
      await fetchUserData(); // Re-fetch data to update UI and reflect the change
    } catch (error) {
      console.error("Error updating user status:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Something went wrong during status update.";
      alert(`Failed to update user status: ${errorMessage}`);
    }
  };

  const activeUserCount = useMemo(() => users.filter((user) => user.status === "Active").length, [users]);
  const inactiveUserCount = useMemo(() => users.filter((user) => user.status === "Inactive").length, [users]);
  // Add a pending user count if you want to display it
  const pendingUserCount = useMemo(() => users.filter((user) => user.status === "Pending").length, [users]);
  const allUserCount = users.length;

  const getTabClass = (tabName) => {
    return `nav-link ${activeTab === tabName ? "active" : ""}`;
  };

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem("access_token"); // Get token here
    if (!accessToken) {
      console.error("Access token not found. Redirecting to login.");
      alert("Authentication required. Please log in.");
      localStorage.clear(); // Clear any stale token
      navigate("/"); // Use navigate for redirection
      return;
    }
    try {
      const response = await axios.get("http://62.72.13.179:5000/users/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const mappedUsers = response.data.map((user, index) => ({
        id: index + 1, // Local UI ID
        objectId: user.objectId, // Backend's unique ID
        username: user.username,
        email: user.email,
        userRole: user.userRole,
        status: user.status, // Ensure status is correctly mapped from backend
        createdOn: user.createdOn,
      }));

      console.log("Fetched and mapped users:", mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        localStorage.clear();
        navigate("/"); // Use navigate for redirection
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const accessToken = localStorage.getItem("access_token"); // Get token here
    if (!accessToken) {
      console.error("Access token not found. Please log in.");
      alert("Authentication required. Please log in.");
      localStorage.clear();
      navigate("/");
      return;
    }

    if (isEditing && editingUserObjectId !== null) {
      // Edit existing user
      try {
        const updatePayload = {
          username: formData.username,
          userRole: formData.userRole,
          objectId: editingUserObjectId,
          // Do not send email if it's readOnly in edit mode, unless backend explicitly needs it
          // email: formData.email, // If backend allows email changes and it's not readOnly
          // status: formData.status // Include status if you want to change it via edit modal
        };
        console.log(updatePayload);

        const response = await axios.patch(
          "http://62.72.13.179:5000/users/edit/",
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("User updated successfully:", response.data);
        alert("User updated successfully!");

        await fetchUserData(); // Re-fetch all users
        resetForm();
        closeModal();
      } catch (error) {
        console.error("Error updating user:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Something went wrong during update.";
        alert(`Failed to update user: ${errorMessage}`);
      }
    } else {
      // Add new user
      try {
        const newUserPayload = {
          username: formData.username,
          email: formData.email,
          userRole: formData.userRole,
          status: "Pending", // Set default status for new users to "Pending"
        };

        const response = await axios.post("http://62.72.13.179:5000/users/add/", newUserPayload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("User added successfully:", response.data);
        alert("User added successfully!");

        await fetchUserData(); // Re-fetch all users
        resetForm();
        closeModal();
      } catch (error) {
        console.error("Error adding user:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Something went wrong.";
        alert(`Failed to add user: ${errorMessage}`);
      }
    }
  };

  return (
    <>
    <MyNavbar/>
      <div className="container-fluid p-4" style={{
        marginTop:"10vh"
      }}>
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 position-sticky top-0"
          style={{
            backgroundColor: "white",
            zIndex:"99"
          }}
        >
          <div>
            <h1 className="h2 mb-1">User Management</h1>
            <p className="text-muted">Manage your team members and their roles</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddNew}>
            <i className="bi bi-plus-circle me-2"></i>
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="Executive">Executive</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-funnel me-2 "></i>
                    Columns
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {Object.entries(columnLabels).map(([key, label]) => (
                      <li key={key}>
                        <div className="dropdown-item-text">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`column-${key}`}
                              checked={visibleColumns[key]}
                              onChange={() => handleColumnVisibilityChange(key)}
                            />
                            <label className="form-check-label" htmlFor={`column-${key}`}>
                              {label}
                            </label>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Table */}
        <div className="card">
          <div className="card-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={getTabClass("all")} onClick={() => setActiveTab("all")} type="button">
                  All ({allUserCount})
                </button>
              </li>
              <li className="nav-item">
                <button className={getTabClass("Active")} onClick={() => setActiveTab("Active")} type="button">
                  Active ({activeUserCount})
                </button>
              </li>
              <li className="nav-item">
                <button className={getTabClass("Inactive")} onClick={() => setActiveTab("Inactive")} type="button">
                  Inactive ({inactiveUserCount})
                </button>
              </li>
              {/* Optional: Add a "Pending" tab if you want to filter them explicitly */}
              {/* <li className="nav-item">
                <button className={getTabClass("Pending")} onClick={() => setActiveTab("Pending")} type="button">
                  Pending ({pendingUserCount})
                </button>
              </li> */}
            </ul>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    {visibleColumns.username && <th>Name</th>}
                    {visibleColumns.email && <th>Email</th>}
                    {visibleColumns.userRole && <th>Role</th>}
                    {visibleColumns.status && <th>Status</th>}
                    {visibleColumns.createdOn && <th>Created On</th>}
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      {visibleColumns.username && <td className="fw-semibold">{user.username}</td>}
                      {visibleColumns.email && <td>{user.email}</td>}
                      {visibleColumns.userRole && (
                        <td>
                          <span className="badge bg-light text-dark border">{user.userRole}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          {/* Dynamically apply badge class based on status */}
                          <span
                            className={`badge ${user.status === "Active"
                              ? "bg-success"
                              : user.status === "Inactive"
                                ? "bg-danger"
                                : "bg-warning text-dark" // For 'Pending' status
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.createdOn && <td>{user.createdOn}</td>}
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-light"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button className="dropdown-item" onClick={() => handleEdit(user)}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleToggleUserStatus(user)}>
                                <i className="bi bi-person-x me-2"></i>
                                {/* Conditional text for activate/deactivate/set to active (from pending) */}
                                {user.status === "Active"
                                  ? "Deactivate"
                                  : user.status === "Inactive"
                                    ? "Activate"
                                    : "Activate"} {/* If pending, assume 'Activate' is the next step */}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <div
        className="modal fade mt-5 pt-5"
        id="addUserModal"
        tabIndex={-1}
        aria-labelledby="addUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addUserModalLabel">
                {isEditing ? "Edit User" : "Add New User"}
              </h5>
              <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="user-name" className="form-label">
                    Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.username ? "is-invalid" : ""}`}
                    id="user-name"
                    value={formData.username}
                    onChange={(e) => handleFormChange("username", e.target.value)}
                    placeholder="Enter full name"
                  />
                  {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="user-email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                    id="user-email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="Enter email address"
                    readOnly={isEditing}
                  />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="user-role" className="form-label">
                    Role *
                  </label>
                  <select
                    className={`form-select ${formErrors.userRole ? "is-invalid" : ""}`}
                    id="user-role"
                    value={formData.userRole}
                    onChange={(e) => handleFormChange("userRole", e.target.value)}
                  >
                    <option value="">Select a role</option>
                    <option value="Executive">Executive</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {formErrors.userRole && <div className="invalid-feedback">{formErrors.userRole}</div>}
                </div>
                {/* Optional: Add status dropdown in modal if you want to manually set status */}
                {isEditing && (
                  <div className="mb-3">
                    <label htmlFor="user-status" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="user-status"
                      value={formData.status}
                      onChange={(e) => handleFormChange("status", e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option> {/* Added Pending option */}
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {isEditing ? "Update User" : "Save User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}