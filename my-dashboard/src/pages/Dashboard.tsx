// src/Dashboard.tsx
import React, { useState } from "react";
import Papa from "papaparse";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ParsedRow {
  [key: string]: string;
  prediction: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ParsedRow[]>([]);
  const [maliciousCount, setMaliciousCount] = useState<number>(0);
  const [safeCount, setSafeCount] = useState<number>(0);

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        const parsed: ParsedRow[] = (result.data as any[]).map((row) => {
          const malicious = Math.random() > 0.7; // 30% chance malicious
          return {
            ...row,
            prediction: malicious ? "Malicious" : "Safe",
          };
        });

        setData(parsed);
        setMaliciousCount(
          parsed.filter((r) => r.prediction === "Malicious").length
        );
        setSafeCount(parsed.filter((r) => r.prediction === "Safe").length);
      },
    });
  };

  const chartData = {
    labels: ["Malicious", "Safe"],
    datasets: [
      {
        label: "Network Predictions",
        data: [maliciousCount, safeCount],
        backgroundColor: ["#ff4d6d", "#4dd4ff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#1e293b",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "24px",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#818cf8",
          }}
        >
          CyberNeural IDS
        </div>
        <nav style={{ flex: 1, padding: "16px" }}>
          {["Dashboard", "Upload", "Results", "Settings"].map((item) => (
            <div
              key={item}
              style={{
                marginBottom: "16px",
                color: "#d1d5db",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLElement).style.color = "white")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLElement).style.color = "#d1d5db")
              }
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>
            LAN Malicious Network Detection
          </h1>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#6b7280",
            }}
          ></div>
        </div>

        {/* Upload Section */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Upload CSV File
          </h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              color: "#d1d5db",
              borderRadius: "8px",
              border: "1px solid #374151",
              backgroundColor: "#111827",
            }}
          />
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              background:
                "linear-gradient(to right, #8b5cf6, #ec4899)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px" }}>Total Records</p>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>{data.length}</p>
          </div>
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              background:
                "linear-gradient(to right, #ec4899, #f97316)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px" }}>Malicious Records</p>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>
              {maliciousCount}
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              background:
                "linear-gradient(to right, #3b82f6, #6366f1)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px" }}>Safe Records</p>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>{safeCount}</p>
          </div>
        </div>

        {/* Chart + Table */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Chart */}
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
              Prediction Summary
            </h2>
            <Pie data={chartData} />
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              padding: "24px",
              overflowX: "auto",
            }}
          >
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
              Prediction Results
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ color: "#9ca3af" }}>
                  <th style={{ padding: "8px" }}>#</th>
                  <th style={{ padding: "8px" }}>Row Data</th>
                  <th style={{ padding: "8px" }}>Prediction</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: "1px solid #374151" }}
                  >
                    <td style={{ padding: "8px" }}>{i + 1}</td>
                    <td
                      style={{
                        padding: "8px",
                        fontSize: "12px",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {JSON.stringify(row)}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "bold",
                        color:
                          row.prediction === "Malicious"
                            ? "#f87171"
                            : "#34d399",
                      }}
                    >
                      {row.prediction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                No file uploaded yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
