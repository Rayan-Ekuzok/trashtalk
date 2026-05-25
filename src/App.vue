<template>
  <NavBar
    :NavVar="NavVar"
    :user="user"
    @ChangePage="ChangePage"
  />

  <Maps      :NavVar="NavVar" :user="user" />
  <LoginView :NavVar="NavVar" @loginSuccess="onLogin" @changePage="ChangePage" />
  <AdminView :NavVar="NavVar" :user="user" />
</template>

<script>
import NavBar    from './components/NavBar.vue'
import Maps      from './components/Maps.vue'
import LoginView from './components/Login.vue'
import AdminView from './components/AdminView.vue'

export default {
  components: {
    NavBar,
    Maps,
    LoginView,
    AdminView
  },

  data() {
    return {
      NavVar: 0,
      user: null
    }
  },

  methods: {
    ChangePage(a) {
      this.NavVar = a
    },

    onLogin() {
      const saved = localStorage.getItem('user')
      this.user = JSON.parse(saved)
      this.NavVar = 0
    }
  },

  mounted() {
    const saved = localStorage.getItem('user')
    if (saved) {
      this.user = JSON.parse(saved)
    }
  }
}
</script>