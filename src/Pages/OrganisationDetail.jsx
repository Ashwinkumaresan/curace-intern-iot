import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const OrganizationDetail = ({ id }) => {
    const [organization, setOrganization] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAddDeviceModal, setShowAddDeviceModal] = useState(false)
    const [statusChangeModal, setStatusChangeModal] = useState({ show: false, newStatus: null })

    const [deviceFormData, setDeviceFormData] = useState({
        deviceId: "",
        organization: "",
    })

    const navigate = useNavigate()

    // Helper for navigation back to organizations
    const onNavigateBack = useCallback(() => {
        navigate("/organization")
    }, [navigate])

    // Helper for navigation to edit page
    const onNavigateToEdit = useCallback(
        (id) => {
            navigate(`/organizations/edit/${id}`) // Assuming this is your organization edit route
        },
        [navigate]
    )

    //fetch organization data
    const fetchOrganizationData = async () => { // Still a regular async function
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem("access_token");
        console.log(accessToken);

        if (!accessToken) {
            console.error("Access token not found. Please log in.");
            alert("Authentication required. Please log in.");
            localStorage.clear();
            navigate("/");
            setLoading(false);
            return;
        }

        try {
            // --- CHANGE IS HERE: Using the 'params' option for GET request ---
            // Remove the FormData creation, as it's not needed for GET with params.
            const response = await axios.get("http://62.72.13.179:5000/organization/detail/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json", // Still good to send for consistency, though less critical for GET
                },
                params: { // This object defines the query parameters for the URL
                    objectId: id // This will be sent as ?objectId=your_id_value
                }
            });
            // ------------------------------------------------------------------

            setOrganization(response.data);
            setDeviceFormData((prev) => ({ ...prev, organization: response.data.organizationName }));
        } catch (err) {
            console.error("Error fetching organization details:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to load organization details.");
            // if (err.response?.status === 401) {
            //     alert("Session expired. Please log in again.");
            //     localStorage.clear();
            //     navigate("/");
            // }
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------------------------------
    // Regarding useEffect dependencies:
    // Since fetchOrganizationData is now a regular function and not memoized by useCallback,
    // it will be re-created on every render.
    // If you include it in the useEffect dependency array, the effect will run on every render.
    // If you omit it, ESLint might warn, and you might have stale closures if it uses other state/props
    // that aren't in the dependency array (though 'id' and 'navigate' are present here).

    // Given the current structure, this useEffect is okay:
    useEffect(() => {
        console.log("2. useEffect running. ID for condition:", id, "Condition result:", !!id);
        if (id) {
            fetchOrganizationData(); // Call the function
        }
    }, [id, navigate]); // Dependencies: 'id' because the fetch depends on it, 'navigate' because the function uses it.
    // fetchOrganizationData is implicitly a dependency because it's defined in the same scope,
    // but explicitly including it would cause an infinite loop without useCallback.
    // The current setup relies on 'id' and 'navigate' being the only triggers for re-fetching.


    // status change
    const handleStatusChange = (newStatus) => {
        setStatusChangeModal({ show: true, newStatus })
    }

    // active or inactive
    const confirmStatusChange = async () => {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
            console.error("Access token not found. Please log in.")
            alert("Authentication required. Please log in.")
            localStorage.clear()
            navigate("/")
            return
        }

        let endpoint = ""
        let successMessage = ""
        const organizationId = organization.id

        if (statusChangeModal.newStatus === "Active") {
            endpoint = `http://62.72.13.179:5000/organizations/activate`
            successMessage = `Organization ${organization.organizationName} activated successfully!`
        } else if (statusChangeModal.newStatus === "Inactive") {
            endpoint = `http://62.72.13.179:5000/organizations/inactivate`
            successMessage = `Organization ${organization.organizationName} inactivated successfully!`
        } else {
            alert("Invalid status selected.")
            setStatusChangeModal({ show: false, newStatus: null })
            return
        }

        try {
            const response = await axios.post(
                endpoint,
                { organizationId: organization.id },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            )

            console.log(`Organization status updated:`, response.data)
            alert(successMessage)
            // Optimistically update the UI, then re-fetch for full consistency
            setOrganization((prev) => ({
                ...prev,
                status: statusChangeModal.newStatus,
            }))
            setStatusChangeModal({ show: false, newStatus: null })
            await fetchOrganizationData() // Re-fetch data to ensure UI is fully synced
        } catch (error) {
            console.error("Error updating organization status:", error.response?.data || error.message)
            const errorMessage = error.response?.data?.message || "Something went wrong during status update."
            alert(`Failed to update organization status: ${errorMessage}`)
            if (error.response?.status === 401) {
                localStorage.clear()
                navigate("/")
            }
        }
    }

    // add device
    const handleAddDevice = async () => {
        if (!deviceFormData.deviceId) {
            alert("Please enter a device ID")
            return
        }

        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
            console.error("Access token not found. Please log in.")
            alert("Authentication required. Please log in.")
            localStorage.clear()
            navigate("/")
            return
        }

        try {
            // Assuming your API endpoint for adding a device is something like /devices/add
            const response = await axios.post(
                "http://62.72.13.179:5000/devices/add", // **Correct this URL if it's different**
                {
                    deviceId: deviceFormData.deviceId,
                    organizationId: organization.id, // Send the actual organization ID
                    // Include other necessary fields for device creation as per your API
                    customer: deviceFormData.organization, // This might be derived on the backend from organizationId
                    city: organization.city,
                    state: organization.state,
                    poolStatus: "Good", // Default status, or make it configurable
                    createdOn: new Date().toISOString().split("T")[0], // Or let the backend handle creation date
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            )

            console.log("Device added successfully:", response.data)
            alert(`Device ${deviceFormData.deviceId} added successfully!`)
            setShowAddDeviceModal(false)
            setDeviceFormData({ deviceId: "", organization: organization.organizationName })
            await fetchOrganizationData() // Re-fetch organization data to update the devices list and statistics
        } catch (error) {
            console.error("Error adding device:", error.response?.data || error.message)
            const errorMessage = error.response?.data?.message || "Failed to add device."
            alert(`Failed to add device: ${errorMessage}`)
            if (error.response?.status === 401) {
                localStorage.clear()
                navigate("/")
            }
        }
    }

    // loading
    if (loading) {
        return (
            <div className="container-fluid p-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    // if ungot error
    if (error) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    <h4>Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={onNavigateBack}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Organizations
                    </button>
                </div>
            </div>
        )
    }

    // if org not found
    if (!organization) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning">
                    <h4>Organization not found</h4>
                    <p>The requested organization could not be found.</p>
                    <button className="btn btn-primary" onClick={onNavigateBack}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Organizations
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="container-fluid p-4 w-100">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div
                            className="d-flex align-items-center justify-content-between rounded-1 row m-0"
                            style={{
                                background: "linear-gradient(to right, #007bff, #0056b3)",
                                color: "white",
                                padding: "1rem",
                                boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1)",
                                position: "sticky",
                                top: "0",
                                zIndex: "99",
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-start col-12 col-md-8">
                                <button className="btn text-white me-1 fs-3" onClick={onNavigateBack}>
                                    <i className="bi bi-arrow-left"></i>
                                </button>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-1 p-1 me-1">
                                        <i className="bi bi-building fs-1"></i>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h2 className="mb-0 fw-bold fs-3">{organization.organizationName}</h2>
                                            <span className="ms-2">{organization.customerType}</span>
                                        </div>
                                        <p className="text-white-50 mb-0">Associated Partner: {organization.associatedPartner}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 col-12 col-md-4 mt-3 mt-md-0 justify-content-md-end">
                                {/* Status Dropdown */}
                                <div className="dropdown">
                                    <button
                                        className={`btn dropdown-toggle ${organization.status === "Active" ? "btn-success" : "btn-danger"} rounded-1 px-4 py-2`}
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

                                {/* Actions Dropdown */}
                                <div className="dropdown">
                                    <button
                                        className="btn btn-outline-light dropdown-toggle rounded-1 px-4 py-2"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                    >
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
                        <div className="row mt-4">
                            {/* Left Column */}
                            <div className="col-lg-4">
                                {/* Statistics Card */}
                                <div className="card mb-4 shadow-sm rounded-1">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold text-secondary">
                                            <i className="bi bi-graph-up me-2"></i>
                                            Statistics
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row text-center">
                                            <div className="col-4">
                                                <div className="border-end py-3">
                                                    <i className="bi bi-laptop fs-3 text-primary mb-2"></i>
                                                    <h3 className="text-primary mb-0">{organization.statistics.totalDevices}</h3>
                                                    <small className="text-muted">Total Devices</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="border-end py-3">
                                                    <i className="bi bi-check-circle fs-3 text-success mb-2"></i>
                                                    <h3 className="text-success mb-0">{organization.statistics.activeDevices}</h3>
                                                    <small className="text-muted">Active Devices</small>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="py-3">
                                                    <i className="bi bi-exclamation-triangle fs-3 text-warning mb-2"></i>
                                                    <h3 className="text-warning mb-0">{organization.statistics.needAttention}</h3>
                                                    <small className="text-muted">Need Attention</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Card */}
                                <div className="card mb-4 shadow-sm rounded-1">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold text-secondary">
                                            <i className="bi bi-person-circle me-2"></i>
                                            Contact Information
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-person me-3 text-muted"></i>
                                            <div>
                                                <strong className="d-block">Contact Name</strong>
                                                <span className="text-secondary">{organization.contactName}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-envelope me-3 text-muted"></i>
                                            <div>
                                                <strong className="d-block">Email</strong>
                                                <span className="text-secondary">{organization.email}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex align-items-center">
                                            <i className="bi bi-telephone me-3 text-muted"></i>
                                            <div>
                                                <strong className="d-block">Phone</strong>
                                                <span className="text-secondary">{organization.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div
                                className="col-lg-8"
                                style={{
                                    marginBottom: "200px",
                                }}
                            >
                                {/* Devices Section */}
                                <div className="card mb-4 shadow-sm rounded-1">
                                    <div className="card-header d-flex justify-content-between align-items-center bg-white py-3 ">
                                        <div>
                                            <h5 className="card-title mb-0 fw-bold text-secondary">Devices</h5>
                                            <small className="text-muted">Devices associated with {organization.organizationName}</small>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAddDeviceModal(true)}>
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
                                                                            : "bg-warning"
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
                                                                            <button className="dropdown-item">View Details</button>
                                                                        </li>
                                                                        <li>
                                                                            <button className="dropdown-item">Edit</button>
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
                                {/* Location Section */}
                                <div className="card shadow-sm rounded-1">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0 fw-bold text-secondary">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <strong className="d-block text-muted">Address</strong>
                                                <span className="text-secondary">{organization.address}</span>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <strong className="d-block text-muted">City</strong>
                                                <span className="text-secondary">{organization.city}</span>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <strong className="d-block text-muted">State</strong>
                                                <span className="text-secondary">{organization.state}</span>
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
                    </div>
                </div>
            </div>

            {/* Status Change Confirmation Modal */}
            {statusChangeModal.show && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                                    Are you sure you want to change the status to **{statusChangeModal.newStatus}**?
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
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Device</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddDeviceModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="deviceIdInput" className="form-label">Device ID</label>
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
                                    <label htmlFor="organizationNameInput" className="form-label">Organization</label>
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
        </>
    )
}

export default OrganizationDetail