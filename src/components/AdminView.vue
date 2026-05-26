<template>
  <div v-if="NavVar === 3 && user && user.isAdmin" class="admin-wrap">

    <header class="admin-header">
      <div class="header-left">
        <span class="header-icon">⚠</span>
        <div>
          <h1>Panneau Admin</h1>
          <p class="header-sub">Gestion des signalements</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat">
          <span class="stat-num">{{ enAttente.length }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ traites.length }}</span>
          <span class="stat-label">Traités</span>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading">Chargement des signalements…</div>

    <div v-else>

      <!-- EN ATTENTE -->
      <section v-if="enAttente.length > 0">
        <h2 class="section-title">
          <span class="dot dot-orange"></span>
          En attente de traitement
        </h2>
        <div class="cards-grid">
          <div
            v-for="s in enAttente"
            :key="s.Id_signalement"
            class="card"
            :class="{ 'card-processing': processing === s.Id_signalement }"
          >
            <div class="card-top">
              <span class="card-id">#{{ s.Id_signalement }}</span>
              <span class="card-date">{{ formatDate(s.date_) }}</span>
            </div>

            <p class="card-text">{{ s.text }}</p>

            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span>{{ s.emplacement_libelle }} ({{ s.code_postal }})</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span>
                  {{ s.citoyen_login }}
                  <span class="badge-warn" :class="{ 'badge-danger': s.nb_avertissement >= 4 }">
                    {{ s.nb_avertissement }}/5 avert.
                  </span>
                  <span v-if="s.est_bannie" class="badge-ban">BANNI</span>
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button
                class="btn btn-valid"
                :disabled="processing === s.Id_signalement"
                @click="valider(s)"
              >
                ✔ Valider
              </button>
              <button
                class="btn btn-reject"
                :disabled="processing === s.Id_signalement"
                @click="rejeter(s)"
              >
                ✘ Rejeter
              </button>
            </div>

            <p v-if="feedbacks[s.Id_signalement]" class="feedback" :class="feedbacks[s.Id_signalement].type">
              {{ feedbacks[s.Id_signalement].message }}
            </p>
          </div>
        </div>
      </section>

      <div v-else class="empty-state">
        <span>✅</span>
        <p>Aucun signalement en attente</p>
      </div>

      <!-- TRAITÉS -->
      <section v-if="traites.length > 0">
        <h2 class="section-title">
          <span class="dot dot-grey"></span>
          Signalements traités
        </h2>
        <div class="cards-grid">
          <div
            v-for="s in traites"
            :key="s.Id_signalement"
            class="card card-done"
            :class="s.evalutaion === 1 ? 'card-valid' : 'card-rejected'"
          >
            <div class="card-top">
              <span class="card-id">#{{ s.Id_signalement }}</span>
              <span class="badge-result" :class="s.evalutaion === 1 ? 'badge-ok' : 'badge-ko'">
                {{ s.evalutaion === 1 ? '✔ Validé' : '✘ Rejeté' }}
              </span>
              <span class="card-date">{{ formatDate(s.date_) }}</span>
            </div>
            <p class="card-text card-text-muted">{{ s.text }}</p>
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span>{{ s.emplacement_libelle }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span>{{ s.citoyen_login }}
                  <span class="badge-warn" :class="{ 'badge-danger': s.nb_avertissement >= 4 }">
                    {{ s.nb_avertissement }}/5
                  </span>
                  <span v-if="s.est_bannie" class="badge-ban">BANNI</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script>
import { authHeaders } from '../composables/useAuth.js'

export default {
  name: 'AdminView',

  props: {
    NavVar: Number,
    user: Object
  },

  data() {
    return {
      signalements: [],
      loading: false,
      processing: null,
      feedbacks: {}
    }
  },

  computed: {
    enAttente() {
      return this.signalements.filter(s => s.evalutaion === null)
    },
    traites() {
      return this.signalements.filter(s => s.evalutaion !== null)
    }
  },

  watch: {
    NavVar(val) {
      if (val === 3 && this.user?.isAdmin) this.fetchSignalements()
    }
  },

  methods: {
    async fetchSignalements() {
      this.loading = true
      try {
        const res = await fetch('http://localhost:3000/signalement', { headers: authHeaders() })
        this.signalements = await res.json()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async valider(s) {
      this.processing = s.Id_signalement
      try {
        const res = await fetch('http://localhost:3000/signalement/valider', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ id_signalement: s.Id_signalement })
        })
        const data = await res.json()
        if (data.success) {
          this.feedbacks[s.Id_signalement] = { message: data.message, type: 'feedback-ok' }
          const sig = this.signalements.find(x => x.Id_signalement === s.Id_signalement)
          if (sig) {
            sig.evalutaion = 1
            sig.nb_avertissement = data.user.nb_avertissement
            sig.est_bannie = data.user.est_bannie
          }
        }
      } catch (e) {
        this.feedbacks[s.Id_signalement] = { message: 'Erreur serveur', type: 'feedback-err' }
      } finally {
        this.processing = null
      }
    },

    async rejeter(s) {
      this.processing = s.Id_signalement
      try {
        const res = await fetch('http://localhost:3000/signalement/rejeter', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ id_signalement: s.Id_signalement })
        })
        const data = await res.json()
        if (data.success) {
          this.feedbacks[s.Id_signalement] = { message: data.message, type: 'feedback-warn' }
          const sig = this.signalements.find(x => x.Id_signalement === s.Id_signalement)
          if (sig) {
            sig.evalutaion = 0
            sig.nb_avertissement = data.user.nb_avertissement
            sig.est_bannie = data.user.est_bannie
          }
        }
      } catch (e) {
        this.feedbacks[s.Id_signalement] = { message: 'Erreur serveur', type: 'feedback-err' }
      } finally {
        this.processing = null
      }
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
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