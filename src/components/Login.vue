<template>
  <div v-if="NavVar === 2" class="login-container">

    <h2 v-if="!isRegister">Connexion</h2>
    <h2 v-else>Créer un compte</h2>

    <input v-model="login" placeholder="Login" />
    <input v-model="password" type="password" placeholder="Mot de passe" />

    <!-- icon seulement en register -->
    <input v-if="isRegister" v-model="icon" placeholder="URL image (optionnel)" />

    <button @click="submit">
      {{ isRegister ? "Créer compte" : "Se connecter" }}
    </button>

    <button @click="toggleMode">
      {{ isRegister ? "Retour connexion" : "Créer un compte" }}
    </button>

    <p>{{ message }}</p>

  </div>
</template>

<script>
export default {
  name: 'LoginView',

  props: {
    NavVar: Number
  },

  data() {
    return {
      login: '',
      password: '',
      icon: '',
      message: '',
      isRegister: false
    }
  },

  methods: {

    toggleMode() {
      this.isRegister = !this.isRegister
      this.message = ''
    },

    async submit() {

      try {

        const url = this.isRegister
          ? 'http://localhost:3000/register'
          : 'http://localhost:3000/login'

        const body = this.isRegister
          ? {
              login: this.login,
              password: this.password,
              icon: this.icon
            }
          : {
              login: this.login,
              password: this.password
            }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        const data = await res.json()

        if (data.success) {
          this.message = this.isRegister
            ? "Compte créé ✔"
            : "Connexion réussie ✔"

          if (!this.isRegister) {
            localStorage.setItem('user', JSON.stringify(data.user))
            this.$emit('loginSuccess')
          }

        } else {
          this.message = data.message || "Erreur"
        }

      } catch (e) {
        this.message = "Erreur serveur"
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 300px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>