window.PortalCommon=Object.freeze({
  async requireSession() {
    if (!CompanyApi.token()) {
      location.href = 'company-login.html';
      throw new Error('NO_SESSION');
    }

    try {
      return await CompanyApi.session();
    } catch (error) {
      localStorage.removeItem(CompanyApi.TOKEN_KEY);
      location.href = 'company-login.html';
      throw error;
    }
  },

  bindLogout() {
    const button = document.querySelector('#logoutButton');
    if (!button) return;

    button.addEventListener('click', async function() {
      await CompanyApi.logout();
      location.href = 'company-login.html';
    });
  },

  setCompanyName(name) {
    document.querySelectorAll('[data-company-name]').forEach(function(node) {
      node.textContent = name;
    });
  },

  statusText(review, publication) {
    if (publication === 'PUBLISHED') return '公開中';
    if (publication === 'PAUSED') return '已下架';
    if (publication === 'EXPIRED') return '已截止';
    if (review === 'PENDING') return '待審核';
    if (review === 'REVISION_REQUIRED') return '需修改';
    if (review === 'REJECTED') return '未通過';
    return '草稿';
  },

  statusClass(review, publication) {
    if (publication === 'PUBLISHED') return 'status-approved';
    if (review === 'PENDING') return 'status-pending';
    return '';
  }
});