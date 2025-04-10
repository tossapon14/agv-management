import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface BatteryDonutChartProps {
  level: number; // Battery percentage (0 - 100)
}

const BatteryDonutChart: React.FC<BatteryDonutChartProps> = ({ level }) => {
  const data = [
    { name: "Battery", value: level }, // Filled part
    { name: "Remaining", value: 100 - level }, // Empty part
  ];


  // Change color based on battery level
  const getBatteryColor = (level: number): string => {
    if (level > 50) return "#003092"; // Green (High)
    else if (level > 20) return "#FFC107"; // Yellow (Medium)
    return "#F44336"; // Red (Low)
  };

  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart> 
          {/* Battery Level Arc */}
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="30%"
            innerRadius={50}
            outerRadius={60}
            startAngle={90}
            endAngle={-270} // Rotates the chart correctly
          >
            <Cell key="filled" fill={getBatteryColor(level)} />
            <Cell key="empty" fill="#E0E0E0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "26px",
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {level}
        <p style={{fontSize:"12px",fontWeight:"normal"}}>battery %</p>
        
      </div>
    </div>
  );
};

export default BatteryDonutChart;