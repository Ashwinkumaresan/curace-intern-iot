import { useState, useEffect } from "react"

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState({
    ph: 7.2,
    orp: 692.75,
    temperature: 28.9,
    ozoneLevel: 196.42,
  })

  const [systemStatus, setSystemStatus] = useState({
    power: true,
    filtration: true,
    ozone: true,
  })

  useEffect(() => {
    // Simulate real-time sensor data updates
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ph: prev.ph + (Math.random() - 0.5) * 0.1,
        orp: prev.orp + (Math.random() - 0.5) * 10,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        ozoneLevel: prev.ozoneLevel + (Math.random() - 0.5) * 5,
      }))

      // Occasionally toggle power status for demonstration
      if (Math.random() < 0.01) {
        setSystemStatus((prev) => ({
          ...prev,
          power: !prev.power,
        }))
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return { sensorData, systemStatus }
}
