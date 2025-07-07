import axios from "axios"
import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MyNavbar from "../Component/Navbar/Navbar"

// Mock data (keeping it commented out as in your original)
// const mockOrganizations = [...]

// Location data for cascading dropdowns (keeping as is)
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
}

const defaultColumns = {
  organizationName: true,
  contactName: true,
  email: true,
  phoneNo: true,
  customerType: true,
  status: true,
  city: true,
  country: true,
}

export default function Component() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("Active")
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)

  // Form and Edit state
  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    phoneNo: "",
    email: "",
    customerType: "",
    address: "",
    country: "",
    state: "",
    city: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingOrgId, setEditingOrgId] = useState(null) // This will store the *local UI ID* during edit
  const [formErrors, setFormErrors] = useState({})

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const searchMatch =
        searchTerm === "" ||
        org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.phoneNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.country.toLowerCase().includes(searchTerm.toLowerCase())

      const customerTypeMatch = customerTypeFilter === "all" || org.customerType === customerTypeFilter
      const statusMatch = activeTab === "all" || org.status === activeTab

      return searchMatch && customerTypeMatch && statusMatch
    })
  }, [organizations, searchTerm, customerTypeFilter, activeTab])

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
    organizationName: "Organization Name",
    contactName: "Contact Name",
    email: "Email",
    phoneNo: "Phone Number",
    customerType: "Customer Type",
    status: "Status",
    city: "City",
    country: "Country",
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

    if (!formData.organizationName.trim()) {
      errors.organizationName = "Organization name is required"
    }

    if (!formData.contactName.trim()) {
      errors.contactName = "Contact name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.customerType) {
      errors.customerType = "Customer type is required"
    }

    const existingOrg = organizations.find(
      (org) => org.email.toLowerCase() === formData.email.toLowerCase() && org.id !== editingOrgId,
    )
    if (existingOrg) {
      errors.email = "This email is already in use"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      organizationName: "",
      contactName: "",
      phoneNo: "",
      email: "",
      customerType: "",
      address: "",
      country: "",
      state: "",
      city: "",
    })
    setIsEditing(false)
    setEditingOrgId(null)
    setFormErrors({})
  }

  const handleEdit = (org) => {
    setFormData({
      organizationName: org.organizationName,
      contactName: org.contactName,
      phoneNo: org.phoneNo,
      email: org.email,
      customerType: org.customerType,
      address: org.address,
      country: org.country,
      state: org.state,
      city: org.city,
    })
    setIsEditing(true)
    // When editing, set the editingOrgId to the local `id`
    // This is used for validation (excluding the current org from duplicate email check)
    setEditingOrgId(org.id) 
    setFormErrors({})

    // Wait for Bootstrap to load before trying to use it
    const showModal = () => {
      const modalElement = document.getElementById("addOrganizationModal")
      if (window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement)
        modal.show()
      } else {
        // Fallback for when Bootstrap JS isn't loaded yet
        modalElement.classList.add("show")
        modalElement.style.display = "block"
        modalElement.setAttribute("aria-hidden", "false")
        document.body.classList.add("modal-open")

        // Add backdrop
        const backdrop = document.createElement("div")
        backdrop.className = "modal-backdrop fade show"
        document.body.appendChild(backdrop)
      }
    }

    setTimeout(showModal, 100)
  }

  const handleAddNew = () => {
    resetForm()

    const showModal = () => {
      const modalElement = document.getElementById("addOrganizationModal")
      if (window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement)
        modal.show()
      } else {
        // Fallback for when Bootstrap JS isn't loaded yet
        modalElement.classList.add("show")
        modalElement.style.display = "block"
        modalElement.setAttribute("aria-hidden", "false")
        document.body.classList.add("modal-open")

        // Add backdrop
        const backdrop = document.createElement("div")
        backdrop.className = "modal-backdrop fade show"
        document.body.appendChild(backdrop)
      }
    }

    setTimeout(showModal, 100)
  }

  
const handleSubmit = async () => {
    if (!validateForm()) {
        return; // Stop if form validation fails
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        console.error("Access token not found. Please log in.");
        alert("Authentication required. Please log in.");
        localStorage.clear();
        navigate("/"); // Redirect to login
        return;
    }

    try {
        if (isEditing && editingOrgId !== null) {
            // --- API CALL FOR UPDATING EXISTING ORGANIZATION ---
            const updatePayload = {
                organizationName: formData.organizationName,
                contactName: formData.contactName,
                phoneNo: formData.phoneNo, // Make sure your form's state uses 'phoneNo'
                email: formData.email,
                customerType: formData.customerType,
                address: formData.address,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                objectId: editingOrgId, 
            };
            console.log("Updating organization with payload:", updatePayload);

            const response = await axios.patch( // PATCH or PUT based on your backend
                `http://62.72.13.179:5000/organization/edit/`, // Your organization edit endpoint
                updatePayload, // Sending JSON payload
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json", // Correct for JSON payload
                    },
                }
            );

            console.log("Organization updated successfully:", response.data);
            alert("Organization updated successfully!");

            await fetchOrganization(); // Re-fetch all organizations to update the list
        } else {
            // --- API CALL FOR CREATING NEW ORGANIZATION ---
            const newOrganizationPayload = {
                organizationName: formData.organizationName,
                contactName: formData.contactName,
                phoneNo: formData.phoneNo, 
                email: formData.email,
                customerType: formData.customerType,
                address: formData.address,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                status: "Active", 
            };
            console.log("Creating new organization with payload:", newOrganizationPayload);

            const response = await axios.post(
                "http://62.72.13.179:5000/organization/add/", // Your organization add endpoint
                newOrganizationPayload, // Sending JSON payload
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json", // Correct for JSON payload
                    },
                }
            );

            console.log("New organization created successfully:", response.data);
            alert("Organization added successfully!");

            await fetchOrganization(); // Re-fetch all organizations to update the list
        }
    } catch (error) {
        console.error("Error submitting organization data:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to save organization. Please try again.";
        alert(`Error: ${errorMessage}`);

        if (error.response?.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.clear();
            navigate("/"); // Redirect on 401
        }
    } finally {
        // These run regardless of success or failure in the try/catch blocks
        resetForm();
        handleModalClose();
    }
};

  const handleModalClose = () => {
    resetForm()

    const modalElement = document.getElementById("addOrganizationModal")
    if (window.bootstrap && window.bootstrap.Modal) {
      const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement)
      if (bootstrapModal) {
        bootstrapModal.hide()
      }
    } else {
      // Fallback modal close
      modalElement.classList.remove("show")
      modalElement.style.display = "none"
      modalElement.setAttribute("aria-hidden", "true")
      document.body.classList.remove("modal-open")
      const backdrop = document.querySelector(".modal-backdrop")
      if (backdrop) backdrop.remove()
    }
  }

  const handleToggleOrganizationStatus = async (organization) => {
    // organization object should contain at least { objectId: string, status: string }
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

    // Determine the action based on the organization's current status
    if (organization.status === "Active") {
        // If currently Active, the action is to Inactivate
        endpoint = "http://62.72.13.179:5000/organization/inactivate/";
        successMessage = "Organization inactivated successfully!";
    } else if (organization.status === "Inactive") {
        // If currently Inactive, the action is to Activate
        endpoint = "http://62.72.13.179:5000/organization/activate/";
        successMessage = "Organization activated successfully!";
    } else {
        // Handle any other unexpected status or default to activate if unsure
        console.warn("Unexpected organization status, defaulting to activate:", organization.status);
        endpoint = "http://62.72.13.179:5000/organization/activate/";
        successMessage = "Organization status updated successfully!";
    }

    try {
        const payload = {
            objectId: organization.objectId, // Send the organization's objectId
            // The status change is implied by the endpoint, so no need to send 'status' in payload
        };

        const response = await axios.patch( // Using PATCH as it's common for partial updates/status changes
            endpoint,
            payload, // Sending JSON payload
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json", // Correct for JSON payload
                },
            }
        );

        console.log(`Organization status operation successful:`, response.data);
        alert(successMessage);
        await fetchOrganization(); // Re-fetch organization data to update UI and reflect the change
    } catch (error) {
        console.error("Error updating organization status:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Something went wrong during status update.";
        alert(`Failed to update organization status: ${errorMessage}`);

        // Handle token expiration or unauthorized errors
        if (error.response?.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.clear();
            navigate("/");
        }
    }
};

  const handleNavigateToDetail = (orgObjectId) => { // Changed parameter name to orgObjectId for clarity
    // Navigate to organization detail page with objectId in URL
    navigate(`/organization/${orgObjectId}`)
  }

  const activeOrgCount = useMemo(() => organizations.filter((org) => org.status === "Active").length, [organizations])
  const inactiveOrgCount = useMemo(
    () => organizations.filter((org) => org.status === "Inactive").length,
    [organizations],
  )
  const allOrgCount = organizations.length

  const getTabClass = (tabName) => {
    return `nav-link ${activeTab === tabName ? "active" : ""}`
  }

  // list the org
  const fetchOrganization = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      console.error("Access token not found. Redirecting to login.");
      alert("Authentication required. Please log in.");
      localStorage.clear();
      navigate("/");
      return;
    }

    try {
      const response = await axios.get("http://62.72.13.179:5000/organization/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const mappedData = response.data.map((org) => ({ // Removed index as id will come from objectId
        id: org.objectId, // Use objectId as the primary unique ID for your UI
        organizationName: org.organizationName,
        status: org.status,
        contactName: org.contactName,
        phoneNo: org.phoneNo,
        email: org.email,
        address: org.address,
        city: org.city,
        state: org.state,
        country: org.country,
        customerType: org.customerType,
        objectId: org.objectId, // Keep a reference to the backend's ID
      }));

      setOrganizations(mappedData);
      console.log(mappedData);

    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        localStorage.clear();
        navigate("/");
      }
    }
  };


  useEffect(() => {
    fetchOrganization();
  }, []);

  return (
    <>
    <MyNavbar/>
      <div className="container-fluid p-4" style={{
        marginTop:"10vh"
      }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">Organization Management</h1>
            <p className="text-muted">Manage your organizations and their details</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddNew}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Organization
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
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={customerTypeFilter}
                      onChange={(e) => setCustomerTypeFilter(e.target.value)}
                    >
                      <option value="all">All Customer Types</option>
                      <option value="Partner">Partner</option>
                      <option value="End Customer">End Customer</option>
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
        {/* Results Summary */}
        <div className="row mb-3">
          <div className="col-12">
            <small className="text-muted">
              Showing {filteredOrganizations.length} of {organizations.length} organizations
              {searchTerm && ` matching "${searchTerm}"`}
              {customerTypeFilter !== "all" && ` with customer type "${customerTypeFilter}"`}
              {activeTab !== "all" && ` with status "${activeTab}"`}
            </small>
          </div>
        </div>
        {/* Tabs and Table */}
        <div className="card">
          <div className="card-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={getTabClass("all")} onClick={() => setActiveTab("all")} type="button">
                  All ({allOrgCount})
                </button>
              </li>
              <li className="nav-item">
                <button className={getTabClass("Active")} onClick={() => setActiveTab("Active")} type="button">
                  Active ({activeOrgCount})
                </button>
              </li>
              <li className="nav-item">
                <button className={getTabClass("Inactive")} onClick={() => setActiveTab("Inactive")} type="button">
                  Inactive ({inactiveOrgCount})
                </button>
              </li>
            </ul>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    {visibleColumns.organizationName && <th>Organization Name</th>}
                    {visibleColumns.contactName && <th>Contact Name</th>}
                    {visibleColumns.email && <th>Email</th>}
                    {visibleColumns.phoneNo && <th>Phone Number</th>}
                    {visibleColumns.customerType && <th>Customer Type</th>}
                    {visibleColumns.status && <th>Status</th>}
                    {visibleColumns.city && <th>City</th>}
                    {visibleColumns.country && <th>Country</th>}
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id}>
                      {visibleColumns.organizationName && (
                        <td>
                          <button
                            className="btn btn-link p-0 fw-semibold text-decoration-none"
                            onClick={() => handleNavigateToDetail(org.objectId)} 
                            style={{ color: '#007bff', cursor: 'pointer' }}
                          >
                            {org.organizationName}
                          </button>
                        </td>
                      )}
                      {visibleColumns.contactName && <td>{org.contactName}</td>}
                      {visibleColumns.email && <td>{org.email}</td>}
                      {visibleColumns.phoneNo && <td>{org.phoneNo}</td>}
                      {visibleColumns.customerType && (
                        <td>
                          <span className="badge bg-light text-dark border">{org.customerType}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <span className={`badge ${org.status === "Active" ? "bg-success" : "bg-danger"}`}>
                            {org.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.city && <td>{org.city}</td>}
                      {visibleColumns.country && <td>{org.country}</td>}
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
                              <button className="dropdown-item" onClick={() => handleEdit(org)}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleToggleOrganizationStatus(org)}>
                                <i className="bi bi-building-x me-2"></i>
                                {org.status === "Active" ? "Deactivate" : "Activate"}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrganizations.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        No organizations found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Organization Modal */}
      <div
        className="modal fade"
        id="addOrganizationModal"
        tabIndex={-1}
        aria-labelledby="addOrganizationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addOrganizationModalLabel">
                {isEditing ? "Edit Organization" : "Add New Organization"}
              </h5>
              <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="org-name" className="form-label">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.organizationName ? "is-invalid" : ""}`}
                      id="org-name"
                      value={formData.organizationName}
                      onChange={(e) => handleFormChange("organizationName", e.target.value)}
                      placeholder="Enter organization name"
                    />
                    {formErrors.organizationName && (
                      <div className="invalid-feedback">{formErrors.organizationName}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="contact-name" className="form-label">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.contactName ? "is-invalid" : ""}`}
                      id="contact-name"
                      value={formData.contactName}
                      onChange={(e) => handleFormChange("contactName", e.target.value)}
                      placeholder="Enter contact name"
                    />
                    {formErrors.contactName && <div className="invalid-feedback">{formErrors.contactName}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      value={formData.phoneNo}
                      onChange={(e) => handleFormChange("phoneNo", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="customer-type" className="form-label">
                      Customer Type *
                    </label>
                    <select
                      className={`form-select ${formErrors.customerType ? "is-invalid" : ""}`}
                      id="customer-type"
                      value={formData.customerType}
                      onChange={(e) => handleFormChange("customerType", e.target.value)}
                    >
                      <option value="">Select customer type</option>
                      <option value="Partner">Partner</option>
                      <option value="End Customer">End Customer</option>
                    </select>
                    {formErrors.customerType && <div className="invalid-feedback">{formErrors.customerType}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleFormChange("address", e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="country" className="form-label">
                      Country
                    </label>
                    <select
                      className="form-select"
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleFormChange("country", e.target.value)}
                    >
                      <option value="">Select country</option>
                      {Object.keys(locationData).map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <select
                      className="form-select"
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleFormChange("state", e.target.value)}
                      disabled={!formData.country}
                    >
                      <option value="">Select state</option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <select
                      className="form-select"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      disabled={!formData.state}
                    >
                      <option value="">Select city</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {isEditing ? "Update Organization" : "Save Organization"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}