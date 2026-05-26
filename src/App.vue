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
</template>

<script>
import NavBar         from './components/NavBar.vue'
import AccueilView    from './components/Accueil.vue'
import Maps           from './components/Maps.vue'
import LoginView      from './components/Login.vue'
import AdminView      from './components/AdminView.vue'
import ConducteurView from './components/ConducteurView.vue'
import AdminCarte     from './components/AdminCarte.vue'

export default {
  components: { NavBar, AccueilView, Maps, LoginView, AdminView, ConducteurView, AdminCarte },

  data() {
    return { NavVar: 0, user: null }
  },

  methods: {
    ChangePage(a) { this.NavVar = a },
    onLogin() {
      this.user = JSON.parse(localStorage.getItem('user'))
      this.NavVar = 0
    },
    onLogout() {
      this.user = null
      this.NavVar = 0
    }
  },

  mounted() {
    const saved = localStorage.getItem('user')
    if (saved) this.user = JSON.parse(saved)
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f1117; }
</style>