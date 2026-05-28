<template>
  <NavBar
    :NavVar="NavVar"
    :user="user"
    @ChangePage="ChangePage"
    @logout="onLogout"
  />
  <AccueilView    :NavVar="NavVar" :user="user" @ChangePage="ChangePage" />
  <Maps           :NavVar="NavVar" :user="user" />
  <LoginView      :NavVar="NavVar" @loginSuccess="onLogin" @changePage="ChangePage" />
  <AdminView      :NavVar="NavVar" :user="user" />
  <ConducteurView :NavVar="NavVar" :user="user" />
  <AdminCarte     :NavVar="NavVar" :user="user" />
  <!-- Popup session expirée -->
  <div v-if="sessionExpired" class="session-overlay">
    <div class="session-popup">
      <span class="session-icon">⏱</span>
      <h2>Session expirée</h2>
      <p>Vous avez été déconnecté après 10 minutes d'inactivité.</p>
      <button @click="sessionExpired = false; ChangePage(2)">Se reconnecter</button>
    </div>
  </div>
</template>
 
<script>
import NavBar         from './components/NavBar.vue'
import AccueilView    from './components/Accueil.vue'
import Maps           from './components/Maps.vue'
import LoginView      from './components/Login.vue'
import AdminView      from './components/AdminView.vue'
import ConducteurView from './components/ConducteurView.vue'
import AdminCarte     from './components/AdminCarte.vue'
import { saveSession, clearSession, startSessionWatch, stopSessionWatch, getToken, isTokenValid } from './composables/useAuth.js'
 
export default {
  components: { NavBar, AccueilView, Maps, LoginView, AdminView, ConducteurView, AdminCarte },
  data() {
    return {
      NavVar: 0,
      user: null,
      sessionExpired: false
    }
  },
  methods: {
    ChangePage(a) { this.NavVar = a },
    onLogin({ token, user }) {
      saveSession(token, user)
      this.user = user
      this.sessionExpired = false
      this.NavVar = 0
      // Démarre la surveillance d'inactivité
      startSessionWatch(() => this.onSessionExpired())
    },
    onLogout() {
      stopSessionWatch()
      clearSession()
      this.user = null
      this.NavVar = 0
    },
    onSessionExpired() {
      this.user = null
      this.NavVar = 0
      this.sessionExpired = true
    }
  },
  mounted() {
    const saved = localStorage.getItem('user')
    const token = getToken()
 
    if (saved && token) {
      if (!isTokenValid()) {
        // Token expiré pendant l'absence → nettoyage immédiat + popup
        clearSession()
        this.sessionExpired = true
      } else {
        // Token encore valide → on restaure la session normalement
        this.user = JSON.parse(saved)
        startSessionWatch(() => this.onSessionExpired())
      }
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f1117; }
</style>

<style scoped>
/* ── Popup session expirée ── */
.session-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.session-popup {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
  max-width: 360px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  font-family: 'IBM Plex Sans', sans-serif;
}

.session-icon {
  font-size: 2.5rem;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 10px 16px;
}

.session-popup h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f7fafc;
}

.session-popup p {
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.5;
}

.session-popup button {
  background: #276749;
  color: #c6f6d5;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  margin-top: 4px;
}

.session-popup button:hover { background: #2f855a; }
</style>