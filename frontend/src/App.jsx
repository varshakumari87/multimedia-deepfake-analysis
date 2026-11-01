import { useState, useEffect } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  ScanSearch,
  History,
  Settings,
  UploadCloud,
  Image,
  Video,
  Music,
  FileCheck,
  Activity,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("");

  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  // Check backend connection
  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend unavailable");
        }
        return response.json();
      })
      .then((data) => {
        setBackendStatus(data.success ? "Connected" : "Unavailable");
      })
      .catch(() => {
        setBackendStatus("Unavailable");
      });
  }, []);

  // Select media file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please select a supported image, video, or audio file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100 MB.");
      event.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setMediaType(selectedFile.type.split("/")[0]);
    setUploadStatus("");

    if (
      selectedFile.type.startsWith("image/") ||
      selectedFile.type.startsWith("video/")
    ) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview("");
    }
  };

  // Remove selected file
  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");
    setMediaType("");
    setUploadStatus("");

    const input = document.getElementById("media-upload");
    if (input) input.value = "";
  };

  // Upload media to backend
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);

    setUploading(true);
    setUploadStatus("Uploading your file...");

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadStatus(
        "Upload successful! File: " + data.file.originalName
      );
    } catch (error) {
      setUploadStatus("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const statusIsConnected = backendStatus === "Connected";

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>

        <div className="logo">
          <ShieldCheck size={32} />
          <span>SafeLens AI</span>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">

          <a
            href="#dashboard"
            className="nav-link active"
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a
            href="#detection"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <ScanSearch size={19} />
            <span>Deepfake Detection</span>
          </a>

          <a
            href="#history"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <History size={19} />
            <span>Analysis History</span>
          </a>

          <a
            href="#settings"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <Settings size={19} />
            <span>Settings</span>
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="security-card">
            <ShieldCheck size={25} />
            <h3>Your media stays yours</h3>
            <p>
              SafeLens AI helps examine suspicious media and
              identify potentially manipulated content.
            </p>
          </div>

          <p className="sidebar-version">
            SafeLens AI · Version 1.0
          </p>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" id="dashboard">

        {/* HEADER */}
        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <div>
            <p className="breadcrumb">Pages / Dashboard</p>
            <h1>Dashboard</h1>
          </div>

          <div className="header-right">

            <div className="system-indicator">
              <span
                className={`status-dot ${
                  statusIsConnected ? "online" : ""
                }`}
              />
              System {backendStatus}
            </div>

            <div className="profile-icon">S</div>

          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="welcome-section">

          <div>
            <p className="eyebrow">
              AI-POWERED MEDIA VERIFICATION
            </p>

            <h2>Welcome to SafeLens AI</h2>

            <p>
              Analyze images, videos, and audio to help identify
              potentially manipulated media.
            </p>
          </div>

          <div className="welcome-icon">
            <ShieldCheck size={54} />
          </div>

        </section>

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon purple">
              <ScanSearch size={23} />
            </div>

            <p>Total Analyses</p>
            <h2>0</h2>
            <span>No analyses performed yet</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FileCheck size={23} />
            </div>

            <p>Authentic Results</p>
            <h2>0</h2>
            <span>Awaiting analysis</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <AlertCircle size={23} />
            </div>

            <p>Potential Deepfakes</p>
            <h2>0</h2>
            <span>Awaiting analysis</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Activity size={23} />
            </div>

            <p>Backend Status</p>

            <h2 className="status-heading">
              {backendStatus}
            </h2>

            <span>
              {statusIsConnected
                ? "API server is responding"
                : "Checking API connection"}
            </span>
          </div>

        </section>

        {/* UPLOAD SECTION */}
        <section className="content-grid" id="detection">

          <div className="upload-card">

            <div className="section-heading">

              <div>
                <h2>Analyze Media</h2>
                <p>
                  Upload a file to prepare it for deepfake analysis.
                </p>
              </div>

              <ScanSearch size={25} />

            </div>

            {/* FILE SELECTOR */}
            <label
              className="upload-area"
              htmlFor="media-upload"
            >

              <div className="upload-icon">
                <UploadCloud size={35} />
              </div>

              <h3>Upload your media file</h3>

              <p>
                Click here to browse files from your computer
              </p>

              <span className="browse-button">
                Choose File
              </span>

              <input
                id="media-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg"
                onChange={handleFileChange}
                hidden
              />

            </label>

            {/* SUPPORTED FORMATS */}
            <div className="supported-formats">

              <span>
                <Image size={16} /> Images
              </span>

              <span>
                <Video size={16} /> Videos
              </span>

              <span>
                <Music size={16} /> Audio
              </span>

            </div>

            {/* SELECTED FILE */}
            {file && (
              <div className="file-details">

                <div className="file-info">

                  <FileCheck size={23} />

                  <div>
                    <strong>{file.name}</strong>

                    <p>
                      {mediaType.toUpperCase()} ·{" "}
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                </div>

                <button
                  className="remove-button"
                  onClick={clearFile}
                  disabled={uploading}
                >
                  Remove
                </button>

              </div>
            )}

            {/* IMAGE PREVIEW */}
            {preview && mediaType === "image" && (
              <div className="preview-container">
                <p>Image Preview</p>

                <img
                  src={preview}
                  alt="Selected media preview"
                />
              </div>
            )}

            {/* VIDEO PREVIEW */}
            {preview && mediaType === "video" && (
              <div className="preview-container">
                <p>Video Preview</p>

                <video
                  src={preview}
                  controls
                />
              </div>
            )}

            {/* AUDIO PREVIEW */}
            {file && mediaType === "audio" && (
              <div className="preview-container">
                <p>Audio Preview</p>

                <audio
                  controls
                  src={URL.createObjectURL(file)}
                />
              </div>
            )}

            {/* UPLOAD BUTTON */}
            <button
              className="analyze-button"
              disabled={!file || uploading}
              onClick={handleUpload}
            >

              {uploading ? (
                <LoaderCircle size={19} className="spin" />
              ) : (
                <UploadCloud size={19} />
              )}

              {uploading ? "Uploading..." : "Upload Media"}

            </button>

            {/* UPLOAD MESSAGE */}
            {uploadStatus && (
              <p
                className="upload-note"
                role="status"
                aria-live="polite"
              >
                {uploadStatus}
              </p>
            )}

            <p className="upload-note">
              Your selected file will be sent to the backend.
              AI detection will be connected separately.
            </p>

          </div>

          {/* INFORMATION PANELS */}
          <div className="info-column">

            <div className="info-card">

              <h2>Supported Media</h2>

              <p>
                The dashboard accepts the following formats:
              </p>

              <div className="media-type">

                <div className="media-icon purple">
                  <Image size={21} />
                </div>

                <div>
                  <strong>Images</strong>
                  <span>JPG, PNG, WEBP</span>
                </div>

              </div>

              <div className="media-type">

                <div className="media-icon blue">
                  <Video size={21} />
                </div>

                <div>
                  <strong>Videos</strong>
                  <span>MP4, WEBM</span>
                </div>

              </div>

              <div className="media-type">

                <div className="media-icon orange">
                  <Music size={21} />
                </div>

                <div>
                  <strong>Audio</strong>
                  <span>MP3, WAV, OGG</span>
                </div>

              </div>

            </div>

            {/* SYSTEM CONNECTION */}
            <div className="info-card system-card">

              <h2>System Connection</h2>

              <div className="connection-row">

                {statusIsConnected ? (
                  <CheckCircle size={21} color="#22c55e" />
                ) : backendStatus === "Checking..." ? (
                  <LoaderCircle size={21} className="spin" />
                ) : (
                  <AlertCircle size={21} color="#f97316" />
                )}

                <div>
                  <strong>Backend API</strong>
                  <span>{backendStatus}</span>
                </div>

              </div>

              <div className="connection-row">

                <Activity size={21} color="#8b5cf6" />

                <div>
                  <strong>AI Detection Engine</strong>
                  <span>Not connected yet</span>
                </div>

              </div>

              <div className="connection-row">

                <ShieldCheck size={21} color="#3b82f6" />

                <div>
                  <strong>PostgreSQL Database</strong>
                  <span>Configured on backend</span>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ANALYSIS HISTORY */}
        <section className="history-card" id="history">

          <div className="section-heading">

            <div>
              <h2>Recent Analysis</h2>

              <p>
                Your latest analysis results will appear here.
              </p>
            </div>

            <History size={24} />

          </div>

          <div className="empty-history">

            <History size={35} />

            <h3>No analysis history</h3>

            <p>
              Uploaded files will appear here after the analysis
              history feature is implemented.
            </p>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">

          <p>
            © 2026 SafeLens AI. AI-Based Multimodal Deepfake
            Detection System.
          </p>

        </footer>

      </main>
    </div>
  );
}

export default App;