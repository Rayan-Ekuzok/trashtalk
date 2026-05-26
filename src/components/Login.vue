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

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.admin-wrap {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #e2e8f0;
  padding: 32px;
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 24px;
  margin-bottom: 36px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 2rem;
  background: #1e2330;
  border: 1px solid #f6ad55;
  border-radius: 10px;
  padding: 10px 14px;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #f7fafc;
}

.header-sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #718096;
  font-family: 'IBM Plex Mono', monospace;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat {
  text-align: center;
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 12px 20px;
}

.stat-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 600;
  color: #f6ad55;
  font-family: 'IBM Plex Mono', monospace;
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
}

.section-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
}

.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-orange { background: #f6ad55; box-shadow: 0 0 8px #f6ad55; }
.dot-grey   { background: #4a5568; }

section { margin-bottom: 40px; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.card {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 20px;
  transition: border-color .2s, transform .15s;
}

.card:hover { border-color: #4a5568; transform: translateY(-2px); }
.card-processing { opacity: 0.6; pointer-events: none; }
.card-done { opacity: 0.7; }
.card-valid    { border-left: 3px solid #48bb78; }
.card-rejected { border-left: 3px solid #fc8181; }

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #f6ad55;
  background: #2d2a1a;
  border: 1px solid #f6ad5533;
  border-radius: 4px;
  padding: 2px 7px;
}

.card-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #4a5568;
  margin-left: auto;
}

.card-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #cbd5e0;
  margin: 0 0 16px;
  border-left: 2px solid #2d3748;
  padding-left: 10px;
}

.card-text-muted { color: #718096; }

.card-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #a0aec0;
}

.meta-icon { font-size: 0.9rem; }

.badge-warn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  background: #2d2a1a;
  color: #f6ad55;
  border: 1px solid #f6ad5544;
  border-radius: 4px;
  padding: 1px 5px;
  margin-left: 6px;
}

.badge-danger { background: #2d1a1a; color: #fc8181; border-color: #fc818144; }

.badge-ban {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  background: #fc8181;
  color: #1a0a0a;
  font-weight: 700;
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: 4px;
}

.badge-result { font-size: 0.75rem; font-weight: 600; border-radius: 5px; padding: 2px 8px; }
.badge-ok { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7844; }
.badge-ko { background: #2d1a1a; color: #fc8181; border: 1px solid #fc818144; }

.card-actions { display: flex; gap: 10px; }

.btn {
  flex: 1;
  padding: 9px 0;
  border: none;
  border-radius: 8px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s, transform .1s;
}

.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-valid  { background: #276749; color: #c6f6d5; }
.btn-valid:hover:not(:disabled)  { background: #2f855a; }
.btn-reject { background: #742a2a; color: #fed7d7; }
.btn-reject:hover:not(:disabled) { background: #9b2c2c; }

.feedback {
  margin: 10px 0 0;
  font-size: 0.8rem;
  font-family: 'IBM Plex Mono', monospace;
  border-radius: 6px;
  padding: 6px 10px;
}

.feedback-ok   { background: #1a2d1f; color: #48bb78; }
.feedback-warn { background: #2d2a1a; color: #f6ad55; }
.feedback-err  { background: #2d1a1a; color: #fc8181; }

.loading {
  text-align: center;
  color: #718096;
  font-family: 'IBM Plex Mono', monospace;
  padding: 60px 0;
}

.empty-state { text-align: center; padding: 60px; color: #48bb78; font-size: 1.1rem; }
.empty-state span { display: block; font-size: 3rem; margin-bottom: 12px; }
</style>