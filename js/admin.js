/**
 * NSU PODIUM 2026 — Private Admin Dashboard Controller (Bangla)
 * Organizer: NSUDC — North South University Debate Club
 */

(function () {
  'use strict';

  // State Management
  let currentSession = null;
  let allRegistrations = [];
  let filteredRegistrations = [];
  let isLoading = false;

  // DOM Elements - Auth
  const loginWrapper = document.getElementById('loginWrapper');
  const dashboardWrapper = document.getElementById('dashboardWrapper');
  const topbarUserArea = document.getElementById('topbarUserArea');
  const adminUserEmail = document.getElementById('adminUserEmail');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminEmailInput = document.getElementById('adminEmail');
  const adminPasswordInput = document.getElementById('adminPassword');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginAlertBox = document.getElementById('loginAlertBox');
  const logoutBtn = document.getElementById('logoutBtn');

  // DOM Elements - Metrics
  const metricTotalRegistrations = document.getElementById('metricTotalRegistrations');
  const metricTotalSlots = document.getElementById('metricTotalSlots');
  const metricConfirmedCount = document.getElementById('metricConfirmedCount');
  const metricDbStatus = document.getElementById('metricDbStatus');

  // DOM Elements - Toolbar
  const tableSearchInput = document.getElementById('tableSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const statusFilterSelect = document.getElementById('statusFilterSelect');
  const sortOrderSelect = document.getElementById('sortOrderSelect');
  const refreshDataBtn = document.getElementById('refreshDataBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // DOM Elements - Table
  const tableFilteredCountBadge = document.getElementById('tableFilteredCountBadge');
  const lastUpdatedTimestamp = document.getElementById('lastUpdatedTimestamp');
  const tableLoadingState = document.getElementById('tableLoadingState');
  const tableEmptyState = document.getElementById('tableEmptyState');
  const emptyStateDesc = document.getElementById('emptyStateDesc');
  const tableResponsiveContainer = document.getElementById('tableResponsiveContainer');
  const registrationsTableBody = document.getElementById('registrationsTableBody');
  const toastContainer = document.getElementById('toastContainer');

  // Helper: Show Feedback Toast
  function showToast(message, type = 'info', duration = 3500) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper: Escape CSV
  function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  }

  // Helper: Format Date
  function formatDate(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  }

  // Get Supabase Client
  function getClient() {
    if (window.supabaseClient) {
      return window.supabaseClient;
    }
    if (typeof window.getSupabaseClient === 'function') {
      return window.getSupabaseClient();
    }
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG) {
      window.supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
      return window.supabaseClient;
    }
    return null;
  }

  // UI State Switcher: Show Login or Dashboard
  function setViewState(isAuthenticated, user = null) {
    if (isAuthenticated && user) {
      loginWrapper.style.display = 'none';
      dashboardWrapper.style.display = 'block';
      topbarUserArea.style.display = 'flex';
      adminUserEmail.textContent = user.email || 'Admin';
      loginAlertBox.style.display = 'none';
      fetchRegistrations();
    } else {
      loginWrapper.style.display = 'flex';
      dashboardWrapper.style.display = 'none';
      topbarUserArea.style.display = 'none';
      allRegistrations = [];
      filteredRegistrations = [];
    }
  }

  // Initialize Supabase Auth Listener
  async function initAuth() {
    const supabase = getClient();
    if (!supabase) {
      console.error('[Admin] Supabase client could not be initialized.');
      showLoginAlert('Database connection failed. Please refresh the page.');
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[Admin] Session verification notice:', error.message);
      }

      currentSession = session;
      if (session && session.user) {
        setViewState(true, session.user);
      } else {
        setViewState(false);
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange((event, newSession) => {
        currentSession = newSession;
        if (newSession && newSession.user) {
          setViewState(true, newSession.user);
        } else {
          setViewState(false);
        }
      });
    } catch (err) {
      console.error('[Admin] Auth initialization error:', err);
      setViewState(false);
    }
  }

  // Display Login Error
  function showLoginAlert(message) {
    loginAlertBox.textContent = message;
    loginAlertBox.style.display = 'block';
  }

  // Handle Login Submit
  async function handleLogin(e) {
    e.preventDefault();
    loginAlertBox.style.display = 'none';

    const email = (adminEmailInput.value || '').trim();
    const password = (adminPasswordInput.value || '').trim();

    if (!email || !password) {
      showLoginAlert('Please enter both email and password.');
      return;
    }

    const supabase = getClient();
    if (!supabase) {
      showLoginAlert('Database service unavailable.');
      return;
    }

    loginSubmitBtn.disabled = true;
    const btnText = loginSubmitBtn.querySelector('.btn-text');
    const btnSpinner = loginSubmitBtn.querySelector('.btn-spinner');
    if (btnText) btnText.textContent = 'Verifying...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        showLoginAlert(error.message || 'Invalid admin credentials.');
      } else if (data && data.user) {
        showToast('Signed in successfully.', 'success');
        adminLoginForm.reset();
      }
    } catch (err) {
      showLoginAlert(err.message || 'Authentication request failed.');
    } finally {
      loginSubmitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Sign In';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  }

  // Handle Logout
  async function handleLogout() {
    const supabase = getClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[Admin] Sign out notice:', e);
      }
    }
    setViewState(false);
    showToast('Signed out successfully.', 'info');
  }

  // Fetch Registrations from Supabase
  async function fetchRegistrations() {
    if (isLoading) return;
    isLoading = true;

    tableLoadingState.style.display = 'block';
    tableEmptyState.style.display = 'none';
    tableResponsiveContainer.style.display = 'none';
    tableFilteredCountBadge.textContent = 'Loading...';

    const supabase = getClient();
    if (!supabase) {
      tableLoadingState.style.display = 'none';
      tableEmptyState.style.display = 'block';
      emptyStateDesc.textContent = 'Supabase client is not available.';
      isLoading = false;
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bangla_registrations')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) {
        console.error('[Admin] Query error:', error);
        showToast(`Failed to load data: ${error.message}`, 'error');
        tableEmptyState.style.display = 'block';
        emptyStateDesc.textContent = `Error: ${error.message}`;
        metricDbStatus.textContent = 'Query Failed';
        metricDbStatus.style.color = '#ef4444';
      } else {
        allRegistrations = Array.isArray(data) ? data : [];
        updateMetrics(allRegistrations);
        applyFiltersAndRender();
        lastUpdatedTimestamp.textContent = `Last synced: ${new Date().toLocaleTimeString()}`;
        metricDbStatus.textContent = 'Live Connected';
        metricDbStatus.style.color = 'var(--accent-green)';
      }
    } catch (err) {
      console.error('[Admin] Unexpected fetch error:', err);
      showToast(`Network error loading data.`, 'error');
      tableEmptyState.style.display = 'block';
      emptyStateDesc.textContent = err.message || 'Network connection failed.';
    } finally {
      isLoading = false;
      tableLoadingState.style.display = 'none';
    }
  }

  // Update Summary Metrics
  function updateMetrics(list) {
    const total = list.length;
    let totalSlots = 0;
    let confirmedCount = 0;

    list.forEach(item => {
      const slots = parseInt(item.number_of_slots, 10);
      totalSlots += isNaN(slots) ? 1 : slots;

      if ((item.status || '').toLowerCase() === 'confirmed') {
        confirmedCount++;
      }
    });

    metricTotalRegistrations.textContent = total.toLocaleString();
    metricTotalSlots.textContent = totalSlots.toLocaleString();
    metricConfirmedCount.textContent = confirmedCount.toLocaleString();
  }

  // Filter and Sort Controller
  function applyFiltersAndRender() {
    const query = (tableSearchInput.value || '').trim().toLowerCase();
    const statusFilter = statusFilterSelect.value;
    const sortOrder = sortOrderSelect.value;

    if (query) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }

    filteredRegistrations = allRegistrations.filter(item => {
      // Status filter
      if (statusFilter !== 'ALL') {
        const itemStatus = (item.status || '').trim();
        if (itemStatus.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query across fields
      if (query) {
        const ref = (item.reference_id || '').toLowerCase();
        const inst = (item.institution_club_name || '').toLowerCase();
        const rep = (item.representative_name || '').toLowerCase();
        const phone = (item.contact_no || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const status = (item.status || '').toLowerCase();

        return (
          ref.includes(query) ||
          inst.includes(query) ||
          rep.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          status.includes(query)
        );
      }

      return true;
    });

    // Sort by registration date
    filteredRegistrations.sort((a, b) => {
      const dateA = new Date(a.registration_date || 0).getTime();
      const dateB = new Date(b.registration_date || 0).getTime();
      return sortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    renderTable(filteredRegistrations);
  }

  // Render HTML Table Rows
  function renderTable(list) {
    registrationsTableBody.innerHTML = '';
    const totalCount = allRegistrations.length;
    const currentCount = list.length;

    tableFilteredCountBadge.textContent = `${currentCount} of ${totalCount}`;

    if (currentCount === 0) {
      tableResponsiveContainer.style.display = 'none';
      tableEmptyState.style.display = 'block';
      emptyStateDesc.textContent = totalCount === 0
        ? 'No registrations have been recorded in the database yet.'
        : 'No registrations match your active search and filter criteria.';
      return;
    }

    tableEmptyState.style.display = 'none';
    tableResponsiveContainer.style.display = 'block';

    const fragment = document.createDocumentFragment();

    list.forEach((item, index) => {
      const tr = document.createElement('tr');

      const statusLower = (item.status || 'confirmed').toLowerCase();
      let statusClass = 'status-confirmed';
      if (statusLower.includes('pend')) statusClass = 'status-pending';
      else if (statusLower.includes('wait')) statusClass = 'status-waitlisted';
      else if (statusLower.includes('cancel')) statusClass = 'status-cancelled';

      tr.innerHTML = `
        <td class="td-sl">${index + 1}</td>
        <td>
          <span class="ref-badge" title="Click to copy Reference ID">${escapeHtml(item.reference_id || '—')}</span>
        </td>
        <td><strong>${escapeHtml(item.institution_club_name || '—')}</strong></td>
        <td class="text-center">
          <span class="slots-pill">${escapeHtml(item.number_of_slots || 1)}</span>
        </td>
        <td>${escapeHtml(item.representative_name || '—')}</td>
        <td>${escapeHtml(item.contact_no || '—')}</td>
        <td>${escapeHtml(item.email || '—')}</td>
        <td class="text-center">
          <span class="status-badge ${statusClass}">${escapeHtml(item.status || 'Confirmed')}</span>
        </td>
        <td>
          <span class="date-text">${formatDate(item.registration_date)}</span>
        </td>
      `;

      // Copy reference ID on badge click
      const badge = tr.querySelector('.ref-badge');
      if (badge && item.reference_id) {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', () => {
          navigator.clipboard.writeText(item.reference_id)
            .then(() => showToast(`Copied ${item.reference_id}`, 'info', 2000))
            .catch(() => {});
        });
      }

      fragment.appendChild(tr);
    });

    registrationsTableBody.appendChild(fragment);
  }

  // Export to Excel (.xlsx) using SheetJS
  function exportToExcel() {
    const listToExport = filteredRegistrations.length > 0 ? filteredRegistrations : allRegistrations;

    if (listToExport.length === 0) {
      showToast('No registration data available to export.', 'error');
      return;
    }

    if (typeof window.XLSX === 'undefined') {
      showToast('Excel exporter library is loading, please try again.', 'error');
      return;
    }

    try {
      const rows = listToExport.map((item, idx) => ({
        'SL': idx + 1,
        'Registration ID': item.reference_id || '',
        'Institution / Club Name': item.institution_club_name || '',
        'Representative Name': item.representative_name || '',
        'Contact No': item.contact_no || '',
        'Email': item.email || '',
        'Number of Slots': item.number_of_slots || 1,
        'Status': item.status || 'Confirmed',
        'Submitted At': formatDate(item.registration_date)
      }));

      const worksheet = window.XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      worksheet['!cols'] = [
        { wch: 6 },  // SL
        { wch: 22 }, // Registration ID
        { wch: 32 }, // Institution
        { wch: 24 }, // Representative
        { wch: 18 }, // Contact
        { wch: 28 }, // Email
        { wch: 16 }, // Slots
        { wch: 14 }, // Status
        { wch: 22 }  // Submitted At
      ];

      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Bangla Registrations');

      const fileName = 'NSU_PODIUM_Bangla_Registrations.xlsx';
      window.XLSX.writeFile(workbook, fileName);

      showToast(`Exported ${listToExport.length} records to ${fileName}`, 'success');
    } catch (err) {
      console.error('[Export Excel Error]:', err);
      showToast(`Excel export failed: ${err.message}`, 'error');
    }
  }

  // Export to CSV
  function exportToCSV() {
    const listToExport = filteredRegistrations.length > 0 ? filteredRegistrations : allRegistrations;

    if (listToExport.length === 0) {
      showToast('No registration data available to export.', 'error');
      return;
    }

    try {
      const headers = [
        'SL',
        'Registration ID',
        'Institution / Club Name',
        'Representative Name',
        'Contact No',
        'Email',
        'Number of Slots',
        'Status',
        'Submitted At'
      ];

      const csvLines = [headers.join(',')];

      listToExport.forEach((item, idx) => {
        const row = [
          idx + 1,
          escapeCsv(item.reference_id || ''),
          escapeCsv(item.institution_club_name || ''),
          escapeCsv(item.representative_name || ''),
          escapeCsv(item.contact_no || ''),
          escapeCsv(item.email || ''),
          item.number_of_slots || 1,
          escapeCsv(item.status || 'Confirmed'),
          escapeCsv(formatDate(item.registration_date))
        ];
        csvLines.push(row.join(','));
      });

      // Include UTF-8 BOM for Microsoft Excel compatibility
      const csvString = '\uFEFF' + csvLines.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      const fileName = 'NSU_PODIUM_Bangla_Registrations.csv';

      downloadLink.href = url;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      showToast(`Exported ${listToExport.length} records to ${fileName}`, 'success');
    } catch (err) {
      console.error('[Export CSV Error]:', err);
      showToast(`CSV export failed: ${err.message}`, 'error');
    }
  }

  // Event Listeners Initialization
  function initEvents() {
    // Auth form submit
    adminLoginForm.addEventListener('submit', handleLogin);

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Search input (debounce free, instant response)
    tableSearchInput.addEventListener('input', applyFiltersAndRender);

    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
      tableSearchInput.value = '';
      applyFiltersAndRender();
      tableSearchInput.focus();
    });

    // Status filter
    statusFilterSelect.addEventListener('change', applyFiltersAndRender);

    // Sort order
    sortOrderSelect.addEventListener('change', applyFiltersAndRender);

    // Refresh button
    refreshDataBtn.addEventListener('click', () => {
      showToast('Refreshing registrations...', 'info', 1500);
      fetchRegistrations();
    });

    // Export Excel
    exportExcelBtn.addEventListener('click', exportToExcel);

    // Export CSV
    exportCsvBtn.addEventListener('click', exportToCSV);
  }

  // Bootstrapping
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    initAuth();
  });

})();
