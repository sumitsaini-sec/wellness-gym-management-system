/**
 * Wellness Gym - Authentication
 * Admin: Admin123 / @Branch
 * Members: registered by admin, stored in localStorage
 */

const AUTH_KEY = 'wellness_gym_auth';
const MEMBERS_KEY = 'wellness_gym_members';
const ADMIN_USERNAME = 'Admin123';
const ADMIN_PASSWORD = '@Branch';

const PUBLIC_PAGES = ['login.html'];

function getAuth() {
    try {
        const data = sessionStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function setAuth(user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearAuth() {
    sessionStorage.removeItem(AUTH_KEY);
}

function isAdmin() {
    const auth = getAuth();
    return auth && auth.role === 'admin';
}

function isLoggedIn() {
    return getAuth() !== null;
}

function getMembers() {
    try {
        const data = localStorage.getItem(MEMBERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveMembers(members) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

function getCurrentMember() {
    const auth = getAuth();
    if (!auth || auth.role !== 'member') return null;
    
    const members = getMembers();
    let member = null;
    
    if (auth.memberId) {
        member = members.find(m => m.id === auth.memberId);
    }
    
    if (!member) {
        const lookup = (auth.username || '').trim().toLowerCase();
        member = members.find(m => {
            const mu = (m.username || m.email || '').trim().toLowerCase();
            return mu === lookup;
        });
    }
    
    if (member && !auth.memberId && member.id) {
        setAuth({ ...auth, memberId: member.id });
    }
    
    return member;
}

function login(username, password) {
    const u = (username || '').trim();
    const p = (password || '').trim();
    if (!u || !p) return { ok: false, msg: 'Please enter username and password.' };

    // Admin check
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
        setAuth({ username: u, role: 'admin', name: 'Admin' });
        return { ok: true, role: 'admin' };
    }

    // Member check (compare trimmed; allow login by username or email)
    const members = getMembers();
    const member = members.find(m => {
        const mu = (m.username || m.email || '').trim().toLowerCase();
        const mp = (m.password || '').trim();
        return mu === u.toLowerCase() && mp === p;
    });
    if (member) {
        setAuth({ 
            username: member.username || member.email, 
            role: 'member', 
            name: member.name,
            memberId: member.id
        });
        return { ok: true, role: 'member' };
    }

    return { ok: false, msg: 'Invalid username or password.' };
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

function requireAuth() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (PUBLIC_PAGES.includes(page)) {
        if (isLoggedIn()) {
            window.location.href = 'index.html';
        }
        return;
    }
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function requireAdmin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    if (!isAdmin()) {
        if (typeof showNotification === 'function') {
            showNotification('Admin access required.', 'error');
        } else {
            alert('Admin access required.');
        }
        window.location.href = 'index.html';
    }
}
