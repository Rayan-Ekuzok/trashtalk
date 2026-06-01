<template>
  <div id="app">
    <NavBar     :nav="nav" :user="user" @go="go" @logout="onLogout" />
    <Accueil    :nav="nav" :user="user" @go="go" />
    <Carte      :nav="nav" :user="user" />
    <Connexion  :nav="nav" @ok="onLogin" />
    <Admin      :nav="nav" :user="user" />
    <Conducteur :nav="nav" :user="user" />
    <GestionCarte :nav="nav" :user="user" />

    <div v-if="expired" class="overlay">
      <div class="popup">
        <span class="popup-icon">⏱</span>
        <h2>Session expirée</h2>
        <p>Vous avez été déconnecté après 10 minutes d'inactivité.</p>
        <button @click="expired = false; go(2)">Se reconnecter</button>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar      from './components/NavBar.vue'
import Accueil     from './components/Accueil.vue'
import Carte       from './components/Maps.vue'
import Connexion   from './components/Login.vue'
import Admin       from './components/AdminView.vue'
import Conducteur  from './components/ConducteurView.vue'
import GestionCarte from './components/AdminCarte.vue'

// ------------------
// Constantes session
// ------------------
const REFRESH_BEFORE = 2 * 60 * 1000
const CHECK_INTERVAL = 30 * 1000
const INACTIVITY_LIMIT = 600000
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

// ------------------
// Helpers token
// ------------------
function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}
function msUntilExpiry(token) {
  const d = decodeToken(token)
  return d?.exp ? d.exp * 1000 - Date.now() : 0
}
function getToken() {
  return localStorage.getItem('token')
}
function isTokenValid() {
  const t = getToken()
  return t ? msUntilExpiry(t) > 0 : false
}
function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  }
}

export default {
  components: { NavBar, Accueil, Carte, Connexion, Admin, Conducteur, GestionCarte },

  data() {
    return {
      nav: 0,
      user: null,
      expired: false,
      lastActivity: Date.now(),
      checkTimer: null
    }
  },

  // ------------------
  // Lifecycle
  // ------------------
  mounted() {
    const saved = localStorage.getItem('user')
    const token = getToken()
    if (saved && token) {
      if (!isTokenValid()) {
        clearSession()
        this.expired = true
      } else {
        this.user = JSON.parse(saved)
        this.startSessionWatch()
      }
    }

    // Expose authHeaders à tous les composants
    this.$app = this
    this.$.appContext.app.config.globalProperties.$auth = authHeaders
  },

  beforeUnmount() {
    this.stopSessionWatch()
  },

  // ------------------
  // Méthodes
  // ------------------
  methods: {
    go(n) {
      this.nav = n
    },

    onLogin({ token, user }) {
      saveSession(token, user)
      this.user = user
      this.expired = false
      this.nav = 0
      this.startSessionWatch()
    },

    onLogout() {
      this.stopSessionWatch()
      clearSession()
      this.user = null
      this.nav = 0
    },

    onExpired() {
      this.stopSessionWatch()
      clearSession()
      this.user = null
      this.nav = 0
      this.expired = true
    },

    // ------------------
    // Gestion de session
    // ------------------
    resetActivity() {
      this.lastActivity = Date.now()
    },

    startSessionWatch() {
      ACTIVITY_EVENTS.forEach(e =>
        window.addEventListener(e, this.resetActivity, { passive: true })
      )
      this.resetActivity()
      this.checkTimer = setInterval(() => this.checkSession(), CHECK_INTERVAL)
    },

    stopSessionWatch() {
      ACTIVITY_EVENTS.forEach(e =>
        window.removeEventListener(e, this.resetActivity)
      )
      if (this.checkTimer) {
        clearInterval(this.checkTimer)
        this.checkTimer = null
      }
    },

    async checkSession() {
      const token = getToken()
      if (!token) { this.onExpired(); return }

      const inactive = Date.now() - this.lastActivity
      const msLeft   = msUntilExpiry(token)

      if (inactive >= INACTIVITY_LIMIT) { this.onExpired(); return }

      if (msLeft < REFRESH_BEFORE && inactive < INACTIVITY_LIMIT) {
        await this.refreshToken()
      }

      if (msLeft <= 0) this.onExpired()
    },

    async refreshToken() {
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
          this.onExpired()
        }
      } catch { /* serveur injoignable, on continue */ }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

/* ------------------
   Base
------------------ */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f1117; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; }

/* ------------------
   Page
------------------ */
.page        { min-height: 100vh; padding: 32px; }
.page-center { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; }

/* ------------------
   Barre de navigation
------------------ */
.navbar {
  display: flex; align-items: center; padding: 0 24px; height: 49px;
  background: #0f1117; border-bottom: 1px solid #2d3748;
  position: sticky; top: 0; z-index: 1000;
}
.navbar-lien        { color: #718096; margin-right: 2em; cursor: pointer; font-size: 0.88rem; white-space: nowrap; }
.navbar-lien-admin { color: #f6ad55; font-weight: 600; }
.navbar-lien-carte { color: #42b983; font-weight: 600; }
.navbar-lien-conducteur { color: #63b3ed; font-weight: 600; }
.navbar-lien-deconnexion { margin-left: auto; margin-right: 0; color: #fc8181; }
.navbar-utilisateur { margin-left: 16px; font-size: 0.75rem; color: #4a5568; font-family: 'IBM Plex Mono', monospace; }

/* ------------------
   En-tête de page
------------------ */
.entete             { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2d3748; padding-bottom: 24px; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.entete-gauche     { display: flex; align-items: center; gap: 16px; }
.entete-icone      { font-size: 2rem; background: #1e2330; border: 1px solid #2d3748; border-radius: 10px; padding: 10px 14px; }
.entete-titre      { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.03em; color: #f7fafc; }
.entete-sous-titre { font-size: 0.8rem; color: #718096; font-family: 'IBM Plex Mono', monospace; margin-top: 2px; }
.entete-stats      { display: flex; gap: 16px; flex-wrap: wrap; }

/* ------------------
   Statistique
------------------ */
.stat         { text-align: center; background: #1a1f2e; border: 1px solid #2d3748; border-radius: 10px; padding: 12px 20px; }
.stat-nombre { display: block; font-size: 1.6rem; font-weight: 600; font-family: 'IBM Plex Mono', monospace; color: #f7fafc; }
.stat-libelle { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; }

/* ------------------
   Onglets
------------------ */
.onglets         { display: flex; gap: 8px; margin-bottom: 28px; border-bottom: 1px solid #2d3748; }
.onglet          { background: none; border: none; border-bottom: 2px solid transparent; padding: 10px 18px; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.88rem; color: #718096; cursor: pointer; margin-bottom: -1px; }
.onglet-actif   { color: #42b983; border-bottom-color: #42b983; font-weight: 600; }

/* ------------------
   Panneau
------------------ */
.panneau         { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.panneau-titre  { font-size: 0.95rem; font-weight: 600; color: #f7fafc; padding-bottom: 14px; border-bottom: 1px solid #2d3748; }
.panneau-desc   { font-size: 0.82rem; color: #718096; }

/* ------------------
   Formulaire
------------------ */
.champ          { display: flex; flex-direction: column; gap: 6px; }
.champ-label   { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; }
.champ-input,
.champ-select  {
  background: #111827; border: 1px solid #2d3748; border-radius: 8px;
  padding: 10px 12px; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.88rem; outline: none;
}
.champ-input:focus,
.champ-select:focus { border-color: #42b983; }
.champ-input::placeholder { color: #4a5568; }
.champ-select option { background: #1a1f2e; }
.champ-ligne { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ------------------
   Boutons
------------------ */
.btn-principal  { background: #276749; color: #c6f6d5; border: none; border-radius: 8px; padding: 11px; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; }
.btn-principal:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondaire { background: transparent; color: #718096; border: 1px solid #2d3748; border-radius: 8px; padding: 10px; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.85rem; cursor: pointer; }
.btn-valider    { background: #276749; color: #c6f6d5; border: none; border-radius: 8px; padding: 9px 0; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; flex: 1; }
.btn-rejeter    { background: #742a2a; color: #fed7d7; border: none; border-radius: 8px; padding: 9px 0; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; flex: 1; }
.btn-valider:disabled,
.btn-rejeter:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-bascule         { border: 1px solid #2d3748; border-radius: 8px; padding: 8px 16px; font-size: 0.85rem; cursor: pointer; }
.btn-bascule-actif  { background: #2d2a1a; color: #f6ad55; border-color: #f6ad5544; }
.btn-bascule-inactif { background: #111827; color: #718096; }

/* ------------------
   Messages
------------------ */
.message           { font-size: 0.8rem; font-family: 'IBM Plex Mono', monospace; border-radius: 6px; padding: 8px 10px; }
.message-succes   { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7833; }
.message-erreur   { background: #2d1a1a; color: #fc8181; border: 1px solid #fc818133; }
.message-avertissement { background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5533; }
.retour            { font-size: 0.8rem; font-family: 'IBM Plex Mono', monospace; border-radius: 6px; padding: 6px 10px; margin-top: 10px; }
.retour-succes    { background: #1a2d1f; color: #48bb78; }
.retour-avertissement { background: #2d2a1a; color: #f6ad55; }
.retour-erreur    { background: #2d1a1a; color: #fc8181; }

/* ------------------
   Cartes
------------------ */
.grille              { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.carte-item          { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 12px; padding: 20px; }
.carte-item-vert    { border-left: 3px solid #48bb78; }
.carte-item-jaune   { border-left: 3px solid #f6ad55; }
.carte-item-gris    { border-left: 3px solid #4a5568; opacity: 0.7; }
.carte-item-rouge   { border-left: 3px solid #fc8181; }
.carte-item-attenué { opacity: 0.7; }
.carte-item-traitement { opacity: 0.6; pointer-events: none; }

.carte-item-entete  { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.carte-item-id      { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; border-radius: 4px; padding: 2px 7px; }
.carte-item-date    { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; color: #4a5568; margin-left: auto; }
.carte-item-texte   { font-size: 0.95rem; line-height: 1.5; color: #cbd5e0; margin-bottom: 16px; border-left: 2px solid #2d3748; padding-left: 10px; }
.carte-item-texte-attenué { color: #718096; }
.carte-item-meta    { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.carte-item-ligne   { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #a0aec0; }
.carte-item-actions { display: flex; gap: 10px; }
.carte-item-section { margin-bottom: 12px; padding: 12px; background: #111827; border-radius: 8px; border: 1px solid #1f2937; }
.carte-item-section-label { margin-bottom: 6px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5568; }
.carte-item-valeur  { font-size: 0.85rem; color: #a0aec0; margin: 3px 0; }
.carte-item-coords  { font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; color: #4a5568; }

// ------------------
// Couleurs d'identifiant par section
// ------------------
.admin       .carte-item-id { color: #f6ad55; background: #2d2a1a; border: 1px solid #f6ad5533; }
.conducteur  .carte-item-id { color: #63b3ed; background: #1a2535; border: 1px solid #63b3ed33; }
.gestion-carte .carte-item-id { color: #42b983; background: #1a2d1f; border: 1px solid #42b98333; }

/* ------------------
   Badges
------------------ */
.badge                  { font-size: 0.72rem; font-weight: 600; border-radius: 5px; padding: 2px 8px; }
.badge-vert            { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7844; }
.badge-jaune           { background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5544; }
.badge-gris            { background: #1a1f2e; color: #718096; border: 1px solid #4a574844; }
.badge-valide          { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7844; }
.badge-rejeté          { background: #2d1a1a; color: #fc8181; border: 1px solid #fc818144; }
.badge-avertissement    { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5544; border-radius: 4px; padding: 1px 5px; margin-left: 6px; }
.badge-avertissement-critique { background: #2d1a1a; color: #fc8181; border-color: #fc818144; }
.badge-banni            { font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; background: #fc8181; color: #1a0a0a; font-weight: 700; border-radius: 4px; padding: 1px 6px; margin-left: 4px; }
.badge-conducteur       { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; background: #1e2330; color: #a0aec0; border: 1px solid #2d3748; border-radius: 4px; padding: 2px 7px; margin-left: auto; }

/* ------------------
   Titre de section et points
------------------ */
.section-titre          { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #718096; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
section                 { margin-bottom: 40px; }
.point                  { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.point-vert            { background: #48bb78; }
.point-jaune           { background: #f6ad55; }
.point-gris            { background: #4a5568; }

/* ------------------
   Liste d'éléments
------------------ */
.liste-elements          { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; padding-right: 4px; }
.liste-elements::-webkit-scrollbar       { width: 4px; }
.liste-elements::-webkit-scrollbar-track { background: #111827; border-radius: 99px; }
.liste-elements::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 99px; }
.element-ligne           { display: flex; align-items: center; justify-content: space-between; background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 10px 12px; gap: 8px; }
.element-info            { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.element-nom             { font-size: 0.85rem; color: #e2e8f0; font-weight: 500; }
.element-sous-titre      { font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; color: #4a5568; }
.element-droite          { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 80px; }
.element-coords          { font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; color: #4a5568; }

/* ------------------
   Barre de remplissage
------------------ */
.barre-fond             { height: 6px; background: #111827; border-radius: 99px; overflow: hidden; }
.barre-fond-petite     { width: 80px; height: 5px; background: #1f2937; }
.barre-remplissage      { height: 100%; border-radius: 99px; }
.barre-remplissage-ok  { background: #48bb78; }
.barre-remplissage-mid { background: #f6ad55; }
.barre-remplissage-plein { background: #fc8181; }
.barre-legende          { display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; color: #718096; }

/* ------------------
   Aperçu
------------------ */
.apercu         { background: #111827; border: 1px solid #2d3748; border-radius: 8px; padding: 12px 14px; }
.apercu-label  { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5568; margin-bottom: 4px; }
.apercu-valeur { font-size: 0.88rem; color: #a0aec0; font-family: 'IBM Plex Mono', monospace; }

/* ------------------
   Synthèse
------------------ */
.synthese-liste   { display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto; }
.synthese-ligne   { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.synthese-entete  { display: flex; align-items: center; gap: 8px; }
.synthese-compteur { margin-left: auto; font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; color: #718096; }
.synthese-tags    { display: flex; flex-wrap: wrap; gap: 6px; }
.synthese-tag     { font-size: 0.72rem; background: #1a1f2e; border: 1px solid #2d3748; border-radius: 4px; padding: 2px 8px; color: #a0aec0; font-family: 'IBM Plex Mono', monospace; }
.synthese-vide    { font-size: 0.75rem; color: #4a5568; font-family: 'IBM Plex Mono', monospace; }

/* ------------------
   Carte Leaflet
------------------ */
.page-carte   { display: flex; height: calc(100vh - 49px); }
#carte-leaflet { flex: 1; min-width: 0; z-index: 1; }
.panneau-lateral  { width: 340px; min-width: 340px; background: #0f1117; border-left: 1px solid #2d3748; overflow-y: auto; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; }
.panneau-lateral-vide    { text-align: center; padding: 60px 20px; color: #4a5568; font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; line-height: 1.6; }
.panneau-lateral-vide span { display: block; font-size: 2.5rem; margin-bottom: 12px; }
.panneau-lateral-entete  { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #2d3748; }
.panneau-lateral-entete h2 { font-size: 1.1rem; font-weight: 600; color: #f7fafc; margin-bottom: 4px; }
.panneau-lateral-cp      { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: #718096; }
.panneau-lateral-fermer  { background: none; border: 1px solid #2d3748; border-radius: 6px; color: #718096; font-size: 0.8rem; padding: 4px 8px; cursor: pointer; }
.contenant-carte          { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.contenant-carte-entete  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.contenant-carte-type    { font-size: 0.78rem; font-weight: 600; color: #a0aec0; background: #111827; border: 1px solid #2d3748; border-radius: 4px; padding: 2px 8px; }
.contenant-carte-scelle  { font-size: 0.72rem; border-radius: 4px; padding: 2px 7px; margin-left: auto; }
.contenant-carte-scelle-ferme  { background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5533; }
.contenant-carte-scelle-ouvert { background: #1a2535; color: #63b3ed; border: 1px solid #63b3ed33; }
.contenant-carte-barre   { display: flex; flex-direction: column; gap: 4px; }
.btn-ajouter-poids        { background: #1e2d1f; color: #48bb78; border: 1px solid #48bb7844; border-radius: 7px; padding: 8px; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-align: center; }
.btn-signaler             { background: #2d1a1a; color: #fc8181; border: 1px solid #fc818144; border-radius: 7px; padding: 8px; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-align: center; }

/* ------------------
   Connexion
------------------ */
.boite          { width: 100%; max-width: 400px; background: #1a1f2e; border: 1px solid #2d3748; border-radius: 16px; padding: 40px 36px; display: flex; flex-direction: column; gap: 18px; }
.boite-entete  { text-align: center; margin-bottom: 8px; }
.boite-icone   { display: inline-block; font-size: 2rem; background: #111827; border: 1px solid #2d3748; border-radius: 12px; padding: 10px 16px; margin-bottom: 14px; color: #42b983; }
.boite-titre   { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.03em; color: #f7fafc; }
.boite-sous-titre { font-size: 0.8rem; color: #718096; font-family: 'IBM Plex Mono', monospace; }
.champ-opt     { color: #4a5568; text-transform: none; font-size: 0.75rem; }

/* ------------------
   Accueil
------------------ */
.accueil          { max-width: 1100px; margin: 0 auto; padding: 60px 40px; }
.hero             { text-align: center; padding: 60px 20px 50px; border-bottom: 1px solid #2d3748; margin-bottom: 48px; }
.hero-badge      { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; color: #42b983; background: #1a2d1f; border: 1px solid #42b98333; border-radius: 99px; padding: 4px 14px; margin-bottom: 24px; }
.hero-titre      { font-size: 2.8rem; font-weight: 600; letter-spacing: -0.04em; line-height: 1.15; color: #f7fafc; margin-bottom: 16px; }
.hero-sous-titre { max-width: 520px; margin: 0 auto 32px; font-size: 1rem; color: #718096; line-height: 1.6; }
.hero-boutons    { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.hero-boutons .btn-principal,
.hero-boutons .btn-secondaire { padding: 12px 28px; font-size: 0.9rem; }
.stat-rangee      { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
.stat-carte       { flex: 1; min-width: 160px; background: #1a1f2e; border: 1px solid #2d3748; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
.stat-carte-icone { font-size: 1.6rem; background: #111827; border: 1px solid #2d3748; border-radius: 8px; padding: 8px 10px; }
.stat-carte-valeur { font-size: 1rem; font-weight: 600; color: #f7fafc; font-family: 'IBM Plex Mono', monospace; }
.stat-carte-label  { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; }
.fonctionnalites  { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.fonctionnalite   { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 12px; padding: 28px 24px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; }
.fonctionnalite-icone { font-size: 1.8rem; background: #111827; border: 1px solid #2d3748; border-radius: 8px; padding: 8px 12px; display: inline-block; width: fit-content; }
.fonctionnalite-titre { font-size: 1rem; font-weight: 600; color: #f7fafc; }
.fonctionnalite-desc  { font-size: 0.85rem; color: #718096; line-height: 1.55; }
.fonctionnalite-lien  { font-size: 0.8rem; color: #42b983; font-family: 'IBM Plex Mono', monospace; }

/* ------------------
   Mise en page
------------------ */
.deux-colonnes { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 900px) { .deux-colonnes { grid-template-columns: 1fr; } }

/* ------------------
   États
------------------ */
.chargement { text-align: center; color: #718096; font-family: 'IBM Plex Mono', monospace; padding: 60px 0; }
.vide       { text-align: center; padding: 60px; color: #718096; }
.vide span  { display: block; font-size: 3rem; margin-bottom: 12px; }
.vide-erreur  { color: #fc8181; font-family: 'IBM Plex Mono', monospace; }
.aucun      { text-align: center; color: #4a5568; font-family: 'IBM Plex Mono', monospace; font-size: 0.82rem; padding: 24px 0; }

/* ------------------
   Popup session expirée
------------------ */
.overlay        { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.popup          { background: #1a1f2e; border: 1px solid #2d3748; border-radius: 16px; padding: 40px 36px; text-align: center; max-width: 360px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.popup-icone   { font-size: 2.5rem; background: #111827; border: 1px solid #2d3748; border-radius: 12px; padding: 10px 16px; }
.popup-titre   { font-size: 1.2rem; font-weight: 600; color: #f7fafc; }
.popup-texte   { font-size: 0.85rem; color: #718096; line-height: 1.5; }
.popup-bouton  { background: #276749; color: #c6f6d5; border: none; border-radius: 8px; padding: 10px 24px; font-size: 0.88rem; font-weight: 600; cursor: pointer; margin-top: 4px; }
.popup-actions { display: flex; gap: 10px; width: 100%; }
.popup-textarea { width: 100%; background: #111827; border: 1px solid #2d3748; border-radius: 8px; padding: 10px 12px; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.88rem; outline: none; resize: vertical; }
.popup-textarea:focus { border-color: #42b983; }
</style>