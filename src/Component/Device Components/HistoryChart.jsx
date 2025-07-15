"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"

const HistoryChart = ({ type, title, onClose }) => {
  const [timeRange, setTimeRange] = useState("24h")

  // Mock data - in real implementation, this would come from your database
  const generateMockData = () => {
    const now = new Date()
    const data = []
    const points = timeRange === "1h" ? 60 : timeRange === "6h" ? 72 : timeRange === "24h" ? 96 : 192

    for (let i = points; i >= 0; i--) {
      const time = new Date(
        now.getTime() -
          i * (timeRange === "1h" ? 60000 : timeRange === "6h" ? 300000 : timeRange === "24h" ? 900000 : 1800000),
      )

      let value
      if (type === "ph") {
        value = 7.0 + Math.sin(i * 0.1) * 0.4 + (Math.random() - 0.5) * 0.2
      } else if (type === "orp") {
        value = 650 + Math.sin(i * 0.05) * 150 + (Math.random() - 0.5) * 50
      } else if (type === "temperature") {
        value = 29 + Math.sin(i * 0.08) * 2 + (Math.random() - 0.5) * 1
      } else if (type === "ozone") {
        value = 197 + Math.sin(i * 0.06) * 20 + (Math.random() - 0.5) * 10
      } else if (type === "poolHealth") {
        value = 85 + Math.sin(i * 0.04) * 10 + (Math.random() - 0.5) * 5
      } else if (type === "system") {
        value = 95 + Math.sin(i * 0.03) * 3 + (Math.random() - 0.5) * 2
      } else if (type === "power") {
        value = Math.random() > 0.8 ? 0 : 1
      } else {
        value = 50 + Math.sin(i * 0.1) * 20 + (Math.random() - 0.5) * 10
      }

      data.push({
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        value: type === "power" ? value : Number.parseFloat(value.toFixed(1)),
      })
    }
    return data
  }

  const data = generateMockData()

  const getColor = () => {
    switch (type) {
      case "ph":
        return "#198754"
      case "orp":
        return "#0d6efd"
      case "temperature":
        return "#fd7e14"
      case "ozone":
        return "#6f42c1"
      case "poolHealth":
        return "#20c997"
      case "system":
        return "#198754"
      case "power":
        return "#dc3545"
      default:
        return "#6c757d"
    }
  }

  const getUnit = () => {
    switch (type) {
      case "ph":
        return ""
      case "orp":
        return "mV"
      case "temperature":
        return "°C"
      case "ozone":
        return "W"
      case "poolHealth":
        return "%"
      case "system":
        return "%"
      case "power":
        return ""
      default:
        return ""
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal show d-block">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex justify-content-between">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <Clock size={20} />
                {title}
              </h5>
              <div className="d-flex align-items-center gap-3">
                <select
                  className="form-select form-select-sm time-range-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1h">Last 1 Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="48h">Last 48 Hours</option>
                </select>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
            </div>
            <div className="modal-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} interval="preserveStartEnd" />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ value: `${type.toUpperCase()} (${getUnit()})`, angle: -90, position: "insideLeft" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getColor()}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: getColor() }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryChart
