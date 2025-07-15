import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const locationData = {
    "United States": {
        California: ["San Francisco", "Los Angeles", "San Diego", "Sacramento"],
        "New York": ["New York", "Albany", "Buffalo", "Rochester"],
        Texas: ["Austin", "Houston", "Dallas", "San Antonio"],
        Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
        Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver"],
    },
    "United Kingdom": {
        England: ["London", "Manchester", "Birmingham", "Liverpool"],
        Scotland: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
        Wales: ["Cardiff", "Swansea", "Newport", "Wrexham"],
    },
    Canada: {
        Ontario: ["Toronto", "Ottawa", "Hamilton", "London"],
        Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau"],
        "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby"],
    },
};

const OrganizationDetail = ({ id }) => {
    const navigate = useNavigate()
    const [organization, setOrganization] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [showAddOrgModal, setShowAddOrgModal] = useState(false)
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false)
    const [showViewOrgDetailsModal, setShowViewOrgDetailsModal] = useState(false)
    const [showEditOrgModal, setShowEditOrgModal] = useState(false)
    const [showViewUserDetailsModal, setShowViewUserDetailsModal] = useState(false)
    const [showEditUserModal, setShowEditUserModal] = useState(false)
    const [selectedOrg, setSelectedOrg] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [statusChangeModal, setStatusChangeModal] = useState({ show: false, newStatus: null })

    // Organization form data with specified fields only
    const [orgFormData, setOrgFormData] = useState({
        organizationName: "",
        contactName: "",
        email: "",
        phoneNo: "",
        customerType: "",
        status: "",
        address: "",
        state: "",
        city: "",
        country: "",
    })

    // User form data with specified fields only
    const [userFormData, setUserFormData] = useState({
        username: "",
        email: "",
        userRole: "",
        status: "",
    })

    const [deviceFormData, setDeviceFormData] = useState({
        deviceId: "",
        organization: "",
    })

    const [editOrgFormData, setEditOrgFormData] = useState({})
    const [editUserFormData, setEditUserFormData] = useState({})

    // location
    const handleOrgFormChange = (field, value) => {
        setOrgFormData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "country" && { state: "", city: "" }),
            ...(field === "state" && { city: "" }),
        }));
    };
    const availableStates = orgFormData.country
        ? Object.keys(locationData[orgFormData.country])
        : [];

    const availableCities =
        orgFormData.country && orgFormData.state
            ? locationData[orgFormData.country][orgFormData.state]
            : [];


    // Fetch organization data from API
    const fetchOrganizationData = async () => {
        setLoading(true)
        setError(null)
        const accessToken = localStorage.getItem("access_token")
        console.log(accessToken)

        if (!accessToken) {
            console.error("Access token not found. Please log in.")
            alert("Authentication required. Please log in.")
            localStorage.clear()
            navigate("/")
            setLoading(false)
            return
        }

        try {
            const response = await axios.get("https://api.ozopool.in/organization/detail/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                params: {
                    objectId: id,
                },
            })
            console.log(response.data)

            setOrganization(response.data.organization)
            setDeviceFormData((prev) => ({
                ...prev,
                organization: response.data.organization?.organizationName || "",
            }))
        } catch (err) {
            console.error("Error fetching organization details:", err.response?.data || err.message)
            setError(err.response?.data?.message || "Failed to load organization details.")
            if (err.response?.status === 401) {
                alert("Session expired. Please log in again.")
                localStorage.clear()
                // You can call onNavigateBack or handle navigation as needed
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log("2. useEffect running. ID for condition:", id, "Condition result:", !!id)
        if (id) {
            fetchOrganizationData()
        }
    }, [id])

    // make active or inactive
    const handleStatusChange = async (targetStatus) => {
        // Prevent action if already in the target status or if an operation is in progress
        if (organization.status === targetStatus) {
            alert({ text: `Organization is already ${targetStatus}.`, type: "error" });
            return;
        }
        if (loading) {
            alert({ text: "An operation is already in progress. Please wait.", type: "error" });
            return;
        }

        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            console.error("Access token not found. Please log in.");
            alert({ text: "Authentication required. Please log in.", type: "error" });
            localStorage.clear();
            navigate("/");
            return;
        }

        setLoading(true);

        let endpoint = "";
        let successMessage = "";

        // Determine the action based on the 'targetStatus' received
        if (targetStatus === "Inactive") {
            endpoint = "https://api.ozopool.in/organization/inactivate/";
            successMessage = `Organization ${organization.organizationName} inactivated successfully!`;
        } else if (targetStatus === "Active") {
            endpoint = "https://api.ozopool.in/organization/activate/";
            successMessage = `Organization ${organization.organizationName} activated successfully!`;
        } else {
            console.warn("Invalid target status provided:", targetStatus);
            alert({ text: "Invalid status selected.", type: "error" });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.patch(
                endpoint, null,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        objectId: id,
                    },
                }
            );

            console.log(`Organization status operation successful:`, response.data);
            alert({ text: successMessage, type: "success" });

            setOrganization(prev => ({
                ...prev,
                status: targetStatus
            }));

            await fetchOrganizationData();
        } catch (error) {
            console.error("Error updating organization status:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Something went wrong during status update.";
            alert({ text: `Failed to update organization status: ${errorMessage}`, type: "error" });

            // Handle token expiration or unauthorized errors
            if (error.response?.status === 401) {
                alert({ text: "Session expired. Please log in again.", type: "error" });
                localStorage.clear();
                navigate("/");
            }
        } finally {
            setLoading(false);
        }
    };

    const confirmStatusChange = () => {
        if (organization) {
            setOrganization((prev) => (prev ? { ...prev, status: statusChangeModal.newStatus || prev.status } : null))
        }
        setStatusChangeModal({ show: false, newStatus: null })
    }

    const handleViewOrgDetails = (org) => {
        setSelectedOrg(org)
        setShowViewOrgDetailsModal(true)
    }

    const handleEditOrg = (org) => {
        setSelectedOrg(org)
        setEditOrgFormData({
            organizationName: org.organizationName,
            contactName: org.contactName,
            phoneNo: org.phoneNo,
            email: org.email,
            customerType: org.customerType,
            status: org.status,
            city: org.city,
            country: org.country,
        })
        setShowEditOrgModal(true)
    }

    const handleViewUserDetails = (user) => {
        setSelectedUser(user)
        setShowViewUserDetailsModal(true)
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setEditUserFormData({
            username: user.username,
            email: user.email,
            userRole: user.userRole,
            status: user.status,
        })
        setShowEditUserModal(true)
    }

    // handle add user
    const handleAddUser = async () => {
        const accessToken = localStorage.getItem("access_token")
        const userId = localStorage.getItem("User Id")
        if (userFormData.username && userFormData.email && userFormData.userRole && organization) {
            const newUserPayload = {
                username: userFormData.username,
                email: userFormData.email,
                userRole: userFormData.userRole,
                userId,
            };

            try {
                const response = await axios.post(
                    "https://api.ozopool.in/users/add/",
                    newUserPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const addedUser = response.data;
                setOrganization((prev) =>
                    prev
                        ? {
                            ...prev,
                            users: [...prev.users, addedUser],
                        }
                        : null
                );

                setUserFormData({
                    username: "",
                    email: "",
                    userRole: "",
                    status: "Active",
                });
                setShowAddUserModal(false);
                await fetchOrganizationData();
            } catch (error) {
                console.error("Failed to add user:", error);
                console.error("Failed to add user:", error.response);
            }
        }
    }

    // handle add org
    const handleAddOrganization = async () => {
        if (
            orgFormData.organizationName &&
            orgFormData.contactName &&
            orgFormData.email
        ) {
            try {
                const accessToken = localStorage.getItem("access_token");
                if (!accessToken) {
                    alert("Authentication required. Please log in.");
                    return;
                }

                // --- API CALL FOR CREATING NEW ORGANIZATION ---
                const newOrganizationPayload = {
                    organizationName: orgFormData.organizationName,
                    contactName: orgFormData.contactName,
                    phoneNo: orgFormData.phoneNo,
                    email: orgFormData.email,
                    customerType: orgFormData.customerType,
                    address: orgFormData.address,
                    country: orgFormData.country,
                    state: orgFormData.state,
                    city: orgFormData.city,
                    status: orgFormData.status,
                    objectId: id,
                };

                console.log(
                    "Creating new organization with payload:",
                    newOrganizationPayload
                );

                const response = await axios.post(
                    "https://api.ozopool.in/organization/add/",
                    newOrganizationPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("New organization created successfully:", response.data);
                alert("Organization added successfully!");

                // Refresh organization list after adding
                await fetchOrganizationData();

                // Reset form data
                setOrgFormData({
                    organizationName: "",
                    contactName: "",
                    email: "",
                    phoneNo: "",
                    customerType: "",
                    status: "Active",
                    address: "",
                    country: "",
                    state: "",
                    city: "",
                });

                setShowAddOrgModal(false);
            } catch (error) {
                console.error("Error adding organization:", error);
                alert("Failed to add organization. Please try again.");
            }
        } else {
            alert("Please fill in all required fields.");
        }
    };

    // handle add device
    const handleAddDevice = () => {
        if (deviceFormData.deviceId && organization) {
            const newDevice = {
                id: deviceFormData.deviceId,
                customer: deviceFormData.organization,
                city: organization.city,
                state: organization.city, // Assuming state is same as city for now
                poolStatus: "Good",
                createdOn: new Date().toISOString().split("T")[0],
            }

            setOrganization((prev) =>
                prev
                    ? {
                        ...prev,
                        devices: [...prev.devices, newDevice],
                    }
                    : null,
            )

            setDeviceFormData({ deviceId: "", organization: organization.organizationName })
            setShowAddDeviceModal(false)
        }
    }

    const handleSaveEditOrg = () => {
        if (organization && selectedOrg) {
            setOrganization((prev) =>
                prev
                    ? {
                        ...prev,
                        organizations: prev.organizations.map((org) =>
                            org.id === selectedOrg.id ? { ...org, ...editOrgFormData } : org,
                        ),
                    }
                    : null,
            )
        }
        setShowEditOrgModal(false)
    }

    // edit starting
    const handleSaveEditUser = () => {
        if (organization && selectedUser) {
            setOrganization((prev) =>
                prev
                    ? {
                        ...prev,
                        users: prev.users.map((user) =>
                            user.objectId === selectedUser.objectId ? { ...user, ...editUserFormData } : user,
                        ),
                    }
                    : null,
            )
        }
        setShowEditUserModal(false)
    }

    // Loading state
    if (loading) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading organization details...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                    <button className="btn btn-primary" onClick={fetchOrganizationData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // No data state
    if (!organization) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                <div className="text-center">
                    <i className="bi bi-building" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
                    <p className="mt-3 text-muted">No organization data found</p>
                    <button className="btn btn-primary" onClick={fetchOrganizationData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reload
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-vh-100 p-2" style={{ backgroundColor: "#f8f9fa" }}>
                {/* Header */}
                <div
                    className="sticky-top shadow-lg rounded-1"
                    style={{
                        background: "linear-gradient(to right, #007bff, #0056b3)",
                        zIndex: 1020,
                    }}
                >
                    <div className="container-fluid">
                        <div className="row align-items-center py-3 text-white">
                            <div className="col-12 col-md-8">
                                <div className="d-flex align-items-center">
                                    <button className="btn text-white me-3 p-0" style={{ fontSize: "1.5rem" }} onClick={() => navigate("/organization")}>
                                        <i className="bi bi-arrow-left"></i>
                                    </button>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded me-3 p-2">
                                            <i className="bi bi-building" style={{ fontSize: "2rem" }}></i>
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center">
                                                <h1 className="h3 mb-0 fw-bold me-2">{organization.organizationName}</h1>
                                                <span>{organization.customerType}</span>
                                            </div>
                                            <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>
                                                Associated Partner: {organization.associatedPartner || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4 mt-3 mt-md-0">
                                <div className="d-flex gap-2 justify-content-md-end">
                                    {/* Active or inactive */}
                                    <div className="dropdown">
                                        <button
                                            className={`btn dropdown-toggle ${organization.status === "Active" ? "btn-success" : "btn-danger"
                                                }`}
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            {organization.status}
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => handleStatusChange("Active")}
                                                    disabled={organization.status === "Active"}
                                                >
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Active
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => handleStatusChange("Inactive")}
                                                    disabled={organization.status === "Inactive"}
                                                >
                                                    <i className="bi bi-x-circle me-2"></i>
                                                    Inactive
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            Actions
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <button className="dropdown-item" onClick={() => onNavigateToEdit(organization.id)}>
                                                    <i className="bi bi-pencil me-2"></i>
                                                    Edit
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container-fluid py-4">
                    <div className="row">
                        {/* Left Sidebar */}
                        <div className="col-lg-4">
                            <div className="position-sticky" style={{ top: "120px" }}>
                                {/* Statistics Card */}
                                <div className="card mb-4 shadow-sm">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold">
                                            <i className="bi bi-graph-up me-2"></i>
                                            Statistics
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center">
                                            <div className="col-4">
                                                <div className="border-end py-3">
                                                    <i className="bi bi-laptop display-6 text-primary mb-2"></i>
                                                    <h3 className="text-primary mb-0">{organization.statistics.totalDevices}</h3>
                                                    <small className="text-muted">Total Devices</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border-end py-3">
                                                    <i className="bi bi-check-circle display-6 text-success mb-2"></i>
                                                    <h3 className="text-success mb-0">{organization.statistics.activeDevices}</h3>
                                                    <small className="text-muted">Active Devices</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="py-3">
                                                    <i className="bi bi-exclamation-triangle display-6 text-warning mb-2"></i>
                                                    <h3 className="text-warning mb-0">{organization.statistics.needAttention}</h3>
                                                    <small className="text-muted">Need Attention</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Card */}
                                <div className="card mb-4 shadow-sm">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold">
                                            <i className="bi bi-person-circle me-2"></i>
                                            Contact Information
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-person me-3 text-muted fs-5"></i>
                                            <div>
                                                <strong className="d-block">Contact Name</strong>
                                                <span className="text-secondary">{organization.contactName}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-envelope me-3 text-muted fs-5"></i>
                                            <div>
                                                <strong className="d-block">Email</strong>
                                                <span className="text-secondary">{organization.email}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-telephone me-3 text-muted fs-5"></i>
                                            <div>
                                                <strong className="d-block">Phone</strong>
                                                <span className="text-secondary">{organization.phoneNo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="card mb-4 shadow-sm">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <strong className="d-block text-muted">City</strong>
                                                <span className="text-secondary">{organization.city}</span>
                                            </div>
                                            <div className="col-md-6">
                                                <strong className="d-block text-muted">Country</strong>
                                                <span className="text-secondary">{organization.country}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="col-lg-8">
                            {/* Associated Organizations Table */}
                            {organization.customerType !== "End Customer" && organization.organizations && organization.organizations.length >= 0 && (
                                <div className="card mb-4 shadow-sm"
                                    style={{
                                        height: "50vh",
                                        overflowY: "scroll",
                                    }}>
                                    <div className="card-header d-flex justify-content-between align-items-center bg-white py-3 position-sticky top-0"
                                        style={{
                                            zIndex: "10",
                                        }}>
                                        <div>
                                            <h5 className="card-title mb-0 fw-bold">
                                                <i className="bi bi-building me-2"></i>
                                                Associated Organizations
                                            </h5>
                                            <small className="text-muted">All organizations associated with this one</small>
                                        </div>
                                        <button className="btn btn-sm btn-outline-dark" onClick={() => setShowAddOrgModal(true)}>
                                            <i className="bi bi-plus me-2"></i>
                                            Add Organization
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>S. No</th>
                                                        <th>Contact Name</th>
                                                        <th>Status</th>
                                                        <th>City</th>
                                                        <th>Created On</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {organization.organizations.map((org, index) => (
                                                        <tr key={org.id}>
                                                            <td className="text-primary fw-semibold">{index + 1}</td>
                                                            <td>{org.customerName}</td>
                                                            <td>
                                                                <span className={`badge ${org.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                                                                    {org.status}
                                                                </span>
                                                            </td>
                                                            <td>{org.state}</td>
                                                            <td>{org.createdOn}</td>
                                                            <td>
                                                                <div className="dropdown">
                                                                    <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                                                                        <i className="bi bi-three-dots"></i>
                                                                    </button>
                                                                    <ul className="dropdown-menu">
                                                                        <li>
                                                                            <button className="dropdown-item" onClick={() => handleViewOrgDetails(org)}>
                                                                                <i className="bi bi-eye me-2"></i>
                                                                                View Details
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button className="dropdown-item" onClick={() => handleEditOrg(org)}>
                                                                                <i className="bi bi-pencil me-2"></i>
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Users Table */}
                            <div
                                className="card mb-4 shadow-sm"
                                style={{
                                    height: "50vh",
                                    overflowY: "scroll",
                                }}
                            >
                                <div
                                    className="card-header d-flex justify-content-between align-items-center bg-white py-3 position-sticky top-0"
                                    style={{
                                        zIndex: "10",
                                    }}
                                >
                                    <div>
                                        <h5 className="card-title mb-0 fw-bold">
                                            <i className="bi bi-people me-2"></i>
                                            Users
                                        </h5>
                                        <small className="text-muted">Users associated with {organization.organizationName}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-dark" onClick={() => setShowAddUserModal(true)}>
                                        <i className="bi bi-plus me-2"></i>
                                        Add User
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Username</th>
                                                    <th>Email</th>
                                                    <th>User Role</th>
                                                    <th>Status</th>
                                                    <th>Created On</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {organization.users.map((user) => (
                                                    <tr key={user.objectId}>
                                                        <td className="fw-semibold">{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.userRole}</td>
                                                        <td>
                                                            <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                        <td>{user.createdOn}</td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                                                                    <i className="bi bi-three-dots"></i>
                                                                </button>
                                                                <ul className="dropdown-menu">
                                                                    <li>
                                                                        <button className="dropdown-item" onClick={() => handleViewUserDetails(user)}>
                                                                            <i className="bi bi-eye me-2"></i>
                                                                            View Profile
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item" onClick={() => handleEditUser(user)}>
                                                                            <i className="bi bi-pencil me-2"></i>
                                                                            Edit User
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Devices Table */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header d-flex justify-content-between align-items-center bg-white py-3">
                                    <div>
                                        <h5 className="card-title mb-0 fw-bold">
                                            <i className="bi bi-laptop me-2"></i>
                                            Devices
                                        </h5>
                                        <small className="text-muted">Devices associated with {organization.organizationName}</small>
                                    </div>
                                    <button className="btn btn-sm btn-outline-dark" onClick={() => setShowAddDeviceModal(true)}>
                                        <i className="bi bi-plus me-2"></i>
                                        Add Device
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Device ID</th>
                                                    <th>Customer</th>
                                                    <th>City</th>
                                                    <th>State</th>
                                                    <th>Pool Status</th>
                                                    <th>Created On</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {organization.devices.map((device) => (
                                                    <tr key={device.id}>
                                                        <td className="text-primary fw-semibold">{device.id}</td>
                                                        <td>{device.customer}</td>
                                                        <td>{device.city}</td>
                                                        <td>{device.state}</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${device.poolStatus === "Excellent"
                                                                    ? "bg-success"
                                                                    : device.poolStatus === "Good"
                                                                        ? "bg-primary"
                                                                        : "bg-warning text-dark"
                                                                    }`}
                                                            >
                                                                {device.poolStatus}
                                                            </span>
                                                        </td>
                                                        <td>{device.createdOn}</td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                                                                    <i className="bi bi-three-dots"></i>
                                                                </button>
                                                                <ul className="dropdown-menu">
                                                                    <li>
                                                                        <button className="dropdown-item">
                                                                            <i className="bi bi-eye me-2"></i>
                                                                            View Details
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button className="dropdown-item">
                                                                            <i className="bi bi-pencil me-2"></i>
                                                                            Edit
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Change Confirmation Modal */}
            {statusChangeModal.show && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Status Change</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setStatusChangeModal({ show: false, newStatus: null })}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to change the status to <strong>{statusChangeModal.newStatus}</strong>?
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStatusChangeModal({ show: false, newStatus: null })}
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={confirmStatusChange}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Device Modal */}
            {showAddDeviceModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Device</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddDeviceModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="deviceIdInput" className="form-label">
                                        Device ID
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="deviceIdInput"
                                        value={deviceFormData.deviceId}
                                        onChange={(e) => setDeviceFormData((prev) => ({ ...prev, deviceId: e.target.value }))}
                                        placeholder="Enter device ID"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="organizationNameInput" className="form-label">
                                        Organization
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="organizationNameInput"
                                        value={deviceFormData.organization}
                                        readOnly
                                        style={{ backgroundColor: "#f8f9fa" }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeviceModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleAddDevice}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Organization Modal */}
            {showAddOrgModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Organization</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddOrgModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="orgNameInput" className="form-label">
                                            Organization Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="orgNameInput"
                                            value={orgFormData.organizationName}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, organizationName: e.target.value }))}
                                            placeholder="Enter organization name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="contactNameInput" className="form-label">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="contactNameInput"
                                            value={orgFormData.contactName}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                                            placeholder="Enter contact name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="emailInput" className="form-label">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="emailInput"
                                            value={orgFormData.email}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="phoneInput" className="form-label">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phoneInput"
                                            value={orgFormData.phoneNo}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, phoneNo: e.target.value }))}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="customerTypeInput" className="form-label">
                                            Customer Type *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="customerTypeInput"
                                            value={orgFormData.customerType}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, customerType: e.target.value }))}
                                        >
                                            <option value="">Select customer type</option>
                                            {
                                                organization.customerType === "Owner" ? (
                                                    <>
                                                        <option value="Patner">Patner</option>
                                                        <option value="End Customer">End Customer</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="End Customer">End Customer</option>
                                                    </>
                                                )
                                            }

                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="addressInput" className="form-label">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressInput"
                                            value={orgFormData.address}
                                            onChange={(e) => setOrgFormData((prev) => ({ ...prev, address: e.target.value }))}
                                            placeholder="Enter address"
                                        />
                                    </div>

                                    <div className="row">
                                        {/* Country Dropdown */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Country</label>
                                            <select
                                                className="form-select"
                                                value={orgFormData.country}
                                                onChange={(e) => handleOrgFormChange("country", e.target.value)}
                                            >
                                                <option value="">Select Country</option>
                                                {Object.keys(locationData).map((country) => (
                                                    <option key={country} value={country}>
                                                        {country}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* State Dropdown */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">State</label>
                                            <select
                                                className="form-select"
                                                value={orgFormData.state}
                                                onChange={(e) => handleOrgFormChange("state", e.target.value)}
                                                disabled={!orgFormData.country}
                                            >
                                                <option value="">Select State</option>
                                                {availableStates.map((state) => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City Dropdown */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">City</label>
                                            <select
                                                className="form-select"
                                                value={orgFormData.city}
                                                onChange={(e) => handleOrgFormChange("city", e.target.value)}
                                                disabled={!orgFormData.state}
                                            >
                                                <option value="">Select City</option>
                                                {availableCities.map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>


                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddOrgModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleAddOrganization}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <form onClick={handleAddUser}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New User</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddUserModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="userNameInput" className="form-label">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="userNameInput"
                                            value={userFormData.username}
                                            onChange={(e) => setUserFormData((prev) => ({ ...prev, username: e.target.value }))}
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="userEmailInput" className="form-label">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="userEmailInput"
                                            value={userFormData.email}
                                            onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="userRoleInput" className="form-label">
                                            User Role *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="userRoleInput"
                                            value={userFormData.userRole}
                                            onChange={(e) => setUserFormData((prev) => ({ ...prev, userRole: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select role</option>
                                            <option value="Executive">Executive</option>
                                            <option value="Engineer">Engineer</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    {/* <div className="mb-3">
                                    <label htmlFor="userStatusInput" className="form-label">
                                        Status *
                                    </label>
                                    <select
                                        className="form-select"
                                        id="userStatusInput"
                                        value={userFormData.status}
                                        onChange={(e) => setUserFormData((prev) => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div> */}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Organization Details Modal */}
            {showViewOrgDetailsModal && selectedOrg && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Organization Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowViewOrgDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Contact Name</strong>
                                        <span className="text-dark">{selectedOrg.customerName}</span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Email</strong>
                                        <span className="text-dark">{selectedOrg.email}</span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Phone Number</strong>
                                        <span className="text-dark">{selectedOrg.phoneNo}</span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Customer Type</strong>
                                        <span className="text-dark">{selectedOrg.customerType}</span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Status</strong>
                                        <span className={`badge ${selectedOrg.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                                            {selectedOrg.status}
                                        </span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">City</strong>
                                        <span className="text-dark">{selectedOrg.state}</span>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <strong className="d-block text-muted">Country</strong>
                                        <span className="text-dark">{selectedOrg.country}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowViewOrgDetailsModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Organization Modal */}
            {showEditOrgModal && selectedOrg && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Organization</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditOrgModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editOrgNameInput" className="form-label">
                                            Organization Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editOrgNameInput"
                                            value={editOrgFormData.organizationName || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, organizationName: e.target.value }))}
                                            placeholder="Enter organization name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editContactNameInput" className="form-label">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editContactNameInput"
                                            value={editOrgFormData.contactName || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                                            placeholder="Enter contact name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editEmailInput" className="form-label">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="editEmailInput"
                                            value={editOrgFormData.email || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, email: e.target.value }))}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editPhoneInput" className="form-label">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="editPhoneInput"
                                            value={editOrgFormData.phoneNo || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, phoneNo: e.target.value }))}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editCustomerTypeInput" className="form-label">
                                            Customer Type *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="editCustomerTypeInput"
                                            value={editOrgFormData.customerType || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, customerType: e.target.value }))}
                                        >
                                            <option value="">Select customer type</option>
                                            <option value="Enterprise">Enterprise</option>
                                            <option value="SMB">SMB</option>
                                            <option value="Startup">Startup</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editStatusInput" className="form-label">
                                            Status *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="editStatusInput"
                                            value={editOrgFormData.status || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editCityInput" className="form-label">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editCityInput"
                                            value={editOrgFormData.city || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, city: e.target.value }))}
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="editCountryInput" className="form-label">
                                            Country *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="editCountryInput"
                                            value={editOrgFormData.country || ""}
                                            onChange={(e) => setEditOrgFormData((prev) => ({ ...prev, country: e.target.value }))}
                                        >
                                            <option value="">Select country</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Germany">Germany</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditOrgModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveEditOrg}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Details Modal */}
            {showViewUserDetailsModal && selectedUser && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">User Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowViewUserDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <strong className="d-block text-muted">Username</strong>
                                    <span className="text-dark">{selectedUser.username}</span>
                                </div>
                                <div className="mb-3">
                                    <strong className="d-block text-muted">Email</strong>
                                    <span className="text-dark">{selectedUser.email}</span>
                                </div>
                                <div className="mb-3">
                                    <strong className="d-block text-muted">User Role</strong>
                                    <span className="text-dark">{selectedUser.userRole}</span>
                                </div>
                                <div className="mb-3">
                                    <strong className="d-block text-muted">Status</strong>
                                    <span className={`badge ${selectedUser.status === "Active" ? "bg-success" : "bg-danger"}`}>
                                        {selectedUser.status}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    <strong className="d-block text-muted">Created On</strong>
                                    <span className="text-dark">{selectedUser.createdOn}</span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowViewUserDetailsModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && selectedUser && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditUserModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="editUserNameInput" className="form-label">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="editUserNameInput"
                                        value={editUserFormData.username || ""}
                                        onChange={(e) => setEditUserFormData((prev) => ({ ...prev, username: e.target.value }))}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editUserEmailInput" className="form-label">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="editUserEmailInput"
                                        value={editUserFormData.email || ""}
                                        onChange={(e) => setEditUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editUserRoleInput" className="form-label">
                                        User Role *
                                    </label>
                                    <select
                                        className="form-select"
                                        id="editUserRoleInput"
                                        value={editUserFormData.userRole || ""}
                                        onChange={(e) => setEditUserFormData((prev) => ({ ...prev, userRole: e.target.value }))}
                                    >
                                        <option value="">Select role</option>
                                        <option value="Executive">Executive</option>
                                        <option value="Engineer">Engineer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editUserStatusInput" className="form-label">
                                        Status *
                                    </label>
                                    <select
                                        className="form-select"
                                        id="editUserStatusInput"
                                        value={editUserFormData.status || ""}
                                        onChange={(e) => setEditUserFormData((prev) => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditUserModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveEditUser}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default OrganizationDetail
