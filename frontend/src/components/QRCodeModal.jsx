import { FaCopy, FaDownload, FaTimes } from "react-icons/fa";

function QRCodeModal({ qrCode, shortUrl, onCopy, onClose }) {
  if (!qrCode) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="qr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        <button
          type="button"
          className="icon-button modal-close"
          aria-label="Close QR code"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <div className="modal-kicker">Share link</div>
        <h2 id="qr-modal-title">QR Code</h2>

        <div className="qr-frame">
          <img
            src={qrCode}
            alt="Short URL QR code"
            width={220}
            height={220}
          />
        </div>

        <p className="qr-url">{shortUrl}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onCopy(shortUrl)}
          >
            <FaCopy />
            Copy
          </button>

          <a
            className="btn btn-primary"
            href={qrCode}
            download="short-url-qr.png"
          >
            <FaDownload />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default QRCodeModal;
