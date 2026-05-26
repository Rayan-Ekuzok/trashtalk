const INACTIVITY_LIMIT = 10 * 60 * 1000  // 10 minutes en ms
const REFRESH_BEFORE   =  2 * 60 * 1000  // refresh si < 2 min restantes
const CHECK_INTERVAL   = 30 * 1000       // vérifie toutes les 30 secondes

let lastActivity   = Date.now()
let checkTimer     = null
let onLogoutCb     = null   // callback appelé quand session expire

// ── Événements d'activité ─────────────────────────────────────────────────────
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

function resetActivity() {
  lastActivity = Date.now()
}

// ── Décode le payload JWT sans vérification (juste lire l'exp) ────────────────
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// ── Calcule les ms restantes avant expiration du token ────────────────────────
function msUntilExpiry(token) {
  const decoded = decodeToken(token)
  if (!decoded?.exp) return 0
  return decoded.exp * 1000 - Date.now()
}

// ── Récupère le token stocké ──────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('token')
}

// ── Sauvegarde token + user ───────────────────────────────────────────────────
export function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

// ── Efface la session ─────────────────────────────────────────────────────────
export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ── Refresh du token auprès du serveur ───────────────────────────────────────
async function refreshToken() {
  const token = getToken()
  if (!token) return

  try {
    const res  = await fetch('http://localhost:3000/auth/refresh', {
      method: 'POST',
      headers: authHeaders()
    })
    const data = await res.json()

    if (data.success && data.token) {
      localStorage.setItem('token', data.token)
    } else {
      // Token refusé → déconnexion
      logout()
    }
  } catch {
    // Serveur injoignable → on laisse le timer continuer
  }
}

// ── Déconnexion avec callback vers App.vue ────────────────────────────────────
export function logout() {
  stopSessionWatch()
  clearSession()
  if (typeof onLogoutCb === 'function') onLogoutCb()
}

// ── Boucle de surveillance ────────────────────────────────────────────────────
async function checkSession() {
  const token = getToken()
  if (!token) { logout(); return }

  const inactiveFor = Date.now() - lastActivity
  const tokenMsLeft = msUntilExpiry(token)

  // Inactif depuis plus de 10 min → déconnexion
  if (inactiveFor >= INACTIVITY_LIMIT) {
    logout()
    return
  }

  // Token expire bientôt ET l'utilisateur est actif → refresh
  if (tokenMsLeft < REFRESH_BEFORE && inactiveFor < INACTIVITY_LIMIT) {
    await refreshToken()
  }

  // Token déjà expiré côté JWT → déconnexion
  if (tokenMsLeft <= 0) {
    logout()
  }
}

// ── Démarre la surveillance (appelé après login) ──────────────────────────────
export function startSessionWatch(onLogout) {
  onLogoutCb = onLogout

  // Écoute l'activité utilisateur
  ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetActivity, { passive: true }))
  resetActivity()

  // Lance la boucle de vérification
  checkTimer = setInterval(checkSession, CHECK_INTERVAL)
}

// ── Arrête la surveillance (appelé à la déconnexion) ─────────────────────────
export function stopSessionWatch() {
  ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetActivity))
  if (checkTimer) { clearInterval(checkTimer); checkTimer = null }
}

// ── Helper : construit le header Authorization pour fetch ─────────────────────
export function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  }
}