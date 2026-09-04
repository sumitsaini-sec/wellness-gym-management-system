(function () {
    var MEMBERS_KEY = 'wellness_gym_members';

    var FEE_PACKAGES = {
        basic: { name: 'Basic Monthly', fee: 1200, durationMonths: 1 },
        standard: { name: 'Standard Monthly', fee: 1800, durationMonths: 1 },
        premium: { name: 'Premium Monthly', fee: 2600, durationMonths: 1 },
        quarterly: { name: 'Quarterly Saver', fee: 4800, durationMonths: 3 },
        annual: { name: 'Annual Pro', fee: 16000, durationMonths: 12 }
    };

    var tbody = document.getElementById('membersTableBody');
    var emptyEl = document.getElementById('membersEmpty');
    var totalMembersEl = document.getElementById('totalMembersCount');
    var presentTodayEl = document.getElementById('presentTodayCount');
    var totalCollectedEl = document.getElementById('totalCollectedAmount');

    if (!tbody || !emptyEl) return;

    function readMembers() {
        if (typeof getMembers === 'function') return getMembers();
        try {
            var raw = localStorage.getItem(MEMBERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (err) { return []; }
    }

    function writeMembers(members) {
        if (typeof saveMembers === 'function') { saveMembers(members); return; }
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    }

    function todayKey() { return new Date().toISOString().slice(0, 10); }

    function formatDate(isoDate) {
        if (!isoDate) return '-';
        var date = new Date(isoDate);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString();
    }

    function formatDateTime(isoDate) {
        if (!isoDate) return '-';
        var date = new Date(isoDate);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString();
    }

    function formatCurrency(amount) { return 'Rs ' + Number(amount || 0).toFixed(2); }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function generateMemberId() { return 'M-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

    function normalizeMembers(members) {
        var changed = false;
        var normalized = (Array.isArray(members) ? members : []).map(function (member) {
            var nextMember = Object.assign({}, member);
            if (!nextMember.id) { nextMember.id = generateMemberId(); changed = true; }
            if (!Array.isArray(nextMember.attendanceLog)) { nextMember.attendanceLog = []; changed = true; }
            if (!Array.isArray(nextMember.bills)) { nextMember.bills = []; changed = true; }
            if (nextMember.assignedPackage && typeof nextMember.assignedPackage !== 'object') { nextMember.assignedPackage = null; changed = true; }
            return nextMember;
        });
        if (changed) writeMembers(normalized);
        return normalized;
    }

    function getCurrentMembers() { return normalizeMembers(readMembers()); }

    function saveAndRender(members, notification, type) {
        writeMembers(members); render();
        if (notification && typeof showNotification === 'function') showNotification(notification, type || 'success');
    }

    function isPresentToday(member) { return (member.attendanceLog || []).indexOf(todayKey()) !== -1; }
    function getLastAttendance(member) { return (!member.attendanceLog || !member.attendanceLog.length) ? null : member.attendanceLog[member.attendanceLog.length - 1]; }

    function upsertMember(members, memberId, updater) {
        var index = members.findIndex(function (member) { return member.id === memberId; });
        if (index === -1) return members;
        var nextMembers = members.slice();
        var nextMember = Object.assign({}, nextMembers[index]);
        updater(nextMember); nextMembers[index] = nextMember;
        return nextMembers;
    }

    function assignPackage(memberId, packageKey, customFeeInput) {
        var selectedPackage = FEE_PACKAGES[packageKey];
        if (!selectedPackage) { if (typeof showNotification === 'function') showNotification('Please select a fee package.', 'error'); return; }
        var customFee = Number(customFeeInput);
        if (isNaN(customFee) || customFee <= 0) { if (typeof showNotification === 'function') showNotification('Fee amount must be greater than 0.', 'error'); return; }
        var members = getCurrentMembers();
        var nowIso = new Date().toISOString();
        members = upsertMember(members, memberId, function (member) {
            member.assignedPackage = { key: packageKey, name: selectedPackage.name, fee: Number(customFee.toFixed(2)), durationMonths: selectedPackage.durationMonths, assignedAt: nowIso };
        });
        saveAndRender(members, 'Package assigned successfully.');
    }

    function markAttendance(memberId) {
        var today = todayKey();
        var members = getCurrentMembers();
        members = upsertMember(members, memberId, function (member) {
            var log = Array.isArray(member.attendanceLog) ? member.attendanceLog.slice() : [];
            if (log.indexOf(today) === -1) { log.push(today); log.sort(); }
            member.attendanceLog = log;
        });
        saveAndRender(members, 'Attendance marked for today.');
    }

    function createBill(memberId, amountInput) {
        var amount = Number(amountInput);
        if (isNaN(amount) || amount <= 0) { if (typeof showNotification === 'function') showNotification('Bill amount must be greater than 0.', 'error'); return; }
        var members = getCurrentMembers();
        var now = new Date();
        members = upsertMember(members, memberId, function (member) {
            var packageName = member.assignedPackage ? member.assignedPackage.name : 'General Membership';
            var billId = 'BILL-' + now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
            var receiptNo = 'RCPT-' + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '-' + Math.floor(Math.random() * 900 + 100);
            var bill = { id: billId, receiptNo: receiptNo, packageName: packageName, amount: Number(amount.toFixed(2)), paidOn: now.toISOString(), notes: 'Membership fee paid' };
            member.bills = Array.isArray(member.bills) ? member.bills.concat([bill]) : [bill];
        });
        saveAndRender(members, 'Bill created and receipt generated.');
    }

    function findBill(member, billId) {
        if (!member || !Array.isArray(member.bills)) return null;
        return member.bills.find(function (bill) { return bill.id === billId; }) || null;
    }

    function buildReceiptHtml(member, bill) {
        var businessDate = formatDateTime(bill.paidOn);
        var packageName = escapeHtml(bill.packageName || '-');
        return [
            '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<title>Receipt ' + escapeHtml(bill.receiptNo) + '</title>',
            '<style>body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#0f172a}.receipt{max-width:700px;margin:0 auto;border:1px solid #cbd5e1;border-radius:10px;padding:24px}.top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}.brand{font-size:30px;font-weight:700}.muted{color:#64748b;font-size:14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:16px 0 20px}.box{border:1px solid #e2e8f0;border-radius:8px;padding:12px}.label{font-size:12px;text-transform:uppercase;color:#64748b}.value{font-size:15px;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #e2e8f0;padding:10px;text-align:left}th{background:#f8fafc}.total{margin-top:14px;text-align:right;font-size:18px;font-weight:700}.print-button{margin-top:16px;padding:10px 18px;border:0;border-radius:6px;background:#16a34a;color:#fff;cursor:pointer}@media print{.print-button{display:none}body{padding:0}.receipt{border:none}}</style></head><body>',
            '<div class="receipt"><div class="top"><div><div class="brand">WELLNESS GYM</div><div class="muted">Official Payment Receipt</div></div><div><div><strong>Receipt No:</strong> ' + escapeHtml(bill.receiptNo) + '</div><div><strong>Date:</strong> ' + escapeHtml(businessDate) + '</div></div></div>',
            '<div class="grid"><div class="box"><div class="label">Member Name</div><div class="value">' + escapeHtml(member.name || '-') + '</div></div><div class="box"><div class="label">Username</div><div class="value">' + escapeHtml(member.username || member.email || '-') + '</div></div><div class="box"><div class="label">Email</div><div class="value">' + escapeHtml(member.email || '-') + '</div></div><div class="box"><div class="label">Phone</div><div class="value">' + escapeHtml(member.phone || '-') + '</div></div></div>',
            '<table><thead><tr><th>Description</th><th>Package</th><th>Amount</th></tr></thead><tbody><tr><td>Membership Fee</td><td>' + packageName + '</td><td>' + formatCurrency(bill.amount) + '</td></tr></tbody></table>',
            '<div class="total">Total Paid: ' + formatCurrency(bill.amount) + '</div><button class="print-button" onclick="window.print()">Print Receipt</button></div></body></html>'
        ].join('');
    }

    function openReceipt(memberId, billId, printMode) {
        var members = getCurrentMembers();
        var member = members.find(function (entry) { return entry.id === memberId; });
        if (!member) { if (typeof showNotification === 'function') showNotification('Member not found for receipt.', 'error'); return; }
        var bill = findBill(member, billId);
        if (!bill) { if (typeof showNotification === 'function') showNotification('Receipt not found for this bill.', 'error'); return; }
        var receiptWindow = window.open('', '_blank', 'width=900,height=760');
        if (!receiptWindow) { if (typeof showNotification === 'function') showNotification('Popup blocked. Please allow popups for receipt view.', 'error'); return; }
        receiptWindow.document.open(); receiptWindow.document.write(buildReceiptHtml(member, bill)); receiptWindow.document.close();
        if (printMode) { receiptWindow.focus(); receiptWindow.print(); }
    }

    function buildPackageOptions(selectedKey) {
        return ['<option value="">Select package</option>'].concat(Object.keys(FEE_PACKAGES).map(function (key) {
            var item = FEE_PACKAGES[key];
            var selected = selectedKey === key ? ' selected' : '';
            return '<option value="' + key + '"' + selected + '>' + escapeHtml(item.name) + ' (' + formatCurrency(item.fee) + ')</option>';
        })).join('');
    }

    function renderStats(members) {
        var presentCount = members.filter(function (member) { return isPresentToday(member); }).length;
        var totalCollected = members.reduce(function (sum, member) {
            return sum + (member.bills || []).reduce(function (innerSum, bill) { return innerSum + Number(bill.amount || 0); }, 0);
        }, 0);
        if (totalMembersEl) totalMembersEl.textContent = String(members.length);
        if (presentTodayEl) presentTodayEl.textContent = String(presentCount);
        if (totalCollectedEl) totalCollectedEl.textContent = formatCurrency(totalCollected);
    }

    function render() {
        var members = getCurrentMembers();
        if (members.length === 0) { tbody.innerHTML = ''; emptyEl.style.display = 'block'; renderStats([]); return; }
        emptyEl.style.display = 'none'; renderStats(members);
        tbody.innerHTML = members.map(function (member, index) {
            var registeredDate = formatDate(member.registeredAt);
            var attendanceToday = isPresentToday(member);
            var lastAttendance = getLastAttendance(member);
            var packageInfo = member.assignedPackage || null;
            var selectedPackageKey = packageInfo ? packageInfo.key : '';
            var feeAmount = packageInfo ? Number(packageInfo.fee || 0) : 0;
            var latestBill = (member.bills || [])[member.bills.length - 1] || null;
            var contactHtml = '<div class="member-contact-cell"><span>' + escapeHtml(member.email || '-') + '</span><span>' + escapeHtml(member.phone || '-') + '</span></div>';
            var packageHtml = '<div class="member-inline-fields"><select class="member-package-select" data-member-id="' + member.id + '">' + buildPackageOptions(selectedPackageKey) + '</select><input type="number" min="1" step="1" class="member-fee-input" data-member-id="' + member.id + '" value="' + (feeAmount || '') + '" placeholder="Fee"><button type="button" class="btn btn-small member-assign-btn" data-member-id="' + member.id + '">Assign</button></div><p class="member-package-current">' + (packageInfo ? escapeHtml(packageInfo.name) + ' | ' + formatCurrency(packageInfo.fee) + ' | assigned ' + escapeHtml(formatDate(packageInfo.assignedAt)) : 'Not assigned') + '</p>';
            var attendanceHtml = '<div class="member-attendance"><span class="attendance-badge ' + (attendanceToday ? 'is-present' : 'is-absent') + '">' + (attendanceToday ? 'Present' : 'Not marked') + '</span><button type="button" class="btn btn-small member-attendance-btn" data-member-id="' + member.id + '" ' + (attendanceToday ? 'disabled' : '') + '>' + (attendanceToday ? 'Marked' : 'Mark Today') + '</button><small>Last: ' + escapeHtml(formatDate(lastAttendance)) + '</small></div>';
            var billingHtml = '<div class="member-billing"><div class="member-inline-fields"><input type="number" min="1" step="1" class="member-bill-input" data-member-id="' + member.id + '" value="' + (feeAmount || '') + '" placeholder="Amount"><button type="button" class="btn btn-small member-bill-btn" data-member-id="' + member.id + '">Create Bill</button></div><small>Bills: ' + (member.bills || []).length + '</small>' + (latestBill ? '<small>Latest: ' + escapeHtml(latestBill.receiptNo) + '</small>' : '<small>No bill yet</small>') + '</div>';
            var actionsHtml = latestBill ? '<div class="member-action-buttons"><button type="button" class="btn btn-small btn-ghost member-view-receipt-btn" data-member-id="' + member.id + '" data-bill-id="' + latestBill.id + '">View Receipt</button><button type="button" class="btn btn-small btn-ghost member-print-receipt-btn" data-member-id="' + member.id + '" data-bill-id="' + latestBill.id + '">Print</button></div>' : '<span class="members-muted-text">Generate a bill to enable receipt.</span>';
            return '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(member.name || '-') + '</td><td>' + escapeHtml(member.username || member.email || '-') + '</td><td>' + contactHtml + '</td><td>' + packageHtml + '</td><td>' + attendanceHtml + '</td><td>' + billingHtml + '</td><td>' + escapeHtml(registeredDate) + '</td><td>' + actionsHtml + '</td></tr>';
        }).join('');
    }

    tbody.addEventListener('change', function (event) {
        var packageSelect = event.target.closest('.member-package-select');
        if (!packageSelect) return;
        var memberId = packageSelect.getAttribute('data-member-id');
        var packageKey = packageSelect.value;
        var row = packageSelect.closest('tr');
        var feeInput = row ? row.querySelector('.member-fee-input[data-member-id="' + memberId + '"]') : null;
        if (feeInput && packageKey && FEE_PACKAGES[packageKey]) feeInput.value = String(FEE_PACKAGES[packageKey].fee);
    });

    tbody.addEventListener('click', function (event) {
        var assignBtn = event.target.closest('.member-assign-btn');
        if (assignBtn) {
            var assignMemberId = assignBtn.getAttribute('data-member-id');
            var assignRow = assignBtn.closest('tr');
            var packageSelect = assignRow ? assignRow.querySelector('.member-package-select[data-member-id="' + assignMemberId + '"]') : null;
            var feeInput = assignRow ? assignRow.querySelector('.member-fee-input[data-member-id="' + assignMemberId + '"]') : null;
            assignPackage(assignMemberId, packageSelect ? packageSelect.value : '', feeInput ? feeInput.value : ''); return;
        }
        var attendanceBtn = event.target.closest('.member-attendance-btn');
        if (attendanceBtn) { markAttendance(attendanceBtn.getAttribute('data-member-id')); return; }
        var billBtn = event.target.closest('.member-bill-btn');
        if (billBtn) {
            var billMemberId = billBtn.getAttribute('data-member-id');
            var billRow = billBtn.closest('tr');
            var amountInput = billRow ? billRow.querySelector('.member-bill-input[data-member-id="' + billMemberId + '"]') : null;
            createBill(billMemberId, amountInput ? amountInput.value : ''); return;
        }
        var viewReceiptBtn = event.target.closest('.member-view-receipt-btn');
        if (viewReceiptBtn) { openReceipt(viewReceiptBtn.getAttribute('data-member-id'), viewReceiptBtn.getAttribute('data-bill-id'), false); return; }
        var printReceiptBtn = event.target.closest('.member-print-receipt-btn');
        if (printReceiptBtn) openReceipt(printReceiptBtn.getAttribute('data-member-id'), printReceiptBtn.getAttribute('data-bill-id'), true);
    });

    render();
})();
