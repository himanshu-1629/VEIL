/**
 * VEIL — Cybersecurity Management System
 * Frontend Application Controller (Fetch API, Live Servlets, Light Mode)
 */

'use strict';

const AppState = {
    currentUser: null,
    csrfToken: '',
    activeIncidentId: null,
    activeView: 'dashboard'
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    initNavigation();
    initSeveritySlider();
    initReportingForm();
    initRegisterFilters();
    initUserManagement();
    initLogout();
});

// --- AUTHENTICATION & SESSION VERIFICATION ---
async function initAuth() {
    try {
        const res = await fetch('api/auth/me', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            window.location.href = 'login.html';
            return;
        }

        const data = await res.json();
        if (data.success && data.data) {
            AppState.currentUser = data.data;
            AppState.csrfToken = data.data.csrfToken || '';

            // Update UI user pill
            const nameEl = document.getElementById('current-user-name');
            const roleEl = document.getElementById('current-user-role');
            if (nameEl) nameEl.textContent = data.data.userName;
            if (roleEl) roleEl.textContent = data.data.role;

            // Show admin tab if user has ADMIN scope
            if (data.data.role === 'ADMIN') {
                const adminBtn = document.getElementById('nav-btn-users');
                if (adminBtn) adminBtn.style.display = 'inline-flex';
            }

            // Load initial view
            loadDashboard();
        } else {
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.warn('Session verification failed:', e);
        window.location.href = 'login.html';
    }
}

// --- NAVIGATION CONTROLLER ---
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-link');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (!target) return;
            switchView(target);
        });
    });
}

function switchView(viewName) {
    AppState.activeView = viewName;

    // Update active nav button
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === viewName);
    });

    // Update active view section
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) activeSec.classList.add('active');

    // Load data corresponding to view
    if (viewName === 'dashboard') {
        loadDashboard();
    } else if (viewName === 'register') {
        loadIncidents();
    } else if (viewName === 'users') {
        loadUsers();
    }
}

// --- DASHBOARD TELEMETRY CONTROLLER ---
async function loadDashboard() {
    try {
        const res = await fetch('api/dashboard/summary');
        if (!res.ok) throw new Error('Failed to retrieve summary metrics');

        const json = await res.json();
        if (!json.success || !json.data) return;

        const d = json.data;

        // Metric Counters
        animateCounter('metric-total', d.totalIncidents);
        animateCounter('metric-open', d.openIncidents);
        animateCounter('metric-critical', d.criticalIncidents);
        animateCounter('metric-in-progress', d.inProgressIncidents);
        animateCounter('metric-resolved', d.resolvedIncidents);

        // Active DB Engine display
        const dbPill = document.getElementById('db-engine-pill');
        if (dbPill && d.databaseEngine) {
            dbPill.textContent = 'DB: ' + d.databaseEngine;
        }

        // Operational Posture Narrative
        const postureEl = document.getElementById('operational-posture-narrative');
        if (postureEl && d.operationalPosture) {
            postureEl.textContent = d.operationalPosture;
        }

        // Featured Incident Banner
        renderFeaturedIncident(d.featuredIncident);

        // Severity Distribution Progress Bars
        renderSeverityDistribution(d.severityDistribution, d.totalIncidents);

        // Recent Incidents Feed
        renderRecentIncidents(d.recentIncidents);

    } catch (err) {
        showToast('Error loading dashboard telemetry: ' + err.message, 'error');
    }
}

function renderFeaturedIncident(inc) {
    const container = document.getElementById('featured-incident-container');
    if (!container) return;

    if (!inc) {
        container.innerHTML = `
            <div class="paper-card" style="padding: 24px; text-align: center; color: var(--muted-strong); margin-bottom: 32px;">
                <p>No unresolved high-priority threats active. Operational environment is stable.</p>
            </div>
        `;
        return;
    }

    const sevClass = inc.severity >= 9 ? 'badge-critical' : inc.severity >= 7 ? 'badge-high' : 'badge-medium';

    container.innerHTML = `
        <div class="featured-threat-box">
            <div>
                <div class="featured-header-row">
                    <span class="featured-pill">
                        <span class="status-indicator" style="background: var(--danger); box-shadow: 0 0 0 2px var(--danger-soft);"></span>
                        HIGHEST UNRESOLVED THREAT
                    </span>
                    <span class="badge ${sevClass}">${inc.severity} &bull; ${inc.severityInfo ? inc.severityInfo.classification : 'RATING'}</span>
                    <span class="status-badge status-${inc.status.toLowerCase().replace(/\s+/g, '-')}">${inc.status}</span>
                </div>
                <h2 class="featured-title">${escapeHtml(inc.threat)}</h2>
                <p class="featured-desc">${escapeHtml(inc.description)}</p>
                <div class="featured-meta-row">
                    <span class="mono" style="color: var(--muted);">Asset: <strong style="color: var(--ink);">${escapeHtml(inc.affectedSystem)}</strong></span>
                    <span class="mono" style="color: var(--muted);">&bull;</span>
                    <span class="mono" style="color: var(--muted);">Reporter: ${escapeHtml(inc.reporterName || 'Analyst')}</span>
                    <span class="mono" style="color: var(--muted);">&bull;</span>
                    <span class="mono" style="color: var(--muted);">Reported: ${formatDate(inc.reportedAt)}</span>
                </div>
            </div>
            <div>
                <button type="button" class="btn-primary-cyprus" onclick="inspectIncident(${inc.incidentId})">
                    <span>Inspect Threat</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderSeverityDistribution(dist, total) {
    if (!dist) return;

    const critical = dist['Critical (9-10)'] || 0;
    const high = dist['High (7-8)'] || 0;
    const medium = dist['Medium (4-6)'] || 0;
    const low = dist['Low (1-3)'] || 0;

    const totalCount = total > 0 ? total : 1;

    document.getElementById('cnt-sev-critical').textContent = `${critical} (${Math.round((critical/totalCount)*100)}%)`;
    document.getElementById('cnt-sev-high').textContent = `${high} (${Math.round((high/totalCount)*100)}%)`;
    document.getElementById('cnt-sev-medium').textContent = `${medium} (${Math.round((medium/totalCount)*100)}%)`;
    document.getElementById('cnt-sev-low').textContent = `${low} (${Math.round((low/totalCount)*100)}%)`;

    setBarTransform('bar-sev-critical', critical / totalCount);
    setBarTransform('bar-sev-high', high / totalCount);
    setBarTransform('bar-sev-medium', medium / totalCount);
    setBarTransform('bar-sev-low', low / totalCount);
}

function setBarTransform(id, ratio) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = '100%';
    el.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
}

function renderRecentIncidents(list) {
    const feed = document.getElementById('recent-incidents-feed');
    if (!feed) return;

    if (!list || list.length === 0) {
        feed.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem;">No recent activity records.</p>';
        return;
    }

    feed.innerHTML = list.map(item => `
        <div style="padding: 10px 14px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--radius-small); display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
             onclick="inspectIncident(${item.incidentId})">
            <div>
                <div style="font-size: 0.88rem; font-weight: 600; color: var(--ink); margin-bottom: 2px;">
                    ${escapeHtml(item.threat)}
                </div>
                <div class="mono" style="font-size: 0.78rem; color: var(--muted);">
                    ${escapeHtml(item.affectedSystem)} &bull; ${formatDate(item.reportedAt)}
                </div>
            </div>
            <div>
                <span class="badge ${getSeverityBadgeClass(item.severity)}">
                    ${item.severity}
                </span>
            </div>
        </div>
    `).join('');
}

// --- INCIDENT REGISTER CONTROLLER ---
function initRegisterFilters() {
    const searchInput = document.getElementById('register-search');
    const statusSelect = document.getElementById('filter-status');
    const sevSelect = document.getElementById('filter-severity');
    const sortSelect = document.getElementById('filter-sort');

    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(loadIncidents, 250);
        });
    }

    if (statusSelect) statusSelect.addEventListener('change', loadIncidents);
    if (sevSelect) sevSelect.addEventListener('change', loadIncidents);
    if (sortSelect) sortSelect.addEventListener('change', loadIncidents);
}

async function loadIncidents() {
    const tbody = document.getElementById('incidents-table-body');
    if (!tbody) return;

    const search = document.getElementById('register-search')?.value.trim() || '';
    const status = document.getElementById('filter-status')?.value || 'ALL';
    const sevFilter = document.getElementById('filter-severity')?.value || 'ALL';
    const sortVal = document.getElementById('filter-sort')?.value || 'date-DESC';

    const [sortBy, sortOrder] = sortVal.split('-');

    let minSev = '', maxSev = '';
    if (sevFilter === 'critical') { minSev = 9; maxSev = 10; }
    else if (sevFilter === 'high') { minSev = 7; maxSev = 8; }
    else if (sevFilter === 'medium') { minSev = 4; maxSev = 6; }
    else if (sevFilter === 'low') { minSev = 1; maxSev = 3; }

    const query = new URLSearchParams({
        search,
        status: status !== 'ALL' ? status : '',
        minSev,
        maxSev,
        sortBy,
        sortOrder
    });

    try {
        const res = await fetch(`api/incidents?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to retrieve incidents');

        const json = await res.json();
        const items = json.data || [];

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 36px; color: var(--muted-strong);">
                        No incidents match current filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = items.map(i => `
            <tr>
                <td><span class="incident-id-badge">#${i.incidentId}</span></td>
                <td>
                    <div class="threat-cell-title">${escapeHtml(i.threat)}</div>
                    <div class="threat-cell-sub">Reporter: ${escapeHtml(i.reporterName || 'System')}</div>
                </td>
                <td>
                    <span class="mono" style="font-size: 0.78rem; color: var(--muted-strong);">${escapeHtml(i.incidentType)}</span>
                </td>
                <td>
                    <span class="mono" style="font-size: 0.8rem; font-weight: 600;">${escapeHtml(i.affectedSystem)}</span>
                </td>
                <td>
                    <span class="badge ${getSeverityBadgeClass(i.severity)}" title="${i.severityInfo ? i.severityInfo.suggestedResponse : ''}">
                        ${i.severity} &bull; ${i.severityInfo ? i.severityInfo.classification : ''}
                    </span>
                </td>
                <td>
                    <select class="select-filter" style="padding: 4px 8px; font-size: 0.78rem;" onchange="quickUpdateStatus(${i.incidentId}, this.value)">
                        <option value="Open" ${i.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="In Progress" ${i.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${i.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td class="mono" style="font-size: 0.76rem; color: var(--muted);">${formatDate(i.reportedAt)}</td>
                <td>
                    <div class="action-btn-group">
                        <button type="button" class="btn-icon-action" title="Inspect Incident" onclick="inspectIncident(${i.incidentId})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        ${(AppState.currentUser?.role === 'ADMIN' || AppState.currentUser?.userId === i.userId) ? `
                        <button type="button" class="btn-icon-action btn-icon-delete" title="Delete Incident" onclick="deleteIncident(${i.incidentId})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="color: var(--danger); text-align: center; padding: 24px;">Failed to load incidents: ${err.message}</td></tr>`;
    }
}

// Quick status updater from register dropdown
async function quickUpdateStatus(id, newStatus) {
    try {
        const res = await fetch(`api/incidents/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': AppState.csrfToken
            },
            body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (res.ok && json.success) {
            showToast(`Incident #${id} moved to ${newStatus}`, 'success');
        } else {
            showToast(json.message || 'Failed to update status', 'error');
            loadIncidents();
        }
    } catch (err) {
        showToast('Network error while updating status', 'error');
        loadIncidents();
    }
}

// --- INCIDENT REPORTING CONTROLLER ---
function initSeveritySlider() {
    const slider = document.getElementById('report-severity');
    const valDisplay = document.getElementById('severity-val-display');
    const previewBadge = document.getElementById('preview-badge');
    const previewClass = document.getElementById('preview-classification');
    const previewResp = document.getElementById('preview-response');

    if (!slider) return;

    slider.addEventListener('input', () => {
        const score = parseInt(slider.value, 10);
        if (valDisplay) valDisplay.textContent = score;

        let classification = '';
        let response = '';
        let badgeClass = '';

        if (score <= 3) {
            classification = 'Low Severity';
            response = 'Record and monitor';
            badgeClass = 'badge-low';
        } else if (score <= 6) {
            classification = 'Medium Severity';
            response = 'Investigate and assess impact';
            badgeClass = 'badge-medium';
        } else if (score <= 8) {
            classification = 'High Severity';
            response = 'Prioritize investigation';
            badgeClass = 'badge-high';
        } else {
            classification = 'Critical Severity';
            response = 'Immediate attention';
            badgeClass = 'badge-critical';
        }

        if (previewBadge) {
            previewBadge.className = `badge ${badgeClass}`;
            previewBadge.textContent = `${score} • ${classification.toUpperCase()}`;
        }
        if (previewClass) previewClass.textContent = classification;
        if (previewResp) previewResp.textContent = response;
    });
}

function initReportingForm() {
    const form = document.getElementById('report-incident-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const threat = document.getElementById('report-threat').value.trim();
        const incidentType = document.getElementById('report-type').value;
        const affectedSystem = document.getElementById('report-system').value.trim();
        const description = document.getElementById('report-desc').value.trim();
        const severity = parseInt(document.getElementById('report-severity').value, 10);

        if (!threat || !affectedSystem || !description) {
            showToast('All fields are required.', 'error');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-report');
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Persisting to Oracle...';

        try {
            const res = await fetch('api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': AppState.csrfToken
                },
                body: JSON.stringify({
                    threat,
                    incidentType,
                    affectedSystem,
                    description,
                    severity,
                    status: 'Open'
                })
            });

            const json = await res.json();
            if (res.ok && json.success) {
                showToast(`Incident #${json.data.incidentId} successfully committed to Oracle database.`, 'success');
                form.reset();
                document.getElementById('report-severity').value = 5;
                document.getElementById('report-severity').dispatchEvent(new Event('input'));

                // Switch to Register view to inspect
                setTimeout(() => switchView('register'), 800);
            } else {
                showToast(json.message || 'Error recording incident.', 'error');
            }
        } catch (err) {
            showToast('Failed to contact server: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Commit Incident to Oracle';
        }
    });
}

// --- INCIDENT DETAILS MODAL ---
async function inspectIncident(id) {
    try {
        const res = await fetch(`api/incidents/${id}`);
        if (!res.ok) throw new Error('Incident not found');

        const json = await res.json();
        const inc = json.data;
        if (!inc) return;

        AppState.activeIncidentId = inc.incidentId;

        document.getElementById('modal-incident-id').textContent = `INC-${inc.incidentId}`;
        document.getElementById('modal-incident-title').textContent = inc.threat;
        document.getElementById('modal-type').textContent = inc.incidentType;
        document.getElementById('modal-system').textContent = inc.affectedSystem;

        const sevBadge = document.getElementById('modal-severity-badge');
        sevBadge.className = `badge ${getSeverityBadgeClass(inc.severity)}`;
        sevBadge.textContent = `${inc.severity} • ${inc.severityInfo ? inc.severityInfo.classification : ''}`;

        document.getElementById('modal-status-badge').textContent = inc.status;
        document.getElementById('modal-reporter').textContent = `${inc.reporterName || 'Analyst'} (${inc.reporterEmail || 'operator@veil.sec'})`;
        document.getElementById('modal-timestamp').textContent = formatDate(inc.reportedAt);
        document.getElementById('modal-suggested-response').textContent = inc.severityInfo ? inc.severityInfo.suggestedResponse : 'Standard protocol';
        document.getElementById('modal-description').textContent = inc.description;

        // Delete button permission check
        const delBtn = document.getElementById('btn-modal-delete-incident');
        if (delBtn) {
            if (AppState.currentUser?.role === 'ADMIN' || AppState.currentUser?.userId === inc.userId) {
                delBtn.style.display = 'inline-block';
                delBtn.onclick = () => deleteIncident(inc.incidentId);
            } else {
                delBtn.style.display = 'none';
            }
        }

        openModal('incident-modal');
    } catch (err) {
        showToast('Error loading incident: ' + err.message, 'error');
    }
}

async function updateModalStatus(status) {
    if (!AppState.activeIncidentId) return;
    await quickUpdateStatus(AppState.activeIncidentId, status);
    closeModal('incident-modal');
    loadDashboard();
    loadIncidents();
}

async function deleteIncident(id) {
    if (!confirm(`Are you certain you wish to delete Incident #${id}? This will permanently remove the record from Oracle.`)) {
        return;
    }

    try {
        const res = await fetch(`api/incidents/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-Token': AppState.csrfToken }
        });

        const json = await res.json();
        if (res.ok && json.success) {
            showToast(`Incident #${id} removed from database`, 'success');
            closeModal('incident-modal');
            loadDashboard();
            loadIncidents();
        } else {
            showToast(json.message || 'Delete operation failed', 'error');
        }
    } catch (err) {
        showToast('Error sending delete request: ' + err.message, 'error');
    }
}

// --- USER MANAGEMENT CONTROLLER (ADMIN) ---
function initUserManagement() {
    const openBtn = document.getElementById('btn-open-create-user');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            document.getElementById('create-user-form').reset();
            document.getElementById('user-form-id').value = '';
            document.getElementById('modal-user-heading').textContent = 'Provision Security Operator';
            document.getElementById('user-pw-help').textContent = 'Initial password required (minimum 6 characters).';
            document.getElementById('user-form-password').required = true;
            openModal('user-modal');
        });
    }

    const form = document.getElementById('create-user-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userId = document.getElementById('user-form-id').value;
            const userName = document.getElementById('user-form-name').value.trim();
            const email = document.getElementById('user-form-email').value.trim();
            const password = document.getElementById('user-form-password').value;
            const role = document.getElementById('user-form-role').value;
            const accountStatus = document.getElementById('user-form-status').value;

            const isEdit = Boolean(userId);
            const url = isEdit ? `api/users/${userId}` : 'api/users';
            const method = isEdit ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': AppState.csrfToken
                    },
                    body: JSON.stringify({
                        userName,
                        email,
                        password: password || undefined,
                        role,
                        accountStatus
                    })
                });

                const json = await res.json();
                if (res.ok && json.success) {
                    showToast(isEdit ? 'User updated successfully' : 'User account provisioned', 'success');
                    closeModal('user-modal');
                    loadUsers();
                } else {
                    showToast(json.message || 'Operation failed', 'error');
                }
            } catch (err) {
                showToast('Network error: ' + err.message, 'error');
            }
        });
    }
}

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    try {
        const res = await fetch('api/users');
        if (!res.ok) throw new Error('Failed to retrieve user list');

        const json = await res.json();
        const users = json.data || [];

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px;">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td><span class="incident-id-badge">#${u.userId}</span></td>
                <td style="font-weight: 600;">${escapeHtml(u.userName)}</td>
                <td class="mono" style="font-size: 0.82rem;">${escapeHtml(u.email)}</td>
                <td>
                    <span class="mono" style="font-size: 0.76rem; font-weight: 700; color: ${u.role === 'ADMIN' ? 'var(--cyprus)' : 'var(--muted-strong)'};">
                        ${u.role}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${u.accountStatus === 'ACTIVE' ? 'status-resolved' : 'status-open'}">
                        ${u.accountStatus}
                    </span>
                </td>
                <td class="mono" style="font-size: 0.76rem; color: var(--muted);">${formatDate(u.createdAt)}</td>
                <td>
                    <div class="action-btn-group">
                        <button type="button" class="btn-icon-action" title="Edit User" onclick="editUser(${u.userId}, '${escapeHtml(u.userName)}', '${escapeHtml(u.email)}', '${u.role}', '${u.accountStatus}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </button>
                        ${u.userId !== AppState.currentUser?.userId ? `
                        <button type="button" class="btn-icon-action btn-icon-delete" title="Delete User" onclick="deleteUserAccount(${u.userId})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color: var(--danger); text-align: center; padding: 24px;">${err.message}</td></tr>`;
    }
}

function editUser(id, name, email, role, status) {
    document.getElementById('user-form-id').value = id;
    document.getElementById('user-form-name').value = name;
    document.getElementById('user-form-email').value = email;
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-password').required = false;
    document.getElementById('user-form-role').value = role;
    document.getElementById('user-form-status').value = status;
    document.getElementById('modal-user-heading').textContent = `Edit Operator #${id}`;
    document.getElementById('user-pw-help').textContent = 'Leave password blank to preserve existing password.';
    openModal('user-modal');
}

async function deleteUserAccount(id) {
    if (!confirm(`Are you certain you wish to delete User #${id}?`)) return;

    try {
        const res = await fetch(`api/users/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-Token': AppState.csrfToken }
        });
        const json = await res.json();
        if (res.ok && json.success) {
            showToast(`User #${id} removed.`, 'success');
            loadUsers();
        } else {
            showToast(json.message || 'Deletion failed', 'error');
        }
    } catch (err) {
        showToast('Error deleting user: ' + err.message, 'error');
    }
}

// --- LOGOUT CONTROLLER ---
function initLogout() {
    const logoutBtn = document.getElementById('btn-logout');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('api/auth/logout', { method: 'POST' });
        } catch (e) {}
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// --- MODAL UTILITIES ---
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
}

// Close on background click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// --- TOAST NOTIFICATION UTILITY ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button type="button" style="background: none; border: none; font-size: 1.1rem; cursor: pointer; color: inherit;" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}

// --- HELPER UTILITIES ---
function getSeverityBadgeClass(score) {
    if (score >= 9) return 'badge-critical';
    if (score >= 7) return 'badge-high';
    if (score >= 4) return 'badge-medium';
    return 'badge-low';
}

function formatDate(timestamp) {
    if (!timestamp) return '—';
    try {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return String(timestamp);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function animateCounter(elId, targetVal) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = targetVal;
}
