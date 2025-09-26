import { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a CSV file");
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/predict_csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-100 to-green-100 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          🔐 Network Attack Detection Dashboard
        </h1>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Analyzing..." : "Predict"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-lg font-medium shadow">
            ❌ {error}
          </div>
        )}

        {/* Prediction Summary */}
        {result && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📊 Prediction Summary
            </h2>

            {/* Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-green-50 rounded-xl shadow text-center">
                <p className="text-gray-600 font-medium">Normal</p>
                <p className="text-3xl font-bold text-green-700">
                  {result.Normal || 0}
                </p>
              </div>
              <div className="p-6 bg-yellow-50 rounded-xl shadow text-center">
                <p className="text-gray-600 font-medium">Known Attacks</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {Object.keys(result).filter((k) =>
                    k.toLowerCase().includes("known attack")
                  ).length}
                </p>
              </div>
              <div className="p-6 bg-red-50 rounded-xl shadow text-center">
                <p className="text-gray-600 font-medium">Unknown Attacks</p>
                <p className="text-3xl font-bold text-red-700">
                  {result["Unknown Attacks"] || 0}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden shadow">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 border">Category</th>
                    <th className="p-3 border">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result).map(([key, value]) => (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 transition border-b last:border-0"
                    >
                      <td className="p-3 border font-medium text-gray-700">{key}</td>
                      <td className="p-3 border text-center">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
