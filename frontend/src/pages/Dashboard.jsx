import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaChartBar,
  FaCopy,
  FaLink,
  FaPlus,
  FaQrcode,
  FaSearch,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import QRCodeModal from "../components/QRCodeModal";
import "../styles/dashboard.css";

const PAGE_SIZE = 6;

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [originalUrl, setOriginalUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUrls, setTotalUrls] = useState(0);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [qrData, setQrData] = useState(null);

  const sortedUrls = useMemo(() => {
    const result = [...urls];

    return result.sort((first, second) => {
      if (sortBy === "clicks") return second.clicks - first.clicks;
      if (sortBy === "oldest") return new Date(first.createdAt) - new Date(second.createdAt);
      if (sortBy === "url") return first.originalUrl.localeCompare(second.originalUrl);

      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [sortBy, urls]);

  const totalClicks = useMemo(() => (
    urls.reduce((total, url) => total + url.clicks, 0)
  ), [urls]);

  const activeUrls = useMemo(() => (
    urls.filter((url) => !url.expiresAt || new Date(url.expiresAt) > new Date()).length
  ), [urls]);

  useEffect(() => {
    let ignore = false;

    const loadUrls = async () => {
      setLoadingUrls(true);

      try {
        const response = search.trim()
          ? await api.get("/url/search", {
              params: {
                query: search,
              },
            })
          : await api.get("/url/my-urls", {
              params: {
                page,
                limit: PAGE_SIZE,
              },
            });

        if (ignore) return;

        setUrls(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUrls(response.data.totalUrls || response.data.count || 0);
      } catch (error) {
        if (!ignore) {
          toast.error(
            error.response?.data?.message ||
            "Unable to load URLs"
          );
        }
      } finally {
        if (!ignore) {
          setLoadingUrls(false);
        }
      }
    };

    void loadUrls();

    return () => {
      ignore = true;
    };
  }, [page, search]);

  const refreshUrls = async (nextPage = page) => {
    setPage(nextPage);

    try {
      const response = search.trim()
        ? await api.get("/url/search", {
            params: {
              query: search,
            },
          })
        : await api.get("/url/my-urls", {
            params: {
              page: nextPage,
              limit: PAGE_SIZE,
            },
          });

      setUrls(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalUrls(response.data.totalUrls || response.data.count || 0);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to refresh URLs"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out safely");
    navigate("/");
  };

  const createUrl = async (event) => {
    event.preventDefault();

    if (!originalUrl.trim()) {
      toast.error("Paste a URL before shortening");
      return;
    }

    setCreating(true);

    try {
      await api.post("/url/shorten", {
        originalUrl,
      });

      toast.success("Short URL created");
      setOriginalUrl("");
      setSearch("");
      await refreshUrls(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to create URL"
      );
    } finally {
      setCreating(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Short URL copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const openQrCode = async (id) => {
    try {
      const response = await api.get(`/url/qr/${id}`);
      setQrData(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to load QR Code"
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await api.delete(`/url/${pendingDelete.id}`);
      toast.success("URL deleted");
      setPendingDelete(null);
      await refreshUrls(page);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Delete failed"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <div className="brand-mark">
            <FaLink />
            LinkPilot
          </div>
          <p className="topbar-subtitle">Shorten, share, and monitor every link.</p>
        </div>

        <div className="topbar-actions">
          <div className="user-chip">
            <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <div>
              <strong>{user?.name || "User"}</strong>
              <small>{user?.email || "Signed in"}</small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="hero-panel">
          <div>
            <span className="eyebrow">SaaS link management</span>
            <h1>Build cleaner links with measurable performance.</h1>
            <p>
              Create short links, copy them instantly, generate QR codes, and track clicks from a single polished workspace.
            </p>
          </div>

          <form className="shorten-form" onSubmit={createUrl}>
            <label htmlFor="originalUrl">Destination URL</label>
            <div className="input-action">
              <input
                id="originalUrl"
                type="url"
                placeholder="https://your-product.com/campaign"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                required
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                <FaPlus />
                {creating ? "Creating..." : "Shorten"}
              </button>
            </div>
          </form>
        </section>

        <section className="stats-grid" aria-label="URL statistics">
          <div className="metric-card">
            <span>Total URLs</span>
            <strong>{totalUrls || urls.length}</strong>
            <small>Stored links</small>
          </div>

          <div className="metric-card">
            <span>Total Clicks</span>
            <strong>{totalClicks}</strong>
            <small>Current result set</small>
          </div>

          <div className="metric-card">
            <span>Active URLs</span>
            <strong>{activeUrls}</strong>
            <small>Not expired</small>
          </div>
        </section>

        <section className="table-panel">
          <div className="panel-header">
            <div>
              <h2>Your Links</h2>
              <p>Search, sort, copy, analyze, or delete links.</p>
            </div>

            <div className="toolbar">
              <label className="search-field" htmlFor="search">
                <FaSearch />
                <input
                  id="search"
                  type="search"
                  placeholder="Search links..."
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                />
              </label>

              <select
                className="select-control"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort links"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="clicks">Most clicks</option>
                <option value="url">URL A-Z</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="links-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Short Link</th>
                  <th>
                    Clicks
                    <FaArrowDown className="th-icon" />
                  </th>
                  <th>
                    Created
                    <FaArrowUp className="th-icon" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingUrls ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={5}>
                        <div className="skeleton-row" />
                      </td>
                    </tr>
                  ))
                ) : sortedUrls.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <FaLink />
                        <h3>No links found</h3>
                        <p>Create your first short URL or adjust your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedUrls.map((url) => (
                    <tr key={url.id}>
                      <td data-label="Destination">
                        <div className="url-cell">
                          <strong>{url.originalUrl}</strong>
                          <span>{url.shortCode}</span>
                        </div>
                      </td>

                      <td data-label="Short Link">
                        <a
                          className="short-link"
                          href={url.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {url.shortUrl}
                        </a>
                      </td>

                      <td data-label="Clicks">{url.clicks}</td>

                      <td data-label="Created">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>

                      <td data-label="Actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            title="Copy URL"
                            aria-label="Copy URL"
                            onClick={() => {
                              void copyUrl(url.shortUrl);
                            }}
                          >
                            <FaCopy />
                          </button>

                          <button
                            type="button"
                            className="icon-button"
                            title="QR Code"
                            aria-label="Open QR Code"
                            onClick={() => {
                              void openQrCode(url.id);
                            }}
                          >
                            <FaQrcode />
                          </button>

                          <button
                            type="button"
                            className="icon-button"
                            title="Analytics"
                            aria-label="Open analytics"
                            onClick={() => navigate(`/analytics?id=${url.id}`)}
                          >
                            <FaChartBar />
                          </button>

                          <button
                            type="button"
                            className="icon-button danger"
                            title="Delete URL"
                            aria-label="Delete URL"
                            onClick={() => setPendingDelete(url)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === 1 || loadingUrls || Boolean(search.trim())}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={page >= totalPages || loadingUrls || Boolean(search.trim())}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </main>

      <QRCodeModal
        qrCode={qrData?.qrCode}
        shortUrl={qrData?.shortUrl}
        onCopy={copyUrl}
        onClose={() => setQrData(null)}
      />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this short URL?"
        message={`This will permanently remove ${pendingDelete?.shortCode || "the selected link"}.`}
        confirmText="Delete"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Dashboard;
