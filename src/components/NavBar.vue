<template>
  <nav>
    <a @click="AfficherPage(0)">Accueil</a>
    <a @click="AfficherPage(1)">Carte</a>

    <!-- Visible uniquement si PAS connecté -->
    <a v-if="!user" @click="AfficherPage(2)">Connexion</a>

    <!-- Visible uniquement si admin connecté -->
    <a v-if="user && user.isAdmin" @click="AfficherPage(3)" class="nav-admin">⚠ Admin</a>

    <!-- Visible uniquement si connecté -->
    <a v-if="user" @click="deconnexion" class="nav-logout">Déconnexion</a>

    <span v-if="user" class="nav-user">👤 {{ user.login }}</span>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',

  props: {
    NavVar: Number,
    user: Object
  },

  methods: {
    AfficherPage(a) {
      this.$emit('ChangePage', a)
    },

    deconnexion() {
      localStorage.removeItem('user')
      this.$emit('ChangePage', 0)
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
nav {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background: #0f1117;
  border-bottom: 1px solid #2d3748;
}

a {
  color: #42b983;
  margin-right: 2em;
  cursor: pointer;
  transition: color .15s;
}

a:hover { color: #68d391; }

.nav-admin {
  color: #f6ad55;
  font-weight: 600;
}

.nav-logout {
  margin-left: auto;
  margin-right: 0;
  color: #fc8181;
}

.nav-user {
  margin-left: 16px;
  font-size: 0.8rem;
  color: #4a5568;
}
</style>