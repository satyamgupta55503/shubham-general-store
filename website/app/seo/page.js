"use client";

import { useState } from "react";
import axios from "axios";
import Layout from "@/components/layout/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaChevronDown,
  FaChevronRight,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/elements/Loader";

const NEON = "#8ee013";
const COLORS = [
  "#8ee013",
  "#81e6d9",
  "#f6ad55",
  "#f56565",
  "#68d391",
  "#f687b3",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const detailsVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const errorVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
    },
  },
};

const pieVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
const loaderVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};

function DetailsWithChart({ details }) {
  const [open, setOpen] = useState(false);

  if (!details) return null;

  // If tabular data, show chart and table
  if (
    Array.isArray(details.items) &&
    details.items.length &&
    details.headings
  ) {
    // Prepare chart data
    const hasWastedBytes = details.items[0].wastedBytes !== undefined;
    const hasTotalBytes = details.items[0].totalBytes !== undefined;
    const chartData = details.items.map((item, i) => ({
      name: item.url ? item.url.split("/").pop() : `Item ${i + 1}`,
      "Wasted Bytes": item.wastedBytes || 0,
      "Total Bytes": item.totalBytes || 0,
    }));

    return (
      <div className="my-2">
        <motion.button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 border-none text-neon-green hover:text-white transition-colors font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {open ? <FaChevronDown /> : <FaChevronRight />}
          {open ? "Hide Details" : "Show Details & Chart"}
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div
              variants={detailsVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mt-2"
            >
              <motion.div
                className="rounded-lg neon-border bg-[#181818] p-2 mb-3"
                variants={cardVariants}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: NEON, fontSize: 10 }} />
                    <YAxis tick={{ fill: NEON, fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#232323",
                        border: `1px solid ${NEON}`,
                        color: NEON,
                      }}
                      labelStyle={{ color: NEON }}
                    />
                    <Legend wrapperStyle={{ color: NEON, fontSize: 12 }} />
                    {hasWastedBytes && (
                      <Bar dataKey="Wasted Bytes" fill="#f56565" />
                    )}
                    {hasTotalBytes && <Bar dataKey="Total Bytes" fill={NEON} />}
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="overflow-auto" variants={cardVariants}>
                <table className="w-full text-xs text-left bg-[#101010] rounded-lg">
                  <thead>
                    <tr>
                      {details.headings.map((h, i) => (
                        <th
                          key={i}
                          className="px-2 py-1 text-neon-green font-bold"
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {details.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-700">
                        {details.headings.map((h, i) => (
                          <td key={i} className="px-2 py-1">
                            {item[h.key] !== undefined
                              ? typeof item[h.key] === "number"
                                ? item[h.key].toLocaleString()
                                : item[h.key]
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Otherwise show JSON
  return (
    <div className="my-2">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-neon-green hover:text-white transition-colors font-semibold"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        {open ? "Hide Details" : "Show Details"}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.pre
            variants={detailsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-[#181818] neon-border rounded-lg p-3 mt-2 text-white overflow-auto text-xs"
          >
            {JSON.stringify(details, null, 2)}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreChart({ performance, seo }) {
  if (!performance && !seo) return null;

  const data = [];
  if (performance?.performanceScore) {
    data.push({
      name: "Performance Score",
      value: performance.performanceScore,
    });
  }
  if (seo?.seoScore) {
    data.push({ name: "SEO Score", value: seo.seoScore });
  }

  if (!data.length) return null;

  return (
    <motion.div
      className="w-full rounded-lg neon-border bg-[#181818] p-2 mb-4"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill={NEON}
            labelLine={{ stroke: NEON }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                as={motion.circle}
                variants={pieVariants}
                initial="hidden"
                animate="visible"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "white",
              border: `1px solid ${NEON}`,
              color: NEON,
            }}
            labelStyle={{ color: NEON }}
          />
          <Legend wrapperStyle={{ color: NEON, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function PerformanceMetrics({ performance }) {
  if (!performance) return null;

  return (
    <motion.div
      className="mb-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="h3 font-orbitron fw-bold mb-3"
        variants={itemVariants}
      >
        <FaInfoCircle className="inline mb-1 mr-2 text-neon-green" />
        Performance Metrics
      </motion.h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        {Object.entries(performance).map(
          ([key, value]) =>
            key !== "reportUrl" && (
              <motion.div key={key} className="col" variants={cardVariants}>
                <div className="card bg-[#181818] text-neon-green neon-border h-100 hover-neon rounded-lg">
                  <div className="card-body text-center">
                    <span className="badge">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <p className="card-text fs-4 fw-bold font-orbitron mt-2">
                      {value}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </div>
    </motion.div>
  );
}

function SeoMetrics({ seo }) {
  if (!seo) return null;

  return (
    <motion.div
      className="mb-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="h3 font-orbitron fw-bold mb-3"
        variants={itemVariants}
      >
        <FaInfoCircle className="inline mb-1 mr-2 text-neon-green" />
        SEO Metrics
      </motion.h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        {Object.entries(seo).map(([key, value]) => (
          <motion.div key={key} className="col" variants={cardVariants}>
            <div className="card bg-[#181818] text-neon-green neon-border h-100 hover-neon rounded-lg">
              <div className="card-body text-center">
                <span className="badge">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <p className="card-text fs-4 fw-bold font-orbitron mt-2">
                  {value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [performanceSuggestions, setPerformanceSuggestions] = useState([]);
  const [seoSuggestions, setSeoSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", number: "", email: "", purpose: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://backend.digikraftsocial.com/api/seo-submissions", {
        url,
        notes: `Name: ${leadForm.name} | Phone: ${leadForm.number} | Email: ${leadForm.email} | Purpose: ${leadForm.purpose === "Other" ? leadForm.otherPurpose || "Other" : leadForm.purpose}`,
      });
      setLeadSubmitted(true);
      setShowLeadForm(false);
      // Auto-trigger analysis after form submit
      setTimeout(() => {
        document.getElementById("seo-analyze-btn")?.click();
      }, 100);
    } catch (err) {
      setLeadSubmitted(true);
      setShowLeadForm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Show lead form first
    if (!leadSubmitted) {
      setShowLeadForm(true);
      return;
    }

    setLoading(true);
    setError(null);
    setPerformanceData(null);
    setSeoData(null);
    setPerformanceSuggestions([]);
    setSeoSuggestions([]);

    try {
      // Lead form already saved the submission
      const response = await axios.post(
        "https://dks-backend-jg53.vercel.app/api/pagespeed/analyze",
        { url },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setPerformanceData(response.data.performance);
        setSeoData(response.data.seo);
        setPerformanceSuggestions(response.data.performanceSuggestions || []);
        setSeoSuggestions(response.data.seoSuggestions || []);
      } else {
        setError(response.data.message || "Failed to fetch performance data");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error connecting to the API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerStyle={1} footerStyle={1} logoWhite>
      <div
        className="text-neon-green min-h-screen py-5"
        style={{ height: "100%", minHeight: "100vh", backgroundColor: "black" }}
      >
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap");
          .font-orbitron {
            font-family: "Urbanist", sans-serif;
            font-optical-sizing: auto;
          }
          .neon-border {
            border: 2px solid #8ee013;
            box-shadow: 0 0 12px #8ee01344;
          }
          .hover-neon:hover {
            box-shadow: 0 0 24px #8ee01399, 0 0 48px #8ee01355;
            transform: translateY(-2px) scale(1.01);
            transition: all 0.3s ease;
          }
          .bg-neon-green {
            background-color: #8ee013;
          }
          .text-neon-green {
            color: black;
          }
          .badge {
            display: inline-block;
            font-size: 0.8rem;
            padding: 0.22em 0.7em;
            border-radius: 999px;
            font-weight: 700;
            background: #181818;
            color: #8ee013;
            border: 1.5px solid #8ee013;
            margin-right: 0.5em;
            margin-bottom: 0.15em;
          }
        `}</style>

        <section>
          <div className="container py-5">
            <motion.div
              className="row justify-content-center"
              style={{
                height: "100%",
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="col-lg-8">
                <motion.h1
                  className="text-center mb-5 font-orbitron fw-bold text-4xl"
                  style={{
                    letterSpacing: 2,
                    color: "white",
                    padding: "20px",
                  }}
                  variants={itemVariants}
                >
                  Perflytics
                  <br />
                  Seo + Performance + Analytics
                </motion.h1>
                {/* URL Input Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="mb-5"
                  variants={containerVariants}
                >
                  <div className="row g-3 align-items-center">
                    <motion.div className="col-md-9" variants={itemVariants}>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter website URL (e.g., https://www.example.com)"
                        className="form-control bg-[#181818] text-neon-green neon-border py-3 font-orbitron"
                        required
                        style={{ fontSize: "1.1rem", borderRadius: 8 }}
                      />
                    </motion.div>
                    <motion.div className="col-md-3" variants={itemVariants}>
                      <motion.button
                        id="seo-analyze-btn"
                        type="submit"
                        disabled={loading}
                        className={`btn bg-neon-green text-neon-green font-orbitron fw-semibold py-3 w-100 hover-neon rounded-lg ${
                          loading
                            ? "animate__animated animate__pulse animate__infinite"
                            : ""
                        }`}
                        style={{ fontSize: "1.1rem" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loading ? "Scanning..." : "Analyze"}
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.form>

                {/* Lead Capture Form Modal */}
                <AnimatePresence>
                  {showLeadForm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{ background: "#111", borderRadius: "16px", padding: "32px", maxWidth: "440px", width: "100%", border: "1px solid #8ee01344" }}
                      >
                        <h3 style={{ color: "#8ee013", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Almost There! 🚀</h3>
                        <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "20px" }}>Fill in your details to get your free SEO analysis report.</p>
                        
                        <form onSubmit={handleLeadSubmit}>
                          <div style={{ marginBottom: "12px" }}>
                            <input type="text" placeholder="Your Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <input type="tel" placeholder="Phone Number (optional)" value={leadForm.number} onChange={(e) => setLeadForm({ ...leadForm, number: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <input type="email" placeholder="Email (optional)" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <select value={leadForm.purpose} onChange={(e) => setLeadForm({ ...leadForm, purpose: e.target.value })} required style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: leadForm.purpose ? "#fff" : "#6b7280", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
                              <option value="">Select Purpose *</option>
                              <option value="SEO Audit">SEO Audit</option>
                              <option value="Website Speed Optimization">Website Speed Optimization</option>
                              <option value="Digital Marketing">Digital Marketing</option>
                              <option value="Website Development">Website Development</option>
                              <option value="Just Checking">Just Checking</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          {leadForm.purpose === "Other" && (
                            <div style={{ marginBottom: "16px" }}>
                              <textarea placeholder="Please describe your purpose..." value={leadForm.otherPurpose || ""} onChange={(e) => setLeadForm({ ...leadForm, otherPurpose: e.target.value })} required style={{ width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", minHeight: "80px", resize: "vertical" }} />
                            </div>
                          )}
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button type="submit" style={{ flex: 1, padding: "12px", background: "#8ee013", color: "#000", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                              Analyze Now →
                            </button>
                            <button type="button" onClick={() => setShowLeadForm(false)} style={{ padding: "12px 16px", background: "transparent", color: "#6b7280", border: "1px solid #333", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}

                {/* if loading is present then show preeLoader  */}

                {loading && (
                  <div className="d-flex justify-content-center align-items-center  bg-black bg-opacity-75 pt-20">
                    <motion.img
                      src="/assets/imgs/page/homepage1/loaderlogo.png" // Replace with your logo path
                      alt="Logo"
                      className="img-fluid mx-auto d-block"
                      style={{ maxWidth: "200px" }}
                      variants={loaderVariants}
                      animate="animate"
                    />
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="alert alert-danger bg-red-900 text-red-300 neon-border mb-5"
                      role="alert"
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Score Chart */}
                {(performanceData || seoData) && (
                  <motion.div
                    className="mb-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h2
                      className="h3 font-orbitron fw-bold mb-3"
                      variants={itemVariants}
                    >
                      <FaInfoCircle className="inline mb-1 mr-2 text-neon-green" />
                      Score Overview
                    </motion.h2>
                    <ScoreChart performance={performanceData} seo={seoData} />
                  </motion.div>
                )}
                {/* Performance Metrics */}
                {performanceData && (
                  <PerformanceMetrics performance={performanceData} />
                )}
                {/* SEO Metrics */}
                {seoData && <SeoMetrics seo={seoData} />}
                {/* Performance Suggestions */}
                {performanceSuggestions.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h2
                      className="h3 font-orbitron fw-bold mb-4"
                      variants={itemVariants}
                    >
                      <FaExclamationTriangle className="inline mb-1 mr-2 text-yellow-400" />
                      Performance Optimization Protocols
                    </motion.h2>
                    <motion.div
                      className="d-flex flex-column gap-4"
                      variants={containerVariants}
                    >
                      {performanceSuggestions.map((s, idx) => (
                        <motion.div
                          key={idx}
                          className="card bg-[#181818] neon-border neon-glow text-neon-green hover-neon mb-3 rounded-lg"
                          variants={cardVariants}
                        >
                          <div className="card-body">
                            <div className="flex flex-wrap items-center mb-2 gap-2">
                              <span className="badge">{s.issue}</span>
                              <span
                                className="badge"
                                style={{
                                  background: "#262626",
                                  color: "#81e6d9",
                                  borderColor: "#81e6d9",
                                }}
                              >
                                Recommendation
                              </span>
                            </div>
                            <p className="mb-2 text-neon-green font-semibold">
                              {s.recommendation}
                            </p>
                            <p className="mb-1 text-gray-300">
                              <span className="fw-semibold">Description:</span>{" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: s.description,
                                }}
                              />
                            </p>
                            {s.details && (
                              <DetailsWithChart details={s.details} />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
                {/* SEO Suggestions */}
                {seoSuggestions.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h2
                      className="h3 font-orbitron fw-bold mb-4"
                      variants={itemVariants}
                    >
                      <FaExclamationTriangle className="inline mb-1 mr-2 text-yellow-400" />
                      SEO Optimization Protocols
                    </motion.h2>
                    <motion.div
                      className="d-flex flex-column gap-4"
                      variants={containerVariants}
                    >
                      {seoSuggestions.map((s, idx) => (
                        <motion.div
                          key={idx}
                          className="card bg-[#181818] neon-border neon-glow text-neon-green hover-neon mb-3 rounded-lg"
                          variants={cardVariants}
                        >
                          <div className="card-body">
                            <div className="flex flex-wrap items-center mb-2 gap-2">
                              <span className="badge">{s.issue}</span>
                              <span
                                className="badge"
                                style={{
                                  background: "#262626",
                                  color: "#81e6d9",
                                  borderColor: "#81e6d9",
                                }}
                              >
                                Recommendation
                              </span>
                            </div>
                            <p className="mb-2 text-neon-green font-semibold">
                              {s.recommendation}
                            </p>
                            <p className="mb-1 text-gray-300">
                              <span className="fw-semibold">Description:</span>{" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: s.description,
                                }}
                              />
                            </p>
                            {s.details && (
                              <DetailsWithChart details={s.details} />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
                {!performanceData &&
                  !seoData &&
                  !performanceSuggestions.length &&
                  !seoSuggestions.length &&
                  !loading &&
                  !error && (
                    <motion.div
                      className="text-center text-gray-500 mt-5 font-orbitron"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      Enter a website URL and click{" "}
                      <span className="text-neon-green">Analyze</span> to get
                      started!
                    </motion.div>
                  )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
