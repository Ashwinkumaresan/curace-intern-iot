"use client"

import { useState, useEffect } from "react"

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate MQTT connection status changes
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        setIsConnected((prev) => !prev)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const publishCommand = (command) => {
    console.log("Publishing MQTT command:", command)
    // In a real implementation, this would publish to an MQTT broker
  }

  return { isConnected, publishCommand }
}
