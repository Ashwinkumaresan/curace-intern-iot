import { useEffect, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Lock,
  LogOut,
  Gauge,
  Power,
  Wifi,
  Eye,
  EyeOff,
  Save,
  Timer,
  Activity,
  Filter,
  Zap,
  Thermometer,
  Droplets,
  TestTube,
  TestTube2Icon,
} from "lucide-react"
import axios from "axios"

const SettingsPanel = ({ onClose, deviceId }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [openSections, setOpenSections] = useState({
    thresholds: true,
    control: true,
    mqtt: false,
  })

  // const { publishCommand } = useMQTT()



  const [formData, setFormData] = useState({
    thresholds: {
      ph: { min: "", max: "" },
      orp: { min: "", max: "" },
      temperature: { min: "", max: "" },
    },
    mqttTopics: {
      read: "",
      write: "",
    },
    devices: {
      oxygenGenerator: { name: "Oxygen Generator", icon: Power },
      ozoneGenerator: { name: "Ozone Generator", icon: Activity },
      ozonePump: { name: "Ozone Pump", icon: Activity },
      filtration: { name: "Filter Feed Pump", icon: Filter },
      backwashvalve: { name: "Backwash Valve", icon: Filter },
      chlorineDosingPump: { name: "Chlorine Dosing Pump", icon: Droplets },
      phDosingPump: { name: "pH Dosing Pump", icon: Droplets },
      flocculantDosingPump: { name: "Flocculant Dosing Pump", icon: TestTube },
      coagulantDosingPump: { name: "Coagulant Dosing Pump", icon: TestTube2Icon },
    },
    deviceStates: {
      oxygenGenerator: false,
      ozoneGenerator: false,
      ozonePump: false,
      filtration: false,
      backwashvalve: false,
      chlorineDosingPump: false,
      phDosingPump: false,
      flocculantDosingPump: false,
      coagulantDosingPump: false,
    },
  });

  // timers: {
  //   ozone: "08:00",
  //   filtration: "06:00",
  //   uv: "12:00",
  // },

  const [thresholds, setThresholds] = useState(formData.thresholds)
  const [mqttTopics, setMqttTopics] = useState(formData.mqttTopics)
  const [deviceStates, setDeviceStates] = useState(formData.deviceStates)
  const [timers, setTimers] = useState(formData.timers)

  const fetchDeviceSettings = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(`https://api.ozopool.in/devices/deviceSetting/`, {
        params: {
          deviceId: deviceId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.data);

      const data = response.data.data;

      // setFormData((prev) => ({
      //   ...prev,
      //   thresholds: {
      //     ph: {
      //       min: data.minimumPh,
      //       max: data.maximumPh,
      //     },
      //     orp: {
      //       min: data.minimumORP,
      //       max: data.maximumORP,
      //     },
      //     temperature: {
      //       min: data.minimumTemperature,
      //       max: data.maximumTemperature,
      //     },
      //   },
      //   mqttTopics: {
      //     read: data.readingMqttTopic || "",
      //     write: data.sendingMqttTopic || "",
      //   },
      //   deviceStates: {
      //     oxygenGenerator: data.deviceOxygenGeneratorOnOff,
      //     ozoneGenerator: data.deviceOzoneGeneratorOnOff,
      //     ozonePump: data.deviceOzonePumpOnOff,
      //     filtration: data.deviceFilterFeedPumpOnOff,
      //     backwashvalve: data.deviceBackwashValveOnOff,
      //     chlorineDosingPump: data.deviceChlorineDosingPumpOnOff,
      //     phDosingPump: data.devicePhDosingPumpOnOff,
      //     flocculantDosingPump: data.deviceFlocculantDosingPumpOnOff,
      //     coagulantDosingPump: data.deviceCoagulantDosingPumpOnOff,
      //   },
      // }));


      const updatedFormData = {
        thresholds: {
          ph: {
            min: data.minimumPh,
            max: data.maximumPh,
          },
          orp: {
            min: data.minimumORP,
            max: data.maximumORP,
          },
          temperature: {
            min: data.minimumTemperature,
            max: data.maximumTemperature,
          },
        },
        mqttTopics: {
          read: data.readingMqttTopic,
          write: data.sendingMqttTopic,
        },
        devices: {
          oxygenGenerator: { name: "Oxygen Generator", icon: Power },
          ozoneGenerator: { name: "Ozone Generator", icon: Activity },
          ozonePump: { name: "Ozone Pump", icon: Activity },
          filtration: { name: "Filter Feed Pump", icon: Filter },
          backwashvalve: { name: "Backwash Valve", icon: Filter },
          chlorineDosingPump: { name: "Chlorine Dosing Pump", icon: Droplets },
          phDosingPump: { name: "pH Dosing Pump", icon: Droplets },
          flocculantDosingPump: { name: "Flocculant Dosing Pump", icon: TestTube },
          coagulantDosingPump: { name: "Coagulant Dosing Pump", icon: TestTube2Icon },
        },
        deviceStates: {
          oxygenGenerator: data.deviceOxygenGeneratorOnOff,
          ozoneGenerator: data.deviceOzoneGeneratorOnOff,
          ozonePump: data.deviceOzonePumpOnOff,
          filtration: data.deviceFilterFeedPumpOnOff,
          backwashvalve: data.deviceBackwashValveOnOff,
          chlorineDosingPump: data.deviceChlorineDosingPumpOnOff,
          phDosingPump: data.devicePhDosingPumpOnOff,
          flocculantDosingPump: data.deviceFlocculantDosingPumpOnOff,
          coagulantDosingPump: data.deviceCoagulantDosingPumpOnOff,
        },
      };

      setFormData(updatedFormData);
      //fetchDeviceSettings()
    } catch (error) {
      console.error("Error fetching device settings:", error);
    }
  };


  useEffect(() => {
    fetchDeviceSettings()
  }, [])

  useEffect(() => {
    if (formData.thresholds) {
      setThresholds(formData.thresholds);
    }
  }, [formData.thresholds]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // const handleDeviceToggle = (device, state) => {
  //   setDeviceStates((prev) => ({ ...prev, [device]: state }))
  //   publishCommand({ device, action: state ? "ON" : "OFF" })
  // }

  // const handleTimerSet = (device, time) => {
  //   setTimers((prev) => ({ ...prev, [device]: time }))
  //   if (time && deviceStates[device]) {
  //     publishCommand({ device, action: "ON", timer: time })
  //   }
  // }

  const apiFieldMap = {
    oxygenGenerator: "deviceOxygenGeneratorOnOff",
    ozoneGenerator: "deviceOzoneGeneratorOnOff",
    ozonePump: "deviceOzonePumpOnOff",
    filtration: "deviceFilterFeedPumpOnOff",
    backwashvalve: "deviceBackwashValveOnOff",
    chlorineDosingPump: "deviceChlorineDosingPumpOnOff",
    phDosingPump: "devicePhDosingPumpOnOff",
    flocculantDosingPump: "deviceFlocculantDosingPumpOnOff",
    coagulantDosingPump: "deviceCoagulantDosingPumpOnOff",
  };

  const handleDeviceToggle = async (key, newValue) => {
    console.log(newValue);

    const apiField = apiFieldMap[key];
    if (!apiField) {
      console.error("Unknown device key:", key);
      return;
    }

    const token = localStorage.getItem("access_token");
    const url = `https://api.ozopool.in/devices/${apiField}/`;

    // now send only `onOff` plus deviceId
    const payload = {
      deviceId,
      onOff: newValue,   // true if checked, false otherwise
    };

    try {
      await axios.patch(
        url,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local formData so the checkbox stays in sync:
      setFormData((prev) => ({
        ...prev,
        deviceStates: {
          ...prev.deviceStates,
          [key]: newValue,
        },
      }));
    } catch (err) {
      console.error(`Toggle failed for ${key}:`, err.response?.data || err);
      alert("Could not update device state.");
    }
  };

  const saveThresholds = () => {
    alert("Thresholds saved successfully!")
    console.log("Updated Thresholds:", thresholds)
  }

  const saveMqttConfig = async () => {
    const token = localStorage.getItem("access_token");
    const payload = {
      mqttTopicRead: mqttTopics.read,
      mqttTopicWrite: mqttTopics.write,
      deviceId,
    };

    try {
      const response = await axios.patch(
        "https://api.ozopool.in/devices/devicemqttconfig/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Settings updated:", response.data);
      // update formData so it's in sync
      setFormData((prev) => ({
        ...prev,
        mqttTopics: { ...mqttTopics },
      }));

      alert("Settings successfully updated on the server.");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    }
  };

  const handlePatchFormData = async () => {
    const updatedFormData = {
      ...formData,
      thresholds: { ...thresholds },
    };

    const payload = {
      minimumPh: updatedFormData.thresholds.ph.min,
      maximumPh: updatedFormData.thresholds.ph.max,
      minimumORP: updatedFormData.thresholds.orp.min,
      maximumORP: updatedFormData.thresholds.orp.max,
      minimumTemperature: updatedFormData.thresholds.temperature.min,
      maximumTemperature: updatedFormData.thresholds.temperature.max,
      deviceId,
    };

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.patch(
        "https://api.ozopool.in/devices/deviceValueConfig/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Settings updated:", response.data);
      alert("Settings successfully updated on the server.");
    } catch (error) {
      console.error("Error updating settings:", error.response.data);
      alert("Failed to update settings.");
    }
  };

  const handleAuth = async () => {
    const token = localStorage.getItem("access_token");

    const formDataPayload = new FormData();
    formDataPayload.append("password", password);

    try {
      const response = await axios.post(
        "https://api.ozopool.in/devices/checkPassword/",
        formDataPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      console.log(response.data);

      if (response.data.checkPassword === "Success") {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Password check failed:", err.response?.data || err);
      alert("Incorrect password.");
    }
  };


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
              {/* Thresholds Section */}
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
                    {["ph", "orp", "temperature"].map((key, idx) => (
                      <div className="mb-4" key={key}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Gauge size={16} />
                          <h6 className="mb-0">
                            {key === "ph"
                              ? "pH Level Range"
                              : key === "orp"
                                ? "ORP Range (mV)"
                                : "Temperature Range (°C)"}
                          </h6>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Minimum Value</label>
                            <input
                              type="text"
                              step={key === "ph" ? "0.1" : "1"}
                              className="form-control"
                              value={thresholds[key].min}
                              onChange={(e) =>
                                setThresholds((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    min: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Maximum Value</label>
                            <input
                              type="text"
                              step={key === "ph" ? "0.1" : "1"}
                              className="form-control"
                              value={thresholds[key].max}
                              onChange={(e) =>
                                setThresholds((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    max: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                        <p className="text-muted small mt-2">
                          Normal range:{" "}
                          {key === "ph" ? "6.8-7.6" : key === "orp" ? "250-950 mV" : "26-32°C"}
                        </p>
                      </div>
                    ))}

                    <button onClick={handlePatchFormData} className="btn btn-primary w-100">
                      <Save size={16} className="me-2" />
                      Save Range Configuration
                    </button>
                  </div>
                )}
              </div>

              {/* Control Panel Section */}
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
                    {Object.entries(formData.devices).map(([key, device]) => (
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
                              checked={formData.deviceStates[key]}
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

              {/* MQTT Section */}
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
                        value={formData.mqttTopics.read}
                        onChange={(e) => setMqttTopics((prev) => ({ ...prev, read: e.target.value }))}
                      />
                      <p className="text-muted small mt-1">This topic receives all sensor data</p>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Topic for Sending Control Commands</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.mqttTopics.write}
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
