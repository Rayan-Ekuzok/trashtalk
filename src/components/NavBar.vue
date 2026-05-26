<template>
  <nav>
    <a @click="AfficherPage(0)">Accueil</a>
    <a @click="AfficherPage(1)">Carte</a>

    <a v-if="!user" @click="AfficherPage(2)">Connexion</a>

    <a v-if="user && (user.isConducteur || user.isAdmin)" @click="AfficherPage(4)" class="nav-conducteur">🚛 Transferts</a>

    <a v-if="user && user.isAdmin" @click="AfficherPage(3)" class="nav-admin">⚠ Admin</a>
    <a v-if="user && user.isAdmin" @click="AfficherPage(5)" class="nav-admin-carte">🗺 Gestion carte</a>

    <a v-if="user" @click="deconnexion" class="nav-logout">Déconnexion</a>
    <span v-if="user" class="nav-user">👤 {{ user.login }}</span>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: { NavVar: Number, user: Object },
  methods: {
    AfficherPage(a) { this.$emit('ChangePage', a) },
    deconnexion() {
      localStorage.removeItem('user')
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');

nav {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 49px;
  background: #0f1117;
  border-bottom: 1px solid #2d3748;
  font-family: 'IBM Plex Sans', sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
}

a {
  color: #718096;
  margin-right: 2em;
  cursor: pointer;
  font-size: 0.88rem;
  transition: color .15s;
  white-space: nowrap;
}

a:hover              { color: #e2e8f0; }
.nav-admin           { color: #f6ad55; font-weight: 600; }
.nav-admin:hover     { color: #fbd38d; }
.nav-admin-carte     { color: #42b983; font-weight: 600; }
.nav-admin-carte:hover { color: #68d391; }
.nav-conducteur      { color: #63b3ed; font-weight: 600; }
.nav-conducteur:hover{ color: #90cdf4; }
.nav-logout          { margin-left: auto; margin-right: 0; color: #fc8181; }
.nav-logout:hover    { color: #feb2b2; }
.nav-user            { margin-left: 16px; font-size: 0.75rem; color: #4a5568; font-family: 'IBM Plex Mono', monospace; }
</style>