"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Lock, LogOut, Gauge, Power, Wifi, Eye, EyeOff, Save, Timer } from "lucide-react"
import { useSettings } from "../../Hooks/useSettings"
import { useMQTT } from "../../Hooks/useMQTT"

const SettingsPanel = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [openSections, setOpenSections] = useState({
    thresholds: true,
    control: true,
    mqtt: false,
  })

  const { settings, updateThresholds, updateMqttTopics } = useSettings()
  const { publishCommand } = useMQTT()

  const [thresholds, setThresholds] = useState(settings.thresholds)
  const [mqttTopics, setMqttTopics] = useState(settings.mqttTopics)
  const [deviceStates, setDeviceStates] = useState(settings.deviceStates)
  const [timers, setTimers] = useState(settings.timers)

  const handleAuth = () => {
    if (password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleDeviceToggle = (device, state) => {
    setDeviceStates((prev) => ({ ...prev, [device]: state }))
    publishCommand({ device, action: state ? "ON" : "OFF" })
  }

  const handleTimerSet = (device, time) => {
    setTimers((prev) => ({ ...prev, [device]: time }))
    if (time && deviceStates[device]) {
      publishCommand({ device, action: "ON", timer: time })
    }
  }

  const saveThresholds = () => {
    updateThresholds(thresholds)
    alert("Thresholds saved successfully!")
  }

  const saveMqttConfig = () => {
    updateMqttTopics(mqttTopics)
    alert("MQTT configuration saved successfully!")
  }

  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop">
        <div className="modal show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <Lock size={20} />
                  System Settings
                </h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column align-items-center py-4">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-4 lock-icon">
                    <Lock size={32} className="text-muted" />
                  </div>
                  <h6 className="mb-4">Enter Password to Access Settings</h6>
                  <div className="w-100">
                    <div className="input-group mb-3">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAuth()}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button onClick={handleAuth} className="btn btn-primary w-100 mb-3">
                      Unlock
                    </button>
                    <p className="text-muted text-center small">Default password: admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop">
      <div className="modal show d-block">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header d-flex justify-content-between">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <Gauge size={20} />
                System Settings
              </h5>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-danger btn-sm" onClick={onClose}>
                  <LogOut size={16} className="me-1" />
                  Logout
                </button>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
            </div>
            <div className="modal-body">
              {/* Sensor Threshold Configuration */}
              <div className="card mb-4">
                <div className="card-header bg-light cursor-pointer" onClick={() => toggleSection("thresholds")}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Gauge size={20} />
                      <h6 className="mb-0">Range Value Configuration</h6>
                    </div>
                    {openSections.thresholds ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {openSections.thresholds && (
                  <div className="card-body bg-light bg-opacity-50">
                    {/* pH Level Range */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Gauge size={16} />
                        <h6 className="mb-0">pH Level Range</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Minimum Value</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            value={thresholds.ph.min}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                ph: { ...prev.ph, min: Number.parseFloat(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Maximum Value</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            value={thresholds.ph.max}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                ph: { ...prev.ph, max: Number.parseFloat(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <p className="text-muted small mt-2">Normal range: 6.8-7.6</p>
                    </div>

                    {/* ORP Range */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Gauge size={16} />
                        <h6 className="mb-0">ORP Range (mV)</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Minimum Value</label>
                          <input
                            type="number"
                            className="form-control"
                            value={thresholds.orp.min}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                orp: { ...prev.orp, min: Number.parseInt(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Maximum Value</label>
                          <input
                            type="number"
                            className="form-control"
                            value={thresholds.orp.max}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                orp: { ...prev.orp, max: Number.parseInt(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <p className="text-muted small mt-2">Normal range: 250-950 mV</p>
                    </div>

                    {/* Temperature Range */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Gauge size={16} />
                        <h6 className="mb-0">Temperature Range (°C)</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Minimum Value</label>
                          <input
                            type="number"
                            className="form-control"
                            value={thresholds.temperature.min}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                temperature: { ...prev.temperature, min: Number.parseInt(e.target.value) },
                              }))
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Maximum Value</label>
                          <input
                            type="number"
                            className="form-control"
                            value={thresholds.temperature.max}
                            onChange={(e) =>
                              setThresholds((prev) => ({
                                ...prev,
                                temperature: { ...prev.temperature, max: Number.parseInt(e.target.value) },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <p className="text-muted small mt-2">Normal range: 26-32°C</p>
                    </div>

                    <button onClick={saveThresholds} className="btn btn-primary w-100">
                      <Save size={16} className="me-2" />
                      Save Range Configuration
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Control Panel */}
              <div className="card mb-4">
                <div className="card-header bg-light cursor-pointer" onClick={() => toggleSection("control")}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Power size={20} />
                      <h6 className="mb-0">Control Panel</h6>
                    </div>
                    {openSections.control ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {openSections.control && (
                  <div className="card-body bg-light bg-opacity-50">
                    {Object.entries(settings.devices).map(([key, device]) => (
                      <div
                        key={key}
                        className="d-flex justify-content-between align-items-center p-3 border rounded mb-3"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <device.icon size={20} />
                          <span className="fw-medium">{device.name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={deviceStates[key] || false}
                              onChange={(e) => handleDeviceToggle(key, e.target.checked)}
                            />
                            <label className="form-check-label small">Turn ON</label>
                          </div>
                          {device.hasTimer && (
                            <div className="d-flex align-items-center gap-2">
                              <Timer size={16} />
                              <input
                                type="text"
                                className="form-control form-control-sm timer-input"
                                placeholder="HH:MM"
                                value={timers[key] || ""}
                                onChange={(e) => setTimers((prev) => ({ ...prev, [key]: e.target.value }))}
                              />
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleTimerSet(key, timers[key] || "")}
                              >
                                Set
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MQTT Topics Configuration */}
              <div className="card">
                <div className="card-header bg-light cursor-pointer" onClick={() => toggleSection("mqtt")}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Wifi size={20} />
                      <h6 className="mb-0">MQTT Topics Configuration</h6>
                    </div>
                    {openSections.mqtt ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {openSections.mqtt && (
                  <div className="card-body bg-light bg-opacity-50">
                    <div className="mb-4">
                      <label className="form-label">Topic for Reading Sensor Data</label>
                      <input
                        type="text"
                        className="form-control"
                        value={mqttTopics.read}
                        onChange={(e) => setMqttTopics((prev) => ({ ...prev, read: e.target.value }))}
                      />
                      <p className="text-muted small mt-1">This topic receives all sensor data</p>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Topic for Sending Control Commands</label>
                      <input
                        type="text"
                        className="form-control"
                        value={mqttTopics.write}
                        onChange={(e) => setMqttTopics((prev) => ({ ...prev, write: e.target.value }))}
                      />
                      <p className="text-muted small mt-1">This topic sends control commands</p>
                    </div>

                    <button onClick={saveMqttConfig} className="btn btn-primary w-100">
                      <Save size={16} className="me-2" />
                      Save MQTT Configuration
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
