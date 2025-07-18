import { useEffect, useState } from "react"
import {
  Settings,
  User,
  Droplets,
  Zap,
  Thermometer,
  Activity,
  Shield,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react"
import SettingsPanel from "./SettingsPanel"
import HistoryChart from "./HistoryChart"
import { useMQTT } from "../../Hooks/useMQTT"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const Dashboard = ({ deviceId }) => {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [showChart, setShowChart] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [deviceData, setDeviceData] = useState({
    ph: 0,
    orp: 0,
    ozoneLevel: 0,
    temperature: 0,
    minimumPh: 0,
    maximumPh: 0,
    minimumORP: 0,
    maximumORP: 0,
    minimumTemperature: 0,
    maximumTemperature: 0,
    user_id: "",
    power: false
  })

  const fetchDeviceDetails = async () => {
    //console.log(deviceId);

    const accessToken = localStorage.getItem("access_token")
    //console.log(accessToken)
    if (!accessToken) {
      //console.error("Access token not found. Please log in.")
      alert("Authentication required. Please log in.")
      localStorage.clear()
      navigate("/")
      setLoading(false)
      return
    }
    try {
      const response = await axios.get("https://api.ozopool.in/devices/detail/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: { deviceId: deviceId }
      })
      //console.log(response.data)
      const combinedData = {
        user_id: response.data.user_id,
        ...response.data.data
      }
      setDeviceData(combinedData)
      setIsConnected(true)

    } catch (err) {
      setIsConnected(false)
      //console.error("Error fetching device details:", err.response?.data || err.message)
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.")
        localStorage.clear()
        // You can call onNavigateBack or handle navigation as needed
      }
    }
  }

  useEffect(() => {
    fetchDeviceDetails()
  }, [])
  useEffect(() => {
    if (deviceData) {
      //console.log("User ID:", deviceData.user_id)
      //console.log("PH:", deviceData.ph)
      //console.log("ORP:", deviceData.orp)
      //console.log("Ozone Level:", deviceData.ozoneLevel)
    }
  }, [deviceData])




  const getStatusColor = (value, type) => {
    if (!deviceData) return "bg-secondary";
    const thresholds = {
      ph: {
        min: deviceData.minimumPh,
        max: deviceData.maximumPh,
      },
      orp: {
        min: deviceData.minimumORP,
        max: deviceData.maximumORP,
      },
      temperature: {
        min: deviceData.minimumTemperature,
        max: deviceData.maximumTemperature,
      }

    }
    const threshold = thresholds[type]
    if (!threshold) return "bg-success"

    if (value < threshold.min || value > threshold.max || value == 0) {
      return "bg-danger"
    } else if (value < threshold.min + 0.2 || value > threshold.max - 0.2) {
      return "bg-warning"
    }
    return "bg-success"
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="min-vh-100 bg-light p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold text-dark mb-1">STP Control Dashboard</h1>
          <p className="text-muted mb-0">Ozone-based Swimming Pool Treatment</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <p className="small text-muted mb-0">Last Update</p>
            <p className="fw-semibold mb-0">{formatTime(new Date())}</p>
          </div>
          <button className="btn text-secondary btn-sm" onClick={() => setShowSettings(true)}>
            <Settings size={25} />
          </button>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Pool Health */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className="card bg-success text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer"
            onClick={() => setShowChart({ type: "poolHealth", title: "Pool Health History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white bg-opacity-75 rounded-circle status-dot"></div>
                  <span className="small opacity-75">Pool Health</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">Excellent</div>
              <div className="small opacity-75">All systems optimal</div>
            </div>
          </div>
        </div>

        {/* pH Level */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className={`card ${getStatusColor(deviceData.ph, "ph")} text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer`}
            onClick={() => setShowChart({ type: "ph", title: "pH Level History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Droplets size={20} />
                  <span className="small opacity-75">pH Level</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">{deviceData.ph.toFixed(1)}</div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>

        {/* ORP */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className={`card ${getStatusColor(deviceData.orp, "orp")} text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer`}
            onClick={() => setShowChart({ type: "orp", title: "ORP History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Zap size={20} />
                  <span className="small opacity-75">ORP</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">
                {deviceData.orp.toFixed(2)} <span className="small fw-normal">mV</span>
              </div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className={`card ${getStatusColor(deviceData.temperature, "temperature")} text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer`}
            onClick={() => setShowChart({ type: "temperature", title: "Temperature History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Thermometer size={20} />
                  <span className="small opacity-75">Temperature</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">
                {deviceData.temperature.toFixed(1)} <span className="small fw-normal">°C</span>
              </div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>

        {/* O3 Gen */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className="card bg-success text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer"
            onClick={() => setShowChart({ type: "ozone", title: "O3 Gen History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Activity size={20} />
                  <span className="small opacity-75">O3 Gen</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">
                {deviceData.ozoneLevel.toFixed(2)} <span className="small fw-normal">W</span>
              </div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>

        {/* Power Status */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className={`card ${deviceData.power ? "bg-success" : "bg-danger"} text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer`}
            onClick={() => setShowChart({ type: "power", title: "Power Status History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white bg-opacity-75 rounded-circle status-dot"></div>
                  <span className="small opacity-75">Power</span>
                </div>
                <div className="bg-white bg-opacity-75 rounded-circle status-dot"></div>
              </div>
              <div className="h4 fw-bold mb-1">{deviceData.power ? "ON" : "OFF"}</div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="col-6 col-lg-3"  style={{
          height:"30vh"
        }}>
          <div
            className="card bg-success text-white py-3 px-2 fs-4 border-0 shadow-sm h-100 cursor-pointer"
            onClick={() => setShowChart({ type: "system", title: "System Status History" })}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Shield size={20} />
                  <span className="small opacity-75">System Status</span>
                </div>
                <CheckCircle size={20} />
              </div>
              <div className="h4 fw-bold mb-1">Healthy</div>
              <div className="small opacity-75">{formatTime(new Date())}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {/* <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm bg-white bg-opacity-75">
            <div className="card-header bg-transparent border-0 pb-2">
              <div className="d-flex align-items-center gap-2">
                <Filter size={20} className="text-primary" />
                <h5 className="card-title mb-0">Filtration Tracking</h5>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success rounded-circle status-dot"></div>
                  <span className="fw-medium">Filtration Running</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <Clock size={16} className="text-muted" />
                  <span className="small text-muted">2:48 Current Run</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <Clock size={16} className="text-muted" />
                  <span className="small text-muted">Last Run: 14:30</span>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Daily Progress</span>
                    <span className="fw-medium">7:45 / 06:00</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div className="progress-bar bg-success" style={{ width: "100%" }}></div>
                  </div>
                  <p className="small text-muted mt-1 mb-0">100% of minimum daily filtration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm bg-white bg-opacity-75">
            <div className="card-header bg-transparent border-0 pb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <AlertTriangle size={20} className="text-warning" />
                  <h5 className="card-title mb-0">System Alarms</h5>
                </div>
                <div className="text-end">
                  <p className="small text-muted mb-0">Ozone Power</p>
                  <p className="fw-semibold mb-0">{deviceData.ozoneLevel.toFixed(2)}W</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column align-items-center justify-content-center py-4">
                <CheckCircle size={48} className="text-success mb-3" />
                <p className="h6 text-dark mb-0">All systems normal</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* MQTT Connection Status */}
      <div className="position-fixed bottom-0 end-0 m-3">
        <span className={`badge ${isConnected ? "bg-success" : "bg-danger"} px-3 py-2`}>
          MQTT: {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} deviceId={deviceId} />}

      {/* History Chart Modal */}
      {/* {showChart && <HistoryChart type={showChart.type} title={showChart.title} onClose={() => setShowChart(null)} />} */}
    </div>
  )
}

export default Dashboard
