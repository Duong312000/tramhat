/**
 * TRẠM HẠT® - ENVIRONMENT CONFIGURATION
 * Tự động chuyển đổi kết nối giữa Backend Local (localhost:5000) và Backend Cloud (Render/Railway)
 */
(function () {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.protocol === 'file:'
  );

  // Cấu hình URL Backend trên Cloud 24/7 (Thay thế sau khi deploy lên Render hoặc Railway)
  const CLOUD_BACKEND_API = 'https://tramhat-backend.onrender.com/api';

  window.TRAMHAT_API_URL = isLocalhost
    ? 'http://localhost:5000/api'
    : (window.__CUSTOM_BACKEND_URL__ || CLOUD_BACKEND_API);

  console.log(`[Config] API Endpoint đang kết nối tới: ${window.TRAMHAT_API_URL}`);
})();
