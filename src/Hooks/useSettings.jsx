import { useState } from "react"
import { Activity, Filter, Zap, Thermometer, Droplets } from "lucide-react"

export const useSettings = () => {
  const [settings] = useState({
    thresholds: {
      ph: { min: 6.8, max: 7.6 },
      orp: { min: 250, max: 950 },
      temperature: { min: 26, max: 32 },
    },
    mqttTopics: {
      read: "stp/sensors/data",
      write: "stp/control/commands",
    },
    devices: {
      ozone: { name: "Ozone Generator", icon: Activity, hasTimer: true },
      filtration: { name: "Filtration Pump", icon: Filter, hasTimer: true },
      heater: { name: "Pool Heater", icon: Thermometer, hasTimer: false },
      dosing: { name: "Chemical Dosing", icon: Droplets, hasTimer: false },
      uv: { name: "UV Sterilizer", icon: Zap, hasTimer: true },
    },
    deviceStates: {
      ozone: false,
      filtration: true,
      heater: false,
      dosing: false,
      uv: true,
    },
    timers: {
      ozone: "08:00",
      filtration: "06:00",
      uv: "12:00",
    },
  })

  const updateThresholds = (newThresholds) => {
    console.log("Updating thresholds:", newThresholds)
    // In a real implementation, this would save to localStorage or send to server
  }

  const updateMqttTopics = (newTopics) => {
    console.log("Updating MQTT topics:", newTopics)
    // In a real implementation, this would save to localStorage or send to server
  }

  return { settings, updateThresholds, updateMqttTopics }
}
