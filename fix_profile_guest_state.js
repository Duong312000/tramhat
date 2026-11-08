const fs = require('fs');

let html = fs.readFileSync('frontend/index.html', 'utf8');

// 1. Find profile view start and end
const profileStartTag = '<div class="site-page-view d-none" id="view-profile" style="background: #FFFFFF; min-height: 85vh;">';
const breadcrumbMarker = '<!-- Breadcrumb -->\n        <div class="page-breadcrumb mb-4">\n          <a href="javascript:void(0)" onclick="switchTab(\'home\')">Trang Chủ</a>\n          <span>/</span>\n          <span class="text-dark fw-semibold">Hồ Sơ Cá Nhân</span>\n        </div>';

if (html.includes(breadcrumbMarker)) {
  const profileHeaderStart = '<!-- PROFILE HEADER -->';
  const profileEndMarker = '<!-- PROFILE SUB-TAB 3: TUẦN HOÀN CHAI & ĐIỂM THƯỞNG -->';
  
  // Find where SUB-TAB 3 ends
  const subTab3Idx = html.indexOf(profileEndMarker);
  const closingDivsIdx = html.indexOf('</div>\n        </div>\n\n      </div>\n    </div>', subTab3Idx);
  
  if (subTab3Idx !== -1 && closingDivsIdx !== -1) {
    const beforeHeader = html.substring(0, html.indexOf(profileHeaderStart));
    const headerToEcoEnd = html.substring(html.indexOf(profileHeaderStart), closingDivsIdx + '</div>\n        </div>'.length);
    const afterEco = html.substring(closingDivsIdx + '</div>\n        </div>'.length);

    // Clean out profGuestBanner if present in headerToEcoEnd
    let cleanedProfileBody = headerToEcoEnd.replace(/<!-- BANNER NHẮC ĐĂNG NHẬP DÀNH CHO KHÁCH VÃNG LAI -->[\s\S]*?<\/div>\s*<\/div>/, '');

    // Replace alerts in cleanedProfileBody
    cleanedProfileBody = cleanedProfileBody.replace("onclick=\"alert('Đã gửi mã xác nhận đổi mật khẩu đến email/SĐT của bạn!')\"", "onclick=\"showFloatingToast('Đã gửi mã xác nhận đổi mật khẩu qua SMS!', 'success')\"");
    cleanedProfileBody = cleanedProfileBody.replace("onclick=\"navigator.clipboard.writeText('TRAMHAT15'); alert('Đã sao chép mã TRAMHAT15!')\"", "onclick=\"navigator.clipboard.writeText('TRAMHAT15'); showFloatingToast('Đã sao chép mã TRAMHAT15!', 'info')\"");
    cleanedProfileBody = cleanedProfileBody.replace("onclick=\"navigator.clipboard.writeText('DOICHAISANG'); alert('Đã sao chép mã DOICHAISANG!')\"", "onclick=\"navigator.clipboard.writeText('DOICHAISANG'); showFloatingToast('Đã sao chép mã DOICHAISANG!', 'info')\"");

    const guestStateHtml = `
        <!-- TRẠNG THÁI KHÁCH CHƯA ĐĂNG NHẬP (GUEST STATE) -->
        <div id="profileGuestState" class="text-center py-5 my-4">
          <div style="width: 76px; height: 76px; background: #FFF7ED; color: #EA580C; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 34px; margin-bottom: 20px;">
            <i class="bi bi-person-lock"></i>
          </div>
          <h2 class="display-6 font-serif fw-bold text-dark mb-2" style="font-size: 24px;">Bạn Chưa Đăng Nhập Tài Khoản</h2>
          <p class="text-muted small mx-auto mb-4" style="max-width: 440px; line-height: 1.6; font-size: 14px;">
            Vui lòng đăng nhập bằng số điện thoại để quản lý thông tin thành viên, xem lịch sử đơn hàng sữa hạt và tích lũy điểm Hạt Xanh.
          </p>
          <button type="button" class="btn btn-main-primary px-4 py-2" onclick="openAccountModal(true)" style="font-size: 14px;">
            <i class="bi bi-phone me-1"></i> Đăng Nhập / Tiếp Tục
          </button>
        </div>

        <!-- TRẠNG THÁI KHI ĐÃ ĐĂNG NHẬP (LOGGED IN STATE) -->
        <div id="profileLoggedInState" class="d-none">
          ${cleanedProfileBody}
        </div>`;

    html = beforeHeader + guestStateHtml + afterEco;
    console.log('SUCCESSFULLY RESTRUCTURED PROFILE VIEW (GUEST STATE vs LOGGED IN STATE)!');
  } else {
    console.log('COULD NOT FIND CLOSING DIVS FOR PROFILE VIEW');
  }
}

// 2. Update syncUserUI to toggle profileGuestState and profileLoggedInState
const oldSyncRegex = /function syncUserUI\(\)[\s\S]*?function switchProfileSubTab/;
const newSyncCode = `function syncUserUI() {
        const user = getCurrentUser();
        const isLoggedIn = Boolean(user && user.isLoggedIn);
        const initials = isLoggedIn ? getInitials(user.name || user.phone || 'TH') : 'TH';

        // 1. Navbar Icon Button
        const navAccountBtn = document.getElementById('navAccountIconBtn');
        if (navAccountBtn) {
          if (isLoggedIn) {
            navAccountBtn.classList.add('text-danger', 'border-danger');
            navAccountBtn.title = 'Hồ sơ: ' + (user.name || user.phone || 'Thành viên') + ' (Bấm để xem trang cá nhân)';
          } else {
            navAccountBtn.classList.remove('text-danger', 'border-danger');
            navAccountBtn.title = 'Đăng nhập tài khoản';
          }
        }

        // 2. Modal UI
        const modalAvatar = document.getElementById('authModalAvatar');
        const modalName = document.getElementById('authModalUserName');
        const modalEmail = document.getElementById('authModalUserEmail');
        if (modalAvatar) modalAvatar.innerText = initials;
        if (modalName) modalName.innerText = isLoggedIn ? (user.name || 'Khách Hàng') : 'Chưa đăng nhập';
        if (modalEmail) modalEmail.innerText = isLoggedIn ? (user.phone || user.email || '') : '';

        // 3. Profile Page Guest vs Logged In View
        const guestState = document.getElementById('profileGuestState');
        const loggedInState = document.getElementById('profileLoggedInState');

        if (isLoggedIn) {
          if (guestState) guestState.classList.add('d-none');
          if (loggedInState) loggedInState.classList.remove('d-none');

          const profAvatar = document.getElementById('profilePageAvatar');
          const profName = document.getElementById('profilePageName');
          const profContact = document.getElementById('profilePageContact');
          const statPoints = document.getElementById('profileStatPoints');
          const statBottles = document.getElementById('profileStatBottles');
          const statOrders = document.getElementById('profileStatOrders');

          if (profAvatar) profAvatar.innerText = initials;
          if (profName) profName.innerText = user.name || 'Khách Hàng';
          if (profContact) profContact.innerText = (user.email ? user.email + ' • ' : '') + (user.phone || '');
          if (statPoints) statPoints.innerText = user.points || 0;
          if (statBottles) statBottles.innerText = user.bottlesReturned || 0;
          if (statOrders) statOrders.innerText = user.ordersCount || 0;

          const editName = document.getElementById('profEditName');
          const editPhone = document.getElementById('profEditPhone');
          const editEmail = document.getElementById('profEditEmail');
          const editAddress = document.getElementById('profEditAddress');
          if (editName) editName.value = user.name || '';
          if (editPhone) editPhone.value = user.phone || '';
          if (editEmail) editEmail.value = user.email || '';
          if (editAddress) editAddress.value = user.address || '';

          renderProfileOrders();
        } else {
          if (guestState) guestState.classList.remove('d-none');
          if (loggedInState) loggedInState.classList.add('d-none');
        }
      }

      function switchProfileSubTab`;

if (oldSyncRegex.test(html)) {
  html = html.replace(oldSyncRegex, newSyncCode);
  console.log('UPDATED syncUserUI FUNCTION TO PROPERLY TOGGLE GUEST VS LOGGED IN STATE');
}

// 3. Replace alert in handleRequestBottleReturn
html = html.replace("alert('Đã ghi nhận yêu cầu thu hồi vỏ chai! Shipper sáng mai sẽ mang túi thu gom đến địa chỉ của bạn.');", "showFloatingToast('Đã ghi nhận yêu cầu thu hồi vỏ chai! Shipper sáng mai sẽ mang túi thu gom đến địa chỉ của bạn.', 'success');");

fs.writeFileSync('frontend/index.html', html, 'utf8');
console.log('INDEX.HTML SUCCESSFULLY SAVED!');
