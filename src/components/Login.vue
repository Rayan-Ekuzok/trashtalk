<template>
  <div v-if="NavVar === 2" class="page-wrap">

    <div class="login-box">
      <div class="login-header">
        <span class="login-icon">{{ isRegister ? '✦' : '⬡' }}</span>
        <h1>{{ isRegister ? 'Créer un compte' : 'Connexion' }}</h1>
        <p class="login-sub">{{ isRegister ? 'Rejoindre TrashTalk' : 'Bon retour parmi nous' }}</p>
      </div>

      <div class="form-group">
        <label>Login</label>
        <input v-model="login" placeholder="Votre identifiant" autocomplete="username" />
      </div>

      <div class="form-group">
        <label>Mot de passe</label>
        <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" />
      </div>

      <div v-if="isRegister" class="form-group">
        <label>Avatar <span class="optional">(optionnel)</span></label>
        <input v-model="icon" placeholder="URL d'une image" />
      </div>

      <button class="btn-primary" @click="submit">
        {{ isRegister ? 'Créer le compte' : 'Se connecter' }}
      </button>

      <button class="btn-secondary" @click="toggleMode">
        {{ isRegister ? '← Retour à la connexion' : 'Pas encore de compte ?' }}
      </button>

      <p v-if="message" class="message" :class="messageClass">{{ message }}</p>
    </div>

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

  computed: {
    messageClass() {
      if (!this.message) return ''
      if (this.message.includes('✔')) return 'msg-ok'
      return 'msg-err'
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
          ? { login: this.login, password: this.password, icon: this.icon }
          : { login: this.login, password: this.password }

        const res  = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        const data = await res.json()

        if (data.success) {
          this.message = this.isRegister ? "Compte créé ✔" : "Connexion réussie ✔"
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
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.page-wrap {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-sizing: border-box;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── HEADER ── */
.login-header {
  text-align: center;
  margin-bottom: 8px;
}

.login-icon {
  display: inline-block;
  font-size: 2rem;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 14px;
  color: #42b983;
}

.login-header h1 {
  margin: 0 0 4px;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #f7fafc;
}

.login-sub {
  margin: 0;
  font-size: 0.8rem;
  color: #718096;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── FORM ── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
}

.optional {
  color: #4a5568;
  text-transform: none;
  font-size: 0.75rem;
}

.form-group input {
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color .2s;
}

.form-group input:focus {
  border-color: #42b983;
}

.form-group input::placeholder {
  color: #4a5568;
}

/* ── BOUTONS ── */
.btn-primary {
  background: #276749;
  color: #c6f6d5;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, transform .1s;
  margin-top: 4px;
}

.btn-primary:hover  { background: #2f855a; }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary {
  background: transparent;
  color: #718096;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 10px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}

.btn-secondary:hover { color: #a0aec0; border-color: #4a5568; }

/* ── MESSAGE ── */
.message {
  margin: 0;
  font-size: 0.82rem;
  font-family: 'IBM Plex Mono', monospace;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  background: #111827;
  border: 1px solid #2d3748;
  color: #718096;
}

.msg-ok  { background: #1a2d1f; color: #48bb78; border-color: #48bb7844; }
.msg-err { background: #2d1a1a; color: #fc8181; border-color: #fc818144; }
</style>