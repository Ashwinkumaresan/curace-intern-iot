import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MyNavbar from "../Component/Navbar/Navbar"
import axios from "axios"

// Sample device data
// const sampleDevices = [
//     {
//         id: "DEV-001",
//         deviceId: "DEV-001",
//         customer: "Acme Corporation",
//         city: "New York City",
//         state: "New York",
//         poolStatus: "Excellent",
//         createdOn: "2024-01-15",
//         // objectId: "obj-001",
//         // deviceType: "Pool Monitor",
//         // serialNumber: "SN001234",
//         // installationDate: "2024-01-15",
//         // lastMaintenance: "2024-01-10",
//     },
//     {
//         id: "DEV-002",
//         deviceId: "DEV-002",
//         customer: "Globex Industries",
//         city: "Chicago",
//         state: "Illinois",
//         poolStatus: "Good",
//         createdOn: "2024-01-20",
//         // objectId: "obj-002",
//         // deviceType: "Water Quality Sensor",
//         // serialNumber: "SN001235",
//         // installationDate: "2024-01-20",
//         // lastMaintenance: "2024-01-15",
//     },
//     {
//         id: "DEV-003",
//         deviceId: "DEV-003",
//         customer: "Initech Systems",
//         city: "Austin",
//         state: "Texas",
//         poolStatus: "Need Attention",
//         createdOn: "2024-01-10",
//         // objectId: "obj-003",
//         // deviceType: "pH Controller",
//         // serialNumber: "SN001236",
//         // installationDate: "2024-01-10",
//         // lastMaintenance: "2024-01-05",
//     },
//     {
//         id: "DEV-004",
//         deviceId: "DEV-004",
//         customer: "Umbrella Corporation",
//         city: "San Francisco",
//         state: "California",
//         poolStatus: "Not Recommended",
//         createdOn: "2024-01-25",
//         // objectId: "obj-004",
//         // deviceType: "Chlorine Dispenser",
//         // serialNumber: "SN001237",
//         // installationDate: "2024-01-25",
//         // lastMaintenance: "2024-01-20",
//     },
//     {
//         id: "DEV-005",
//         deviceId: "DEV-005",
//         customer: "Wayne Enterprises",
//         city: "Gotham",
//         state: "New York",
//         poolStatus: "Excellent",
//         createdOn: "2024-01-30",
//         // objectId: "obj-005",
//         // deviceType: "Pool Monitor",
//         // serialNumber: "SN001238",
//         // installationDate: "2024-01-30",
//         // lastMaintenance: "2024-01-25",
//     },
// ]

// const sampleOrganizations = [
//     { id: "org-001", name: "Acme Corporation" },
//     { id: "org-002", name: "Globex Industries" },
//     { id: "org-003", name: "Initech Systems" },
//     { id: "org-004", name: "Umbrella Corporation" },
//     { id: "org-005", name: "Wayne Enterprises" },
//     { id: "org-006", name: "Stark Industries" },
//     { id: "org-007", name: "Oscorp Industries" },
// ]

// Location data for cascading dropdowns
const locationData = {
    "United States": {
        California: ["San Francisco", "Los Angeles", "San Diego", "Sacramento"],
        "New York": ["New York City", "Albany", "Buffalo", "Rochester", "Gotham"],
        Texas: ["Austin", "Houston", "Dallas", "San Antonio"],
        Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
        Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver"],
        Illinois: ["Chicago", "Springfield", "Rockford", "Peoria"],
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
}

const defaultColumns = {
    deviceId: true,
    customer: true,
    city: true,
    state: true,
    poolStatus: true,
    createdOn: true,
}

export default function DeviceManagement() {
    const navigate = useNavigate()
    const [devices, setDevices] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [poolStatusFilter, setPoolStatusFilter] = useState("all")
    const [activeTab, setActiveTab] = useState("All")
    const [visibleColumns, setVisibleColumns] = useState(defaultColumns)

    // Form and Edit state
    //   const [formData, setFormData] = useState({
    //     deviceId: "",
    //     organizationId: "",
    //   })
    const [formData, setFormData] = useState({
        deviceId: "",
        mqttTopic: "",
    });

    const [isEditing, setIsEditing] = useState(false)
    const [editingDeviceId, setEditingDeviceId] = useState(null)
    const [formErrors, setFormErrors] = useState({})

    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            const searchMatch =
                searchTerm === "" ||
                device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.poolStatus.toLowerCase().includes(searchTerm.toLowerCase())

            const poolStatusMatch = poolStatusFilter === "all" || device.poolStatus === poolStatusFilter
            const statusMatch = activeTab === "All" || device.poolStatus === activeTab

            return searchMatch && poolStatusMatch && statusMatch
        })
    }, [devices, searchTerm, poolStatusFilter, activeTab])

    // Get available states based on selected country
    const availableStates = useMemo(() => {
        if (!formData.country || !locationData[formData.country]) return []
        return Object.keys(locationData[formData.country])
    }, [formData.country])

    // Get available cities based on selected state
    const availableCities = useMemo(() => {
        if (!formData.country || !formData.state || !locationData[formData.country]?.[formData.state]) return []
        return locationData[formData.country][formData.state]
    }, [formData.country, formData.state])

    const columnLabels = {
        deviceId: "Device ID",
        customer: "Customer",
        city: "City",
        state: "State",
        poolStatus: "Pool Status",
        createdOn: "Created On",
    }

    const handleColumnVisibilityChange = (column) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }))
    }

    const handleFormChange = (field, value) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value }
            if (field === "country") {
                newData.state = ""
                newData.city = ""
            } else if (field === "state") {
                newData.city = ""
            }
            return newData
        })
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const errors = {}
        if (!formData.deviceId.trim()) {
            errors.deviceId = "Device ID is required"
        }
        // if (!formData.organizationId) {
        //   errors.organizationId = "Organization is required"
        // }
        if (!formData.mqttTopic) {
            errors.mqttTopic = "MQTT Topic is required";
        }


        const existingDevice = devices.find(
            (device) => device.deviceId.toLowerCase() === formData.deviceId.toLowerCase() && device.id !== editingDeviceId,
        )
        if (existingDevice) {
            errors.deviceId = "This device ID is already in use"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const resetForm = () => {
        // setFormData({
        //   deviceId: "",
        //   organizationId: "",
        // })
        setFormData({
            deviceId: "",
            mqttTopic: "",
        });

        setIsEditing(false)
        setEditingDeviceId(null)
        setFormErrors({})
    }

    const handleAddNew = () => {
        resetForm()
        // Use a more reliable method to show the modal
        setTimeout(() => {
            const modalElement = document.getElementById("addDeviceModal")
            if (modalElement) {
                // Try Bootstrap first, then fallback
                if (window.bootstrap?.Modal) {
                    const modal = new window.bootstrap.Modal(modalElement)
                    modal.show()
                } else {
                    // Manual modal show
                    modalElement.style.display = "block"
                    modalElement.classList.add("show")
                    modalElement.setAttribute("aria-hidden", "false")

                    // Add backdrop
                    const backdrop = document.createElement("div")
                    backdrop.className = "modal-backdrop fade show"
                    backdrop.id = "modal-backdrop"
                    document.body.appendChild(backdrop)
                    document.body.classList.add("modal-open")
                }
            }
        }, 50)
    }

    const handleEdit = (device) => {
        // Set only editable fields: state and city (plus country if needed)
        setFormData({
            state: device.state || "",
            city: device.city || "",
            country: device.country || "United States", // fallback if missing
        });

        setIsEditing(true);
        setEditingDeviceId(device.id);
        setFormErrors({});

        // Show the edit modal
        setTimeout(() => {
            const modalElement = document.getElementById("editDeviceModal");
            if (modalElement) {
                if (window.bootstrap?.Modal) {
                    const modal = new window.bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    // Fallback for manual display
                    modalElement.style.display = "block";
                    modalElement.classList.add("show");
                    modalElement.setAttribute("aria-hidden", "false");

                    const backdrop = document.createElement("div");
                    backdrop.className = "modal-backdrop fade show";
                    backdrop.id = "modal-backdrop";
                    document.body.appendChild(backdrop);
                    document.body.classList.add("modal-open");
                }
            }
        }, 50);
    };


    // const handleSubmit = () => {
    //     if (!validateForm()) {
    //         return
    //     }

    //     const selectedOrg = sampleOrganizations.find((org) => org.id === formData.organizationId)
    //     const orgName = selectedOrg ? selectedOrg.name : ""

    //     if (isEditing && editingDeviceId !== null) {
    //         // Update existing device
    //         setDevices((prev) =>
    //             prev.map((device) =>
    //                 device.id === editingDeviceId
    //                     ? {
    //                         ...device,
    //                         deviceId: formData.deviceId,
    //                         // customer: orgName,
    //                     }
    //                     : device,
    //             ),
    //         )
    //         alert("Device updated successfully!")
    //     } else {
    //         // Add new device
    //         const newDevice = {
    //             deviceId: formData.deviceId,
    //             mqttTopic: formData.mqttTopic,
    //             // customer: orgName,
    //             // city: "New York City", // Default values
    //             // state: "New York",
    //             // poolStatus: "Good",
    //             // createdOn: new Date().toISOString().split("T")[0],
    //             // objectId: `obj-${String(devices.length + 1).padStart(3, "0")}`,
    //             // deviceType: "Pool Monitor",
    //             // serialNumber: `SN${String(devices.length + 1).padStart(6, "0")}`,
    //             // installationDate: new Date().toISOString().split("T")[0],
    //             // lastMaintenance: new Date().toISOString().split("T")[0],
    //         }
    //         setDevices((prev) => [...prev, newDevice])
    //         alert("Device added successfully!")
    //     }

    //     resetForm()
    //     handleModalClose()
    // }

    // const handleModalClose = () => {
    //     resetForm()
    //     const modalElement = document.getElementById("addDeviceModal")
    //     if (modalElement) {
    //         if (window.bootstrap?.Modal) {
    //             const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement)
    //             if (bootstrapModal) {
    //                 bootstrapModal.hide()
    //             }
    //         } else {
    //             // Manual modal hide
    //             modalElement.style.display = "none"
    //             modalElement.classList.remove("show")
    //             modalElement.setAttribute("aria-hidden", "true")

    //             // Remove backdrop
    //             const backdrop = document.getElementById("modal-backdrop")
    //             if (backdrop) {
    //                 backdrop.remove()
    //             }
    //             document.body.classList.remove("modal-open")
    //         }
    //     }
    // }

    const handleModalClose = () => {
        resetForm();

        const modalIds = ["addDeviceModal", "editDeviceModal"];

        modalIds.forEach((id) => {
            const modalElement = document.getElementById(id);
            if (modalElement) {
                if (window.bootstrap?.Modal) {
                    const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement);
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    }
                } else {
                    // Manual modal hide
                    modalElement.style.display = "none";
                    modalElement.classList.remove("show");
                    modalElement.setAttribute("aria-hidden", "true");

                    const backdrop = document.getElementById("modal-backdrop");
                    if (backdrop) {
                        backdrop.remove();
                    }
                    document.body.classList.remove("modal-open");
                }
            }
        });
    };


    // const handleToggleDeviceStatus = (device) => {
    //     const statusOptions = ["Excellent", "Good", "Need Attention", "Not Recommended"]
    //     const currentIndex = statusOptions.indexOf(device.poolStatus)
    //     const nextIndex = (currentIndex + 1) % statusOptions.length
    //     const newStatus = statusOptions[nextIndex]

    //     setDevices((prev) => prev.map((d) => (d.id === device.id ? { ...d, poolStatus: newStatus } : d)))
    //     alert(`Device status updated to ${newStatus}`)
    // }

    const handleNavigateToDetail = (deviceId) => {
        // Navigate to device detail page with device ID in URL
        navigate(`/device/details/${deviceId}`)
    }

    const getPoolStatusBadgeClass = (status) => {
        switch (status) {
            case "Excellent":
                return "bg-success"
            case "Good":
                return "bg-primary"
            case "Need Attention":
                return "bg-warning text-dark"
            case "Not Recommended":
                return "bg-danger"
            default:
                return "bg-secondary"
        }
    }

    const excellentCount = useMemo(() => devices.filter((device) => device.poolStatus === "Excellent").length, [devices])
    const goodCount = useMemo(() => devices.filter((device) => device.poolStatus === "Good").length, [devices])
    const needAttentionCount = useMemo(
        () => devices.filter((device) => device.poolStatus === "Need Attention").length,
        [devices],
    )
    const notRecommendedCount = useMemo(
        () => devices.filter((device) => device.poolStatus === "Not Recommended").length,
        [devices],
    )
    const allDeviceCount = devices.length

    const getTabClass = (tabName) => {
        return `nav-link ${activeTab === tabName ? "active" : ""}`
    }

    // list the devices
    const fetchDeviceList = async () => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            console.error("Access token not found. Redirecting to login.");
            alert("Authentication required. Please log in.");
            localStorage.clear();
            navigate("/");
            return;
        }

        try {
            const response = await axios.get("https://api.ozopool.in/devices/list/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const mappedDevices = response.data.map((device) => ({
                id: device.deviceId,
                deviceId: device.deviceId,
                customer: device.customer,
                city: device.city,
                state: device.state,
                poolStatus: device.poolStatus,
                createdOn: device.createdOn,
            }));

            setDevices(mappedDevices);
            console.log(mappedDevices);
        } catch (error) {
            console.error("Error fetching device list:", error.response?.data || error.message);
            if (error.response && error.response.status === 401) {
                alert("Session expired or unauthorized. Please log in again.");
                localStorage.clear();
                navigate("/");
            }
        }
    };

    useEffect(() => {
        fetchDeviceList()
    }, [])

    const handleDeleteDevice = async (device) => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            alert("Authentication required. Please log in.");
            localStorage.clear();
            navigate("/");
            return;
        }

        try {
            const res = await axios.delete("https://api.ozopool.in/devices/delete/", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json", // explicitly set JSON
                },
                data: { deviceId: device.deviceId },
            });

            console.log("Device deleted:", res.data);
            fetchDeviceList()

            // Optional: update UI immediately
            setDevices((prevDevices) =>
                prevDevices.filter((item) => item.deviceId !== device.deviceId)
            );
        } catch (error) {
            console.error("Error deleting device:", error.response?.data || error.message);
            alert("Failed to delete the device.");
        }
    };


    const handleAddDevice = async () => {
        if (!validateForm()) return;

        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            alert("Authentication required. Please log in.");
            localStorage.clear();
            navigate("/");
            return;
        }

        try {
            const payload = {
                deviceId: formData.deviceId,
                mqttTopic: formData.mqttTopic,
            };

            const response = await axios.post("https://api.ozopool.in/devices/add/", payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Device added:", response.data);

            // Add to local UI
            setDevices((prev) => [...prev, payload]);

            alert("Device added successfully!");
            fetchDeviceList()
            resetForm();
            handleModalClose();
        } catch (error) {
            console.error("Error adding device:", error.response?.data || error.message);
            alert("Failed to add device.");
        }
    };


    // const handleEditDevice = () => {
    //     if (!validateForm()) return;

    //     setDevices((prev) =>
    //         prev.map((device) =>
    //             device.id === editingDeviceId
    //                 ? { ...device, state: formData.state, city: formData.city }
    //                 : device
    //         )
    //     );

    //     alert("Device updated successfully!");
    //     resetForm();
    //     handleModalClose();
    // };

    const handleEditDevice = async () => {

  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    alert("Authentication required. Please log in.");
    localStorage.clear();
    navigate("/");
    return;
  }

  try {
    const payload = {
      deviceId: editingDeviceId, // backend should use this to identify device
      state: formData.state,
      city: formData.city,
    };
    console.log(payload);
    

    const response = await axios.patch("https://api.ozopool.in/devices/edit/", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Device updated:", response.data);

    // Update device in UI
    setDevices((prev) =>
      prev.map((device) =>
        device.id === editingDeviceId
          ? { ...device, state: formData.state, city: formData.city }
          : device
      )
    );

    alert("Device updated successfully!");
    fetchDeviceList()
    resetForm();
    handleModalClose();
  } catch (error) {
    console.error("Error updating device:", error.response?.data || error.message);
    alert("Failed to update device.");
  }
};




    return (
        <>
            <MyNavbar />

            <div className="container-fluid p-4" style={{
                marginTop: "10vh"
            }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h2 mb-1">Devices</h1>
                        <p className="text-muted mb-0">Manage your devices here</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                        <i className="bi bi-plus me-2"></i>
                        Add Device
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
                                                placeholder="Search devices..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <select
                                            className="form-select"
                                            value={poolStatusFilter}
                                            onChange={(e) => setPoolStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Pool Status</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Need Attention">Need Attention</option>
                                            <option value="Not Recommended">Not Recommended</option>
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
                                        <i className="bi bi-funnel me-2"></i>
                                        Columns
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: "200px", zIndex: 1050 }}>
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

                {/* Results Summary */}
                <div className="row mb-4">
                    <div className="col-12">
                        <small className="text-muted">
                            Showing {filteredDevices.length} of {devices.length} devices
                            {searchTerm && ` matching "${searchTerm}"`}
                            {poolStatusFilter !== "all" && ` with pool status "${poolStatusFilter}"`}
                            {activeTab !== "All" && ` with status "${activeTab}"`}
                        </small>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        {visibleColumns.deviceId && <th>Device ID</th>}
                                        {visibleColumns.customer && <th>Customer</th>}
                                        {visibleColumns.city && <th>City</th>}
                                        {visibleColumns.state && <th>State</th>}
                                        {visibleColumns.poolStatus && <th>Pool Status</th>}
                                        {visibleColumns.createdOn && <th>Created On</th>}
                                        <th width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.map((device) => (
                                        <tr key={device.id}>
                                            {visibleColumns.deviceId && (
                                                <td>
                                                    <button
                                                        className="btn btn-link p-0 fw-semibold text-decoration-none"
                                                        onClick={() => handleNavigateToDetail(device.deviceId)}
                                                        style={{ color: "#007bff", cursor: "pointer" }}
                                                    >
                                                        {device.deviceId}
                                                    </button>
                                                </td>
                                            )}
                                            {visibleColumns.customer && <td>{device.customer}</td>}
                                            {visibleColumns.city && <td>{device.city}</td>}
                                            {visibleColumns.state && <td>{device.state}</td>}
                                            {visibleColumns.poolStatus && (
                                                <td>
                                                    <span className={`badge ${getPoolStatusBadgeClass(device.poolStatus)}`}>
                                                        {device.poolStatus}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.createdOn && <td>{device.createdOn}</td>}
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
                                                            <button className="dropdown-item" onClick={() => handleEdit(device)}>
                                                                <i className="bi bi-pencil me-2"></i>
                                                                Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            {/* <button
                                                                className="dropdown-item text-warning"
                                                                onClick={() => handleToggleDeviceStatus(device)}
                                                            >
                                                                <i className="bi bi-arrow-repeat me-2"></i>
                                                                Change Status
                                                            </button> */}
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeleteDevice(device)}
                                                            >
                                                                <i className="bi bi-trash me-2"></i>
                                                                Delete
                                                            </button>

                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDevices.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No devices found matching your criteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Device Modal */}
            {/* <div
                className="modal fade"
                id="addDeviceModal"
                tabIndex={-1}
                aria-labelledby="addDeviceModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title" id="addDeviceModalLabel">
                                {isEditing ? "Edit Device" : "Add New Device"}
                            </h5>
                            <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="device-id" className="form-label">
                                        Device ID
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.deviceId ? "is-invalid" : ""}`}
                                        id="device-id"
                                        value={formData.deviceId}
                                        onChange={(e) => handleFormChange("deviceId", e.target.value)}
                                        placeholder="Enter device ID"
                                    />
                                    {formErrors.deviceId && <div className="invalid-feedback">{formErrors.deviceId}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mqtt-topic" className="form-label">
                                        MQTT Topic
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.mqttTopic ? "is-invalid" : ""}`}
                                        id="mqtt-topic"
                                        value={formData.mqttTopic}
                                        onChange={(e) => handleFormChange("mqttTopic", e.target.value)}
                                        placeholder="Enter MQTT Topic"
                                    />
                                    {formErrors.mqttTopic && <div className="invalid-feedback">{formErrors.mqttTopic}</div>}
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}
            <div className="modal fade" id="addDeviceModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title">Add New Device</h5>
                            <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            <form>
                                <div className="mb-3">
                                    <label className="form-label">Device ID</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.deviceId ? "is-invalid" : ""}`}
                                        value={formData.deviceId}
                                        onChange={(e) => handleFormChange("deviceId", e.target.value)}
                                        placeholder="Enter device ID"
                                    />
                                    {formErrors.deviceId && <div className="invalid-feedback">{formErrors.deviceId}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">MQTT Topic</label>
                                    <input
                                        type="text"
                                        className={`form-control ${formErrors.mqttTopic ? "is-invalid" : ""}`}
                                        value={formData.mqttTopic}
                                        onChange={(e) => handleFormChange("mqttTopic", e.target.value)}
                                        placeholder="Enter MQTT Topic"
                                    />
                                    {formErrors.mqttTopic && <div className="invalid-feedback">{formErrors.mqttTopic}</div>}
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddDevice}>Save</button>
                        </div>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="editDeviceModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title">Edit Device Location</h5>
                            <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            <form>
                                <div className="mb-3">
                                    <label className="form-label">State</label>
                                    <select
                                        className="form-select"
                                        value={formData.state}
                                        onChange={(e) => handleFormChange("state", e.target.value)}
                                    >
                                        <option value="">Select State</option>
                                        {Object.entries(locationData[formData.country || "United States"] || {}).map(([state]) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">City</label>
                                    <select
                                        className="form-select"
                                        value={formData.city}
                                        onChange={(e) => handleFormChange("city", e.target.value)}
                                        disabled={!formData.state}
                                    >
                                        <option value="">Select City</option>
                                        {(locationData[formData.country || "United States"]?.[formData.state] || []).map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditDevice}>Update</button>
                        </div>
                    </div>
                </div>
            </div>


        </>
    )
}
