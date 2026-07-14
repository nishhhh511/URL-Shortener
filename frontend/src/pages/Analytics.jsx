import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaChartBar, FaCopy, FaExternalLinkAlt, FaQrcode } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../api/axios";
import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Analytics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  const id = searchParams.get("id");

  useEffect(() => {
    let ignore = false;

    const loadAnalytics = async () => {
      if (!id) {
        setLoading(false);
        toast.error("Missing URL id");
        return;
      }

      try {
        const [analyticsResponse, qrResponse] = await Promise.all([
          api.get(`/url/analytics/${id}`),
          api.get(`/url/qr/${id}`),
        ]);

        if (ignore) return;

        setAnalytics(analyticsResponse.data.data);
        setQrCode(qrResponse.data.data.qrCode);
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
            "Unable to load analytics"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      ignore = true;
    };
  }, [id]);

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const hasExpiry = Boolean(analytics?.expiresAt);

  const chartData = useMemo(() => ({
    labels: ["Clicks", "Expiry Rule", "Active"],
    datasets: [
      {
        label: "Link health",
        data: [
          analytics?.clicks || 0,
          hasExpiry ? 1 : 0,
          1,
        ],
        backgroundColor: ["#2563eb", "#10b981", "#f59e0b"],
        borderRadius: 8,
      },
    ],
  }), [analytics, hasExpiry]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <div className="brand-mark">LinkPilot</div>
          <p className="topbar-subtitle">Detailed performance for one short URL.</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Back
        </button>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <section className="table-panel">
            <div className="skeleton-title" />
            <div className="skeleton-row tall" />
            <div className="skeleton-row tall" />
          </section>
        ) : analytics ? (
          <>
            <section className="analytics-hero">
              <div>
                <span className="eyebrow">Analytics</span>
                <h1>{analytics.shortCode}</h1>
                <p>{analytics.originalUrl}</p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      void copyUrl(analytics.shortUrl);
                    }}
                  >
                    <FaCopy />
                    Copy Short URL
                  </button>

                  <a
                    className="btn btn-secondary"
                    href={analytics.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaExternalLinkAlt />
                    Open Link
                  </a>
                </div>
              </div>

              <div className="analytics-qr">
                {qrCode ? (
                  <img src={qrCode} alt="Short URL QR code" width={180} height={180} />
                ) : (
                  <FaQrcode />
                )}
                <span>Scan-ready QR code</span>
              </div>
            </section>

            <section className="stats-grid" aria-label="Analytics statistics">
              <div className="metric-card">
                <span>Total Clicks</span>
                <strong>{analytics.clicks}</strong>
                <small>Tracked redirects</small>
              </div>

              <div className="metric-card">
                <span>Created Date</span>
                <strong>{new Date(analytics.createdAt).toLocaleDateString()}</strong>
                <small>Tracked from creation</small>
              </div>

              <div className="metric-card">
                <span>Expiry Date</span>
                <strong>
                  {analytics.expiresAt
                    ? new Date(analytics.expiresAt).toLocaleDateString()
                    : "Never"}
                </strong>
                <small>{hasExpiry ? "Configured" : "No expiry"}</small>
              </div>
            </section>

            <section className="analytics-grid">
              <div className="table-panel">
                <div className="panel-header">
                  <div>
                    <h2>Performance Snapshot</h2>
                    <p>Visual summary from the available backend analytics.</p>
                  </div>
                </div>

                <div className="chart-box">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="table-panel">
                <div className="panel-header">
                  <div>
                    <h2>URL Details</h2>
                    <p>Ready for demos, sharing, and QA.</p>
                  </div>
                </div>

                <div className="details-list">
                  <div>
                    <span>Original URL</span>
                    <strong>{analytics.originalUrl}</strong>
                  </div>

                  <div>
                    <span>Short URL</span>
                    <strong>{analytics.shortUrl}</strong>
                  </div>

                  <div>
                    <span>Owner</span>
                    <strong>{analytics.user?.name || "Current user"}</strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="table-panel">
            <div className="empty-state">
              <FaChartBar />
              <h3>Analytics not found</h3>
              <p>Return to the dashboard and select another URL.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Analytics;
