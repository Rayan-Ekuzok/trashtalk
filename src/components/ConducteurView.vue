<template>
  <div v-if="NavVar === 4 && user && (user.isConducteur || user.isAdmin)" class="conducteur-wrap">

    <header class="conducteur-header">
      <div class="header-left">
        <span class="header-icon">🚛</span>
        <div>
          <h1>{{ user.isAdmin ? 'Tous les transferts' : 'Mes Transferts' }}</h1>
          <p class="header-sub">
            {{ user.isAdmin ? 'Vue administrateur — toutes les missions' : user.login + ' — vos affectations' }}
          </p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat">
          <span class="stat-num">{{ enCours.length }}</span>
          <span class="stat-label">En cours</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ enAttente.length }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ termines.length }}</span>
          <span class="stat-label">Terminés</span>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading">Chargement des transferts…</div>

    <div v-else-if="erreur" class="error-state">
      <span>⚠️</span>
      <p>{{ erreur }}</p>
    </div>

    <div v-else-if="transferts.length === 0" class="empty-state">
      <span>📭</span>
      <p>Aucun transfert trouvé</p>
    </div>

    <div v-else>

      <!-- EN COURS -->
      <section v-if="enCours.length > 0">
        <h2 class="section-title"><span class="dot dot-green"></span>En cours</h2>
        <div class="cards-grid">
          <div v-for="t in enCours" :key="t.Id_transfert" class="card card-encours">
            <div class="card-top">
              <span class="card-id">#{{ t.Id_transfert }}</span>
              <span class="badge-statut badge-en-cours">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="card-section">
              <p class="card-label">🗓 Dates</p>
              <p class="card-value">Demande : {{ fmt(t.date_demande) }}</p>
              <p class="card-value">Début : {{ fmt(t.date_debut) }}</p>
              <p class="card-value">Fin : {{ t.date_fin ? fmt(t.date_fin) : '—' }}</p>
            </div>
            <div class="card-section">
              <p class="card-label">🚚 Véhicule</p>
              <p class="card-value"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p>
              <p class="card-value">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p>
            </div>
            <div class="card-section">
              <p class="card-label">📍 Destination</p>
              <p class="card-value"><b>{{ t.centre_ville }}</b></p>
              <p class="card-value">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p>
              <p class="card-value card-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- EN ATTENTE -->
      <section v-if="enAttente.length > 0">
        <h2 class="section-title"><span class="dot dot-orange"></span>En attente</h2>
        <div class="cards-grid">
          <div v-for="t in enAttente" :key="t.Id_transfert" class="card card-attente">
            <div class="card-top">
              <span class="card-id">#{{ t.Id_transfert }}</span>
              <span class="badge-statut badge-en-attente">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="card-section">
              <p class="card-label">🗓 Dates</p>
              <p class="card-value">Demande : {{ fmt(t.date_demande) }}</p>
              <p class="card-value">Début : {{ fmt(t.date_debut) }}</p>
              <p class="card-value">Fin : {{ t.date_fin ? fmt(t.date_fin) : '—' }}</p>
            </div>
            <div class="card-section">
              <p class="card-label">🚚 Véhicule</p>
              <p class="card-value"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p>
              <p class="card-value">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p>
            </div>
            <div class="card-section">
              <p class="card-label">📍 Destination</p>
              <p class="card-value"><b>{{ t.centre_ville }}</b></p>
              <p class="card-value">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p>
              <p class="card-value card-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- TERMINÉS -->
      <section v-if="termines.length > 0">
        <h2 class="section-title"><span class="dot dot-grey"></span>Terminés</h2>
        <div class="cards-grid">
          <div v-for="t in termines" :key="t.Id_transfert" class="card card-termine">
            <div class="card-top">
              <span class="card-id">#{{ t.Id_transfert }}</span>
              <span class="badge-statut badge-termine">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="card-section">
              <p class="card-label">🗓 Dates</p>
              <p class="card-value">Demande : {{ fmt(t.date_demande) }}</p>
              <p class="card-value">Début : {{ fmt(t.date_debut) }}</p>
              <p class="card-value">Fin : {{ fmt(t.date_fin) }}</p>
            </div>
            <div class="card-section">
              <p class="card-label">🚚 Véhicule</p>
              <p class="card-value"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p>
              <p class="card-value">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p>
            </div>
            <div class="card-section">
              <p class="card-label">📍 Destination</p>
              <p class="card-value"><b>{{ t.centre_ville }}</b></p>
              <p class="card-value">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p>
              <p class="card-value card-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p>
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
  name: 'ConducteurView',

  props: {
    NavVar: Number,
    user: Object
  },

  data() {
    return {
      transferts: [],
      loading: false,
      erreur: null
    }
  },

  computed: {
    enCours()   { return this.transferts.filter(t => t.statut === 'en cours') },
    enAttente() { return this.transferts.filter(t => t.statut === 'en attente') },
    termines()  { return this.transferts.filter(t => t.statut === 'terminé') }
  },

  watch: {
    NavVar(val) {
      if (val === 4 && this.user && (this.user.isConducteur || this.user.isAdmin)) {
        this.fetchTransferts()
      }
    }
  },

  methods: {
    async fetchTransferts() {
      this.loading = true
      this.erreur = null
      this.transferts = []
      try {
        // Admin → tous les transferts, conducteur → les siens
        const url = this.user.isAdmin
          ? 'http://localhost:3000/transferts/all'
          : `http://localhost:3000/conducteur/transferts/${this.user.Id_utilisateur}`

        const res  = await fetch(url, { headers: authHeaders() })
        const data = await res.json()
        console.log('Transferts reçus :', data)

        if (Array.isArray(data)) {
          this.transferts = data
        } else {
          this.erreur = data.message || "Réponse inattendue du serveur"
        }
      } catch (e) {
        console.error(e)
        this.erreur = "Impossible de contacter le serveur"
      } finally {
        this.loading = false
      }
    },

    fmt(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.conducteur-wrap {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #e2e8f0;
  padding: 32px;
  box-sizing: border-box;
}

.conducteur-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left { display: flex; align-items: center; gap: 16px; }

.header-icon {
  font-size: 2rem;
  background: #1e2330;
  border: 1px solid #63b3ed;
  border-radius: 10px;
  padding: 10px 14px;
}

.conducteur-header h1 {
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

.header-stats { display: flex; gap: 16px; flex-wrap: wrap; }

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
  color: #63b3ed;
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

section { margin-bottom: 40px; }

.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-green  { background: #48bb78; box-shadow: 0 0 8px #48bb78; }
.dot-orange { background: #f6ad55; box-shadow: 0 0 8px #f6ad55; }
.dot-grey   { background: #4a5568; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
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
.card-encours  { border-left: 3px solid #48bb78; }
.card-attente  { border-left: 3px solid #f6ad55; }
.card-termine  { border-left: 3px solid #4a5568; opacity: 0.7; }

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.card-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #63b3ed;
  background: #1a2535;
  border: 1px solid #63b3ed33;
  border-radius: 4px;
  padding: 2px 7px;
}

.badge-statut {
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 5px;
  padding: 2px 8px;
  text-transform: capitalize;
}

.badge-en-cours   { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7844; }
.badge-en-attente { background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5544; }
.badge-termine    { background: #1a1f2e; color: #718096; border: 1px solid #4a574844; }

.badge-conducteur {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  background: #1e2330;
  color: #a0aec0;
  border: 1px solid #2d3748;
  border-radius: 4px;
  padding: 2px 7px;
  margin-left: auto;
}

.card-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #111827;
  border-radius: 8px;
  border: 1px solid #1f2937;
}

.card-label {
  margin: 0 0 6px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4a5568;
}

.card-value {
  margin: 3px 0;
  font-size: 0.85rem;
  color: #a0aec0;
}

.card-coords {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #4a5568;
  margin-top: 4px;
}

.loading {
  text-align: center;
  color: #718096;
  font-family: 'IBM Plex Mono', monospace;
  padding: 60px 0;
}

.empty-state, .error-state {
  text-align: center;
  padding: 60px;
  font-size: 1rem;
}

.empty-state { color: #718096; }
.error-state { color: #fc8181; font-family: 'IBM Plex Mono', monospace; }
.empty-state span, .error-state span { display: block; font-size: 3rem; margin-bottom: 12px; }
</style>