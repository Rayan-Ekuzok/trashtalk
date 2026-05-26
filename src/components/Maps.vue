<template>
  <div v-if="NavVar === 1" class="map-page">

    <!-- CARTE -->
    <div id="map"></div>

    <!-- SIDEBAR -->
    <div class="sidebar" :class="{ 'sidebar-open': selectedEmplacement }">

      <div v-if="!selectedEmplacement" class="sidebar-placeholder">
        <span>📍</span>
        <p>Cliquez sur un marqueur pour voir les contenants</p>
      </div>

      <div v-else>
        <div class="sidebar-header">
          <div>
            <h2>{{ selectedEmplacement.libelle }}</h2>
            <p class="sidebar-cp">{{ selectedEmplacement.code_postal }}</p>
          </div>
          <button class="close-btn" @click="selectedEmplacement = null">✕</button>
        </div>

        <div class="section-title">
          <span class="dot dot-green"></span>
          Contenants disponibles
        </div>

        <div v-if="contenantsFiltrés.length === 0" class="empty-state">
          Aucun contenant disponible
        </div>

        <div v-for="c in contenantsFiltrés" :key="c.Id_contenant" class="contenant-card">
          <div class="contenant-top">
            <span class="contenant-id">#{{ c.Id_contenant }}</span>
            <span class="contenant-type">{{ getType(c.Id_type_dechet) }}</span>
            <span class="contenant-scelle" :class="c.scelle ? 'scelle-oui' : 'scelle-non'">
              {{ c.scelle ? '🔒 Scellé' : '🔓 Ouvert' }}
            </span>
          </div>

          <!-- Barre de remplissage -->
          <div class="poids-bar-wrap">
            <div class="poids-bar-label">
              <span>{{ c.poids_actuel_kg }} kg / {{ c.capacite_kg }} kg</span>
              <span class="poids-pct">{{ pct(c) }}%</span>
            </div>
            <div class="poids-bar-bg">
              <div
                class="poids-bar-fill"
                :style="{ width: pct(c) + '%' }"
                :class="pct(c) >= 80 ? 'bar-danger' : pct(c) >= 50 ? 'bar-warn' : 'bar-ok'"
              ></div>
            </div>
          </div>

          <button class="btn-ajouter" @click="submit(c.Id_contenant)">
            + Ajouter du poids
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapsView',

  props: {
    NavVar: Number
  },

  data() {
    return {
      map: null,
      markers: [],
      emplacements: [],
      contenants: [],
      types: [],
      selectedEmplacement: null
    }
  },

  computed: {
    contenantsFiltrés() {
      if (!this.selectedEmplacement) return []
      return this.contenants.filter(
        c => c.Id_emplacement === this.selectedEmplacement.Id_emplacement
      )
    }
  },

  watch: {
    NavVar(val) {
      if (val === 1) {
        this.$nextTick(() => this.initMap())
      } else {
        this.destroyMap()
      }
    }
  },

  methods: {
    pct(c) {
      const p = parseFloat(c.poids_actuel_kg)
      const cap = parseFloat(c.capacite_kg)
      if (!cap) return 0
      return Math.min(100, Math.round((p / cap) * 100))
    },

    async fetchAll() {
      const [e, c, t] = await Promise.all([
        fetch('http://localhost:3000/emplacement').then(r => r.json()),
        fetch('http://localhost:3000/contenant').then(r => r.json()),
        fetch('http://localhost:3000/type_dechet').then(r => r.json())
      ])
      this.emplacements = e
      this.contenants = c
      this.types = t
    },

    getType(id) {
      const type = this.types.find(t => t.Id_type_dechet === id)
      return type ? type.libelle : 'Inconnu'
    },

    async initMap() {
      this.destroyMap()
      await this.fetchAll()

      this.map = L.map('map').setView([43.2965, 5.3698], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map)

      const icon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484662.png',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })

      // Filtre : emplacements avec au moins un contenant non plein
      const contenantsDispos = this.contenants.filter(
        c => parseFloat(c.poids_actuel_kg) < parseFloat(c.capacite_kg)
      )
      const idsValides = new Set(contenantsDispos.map(c => c.Id_emplacement))
      const emplacementsValides = this.emplacements.filter(e => idsValides.has(e.Id_emplacement))

      emplacementsValides.forEach(e => {
        const marker = L.marker([e.latitude, e.longitude], { icon })
          .addTo(this.map)
          .on('click', () => { this.selectedEmplacement = e })
        this.markers.push(marker)
      })

      setTimeout(() => { if (this.map) this.map.invalidateSize() }, 150)
    },

    destroyMap() {
      if (this.map) {
        this.map.off()
        this.map.remove()
        this.map = null
      }
      this.markers = []
      this.selectedEmplacement = null
      const el = document.getElementById('map')
      if (el) el.innerHTML = ''
    },

    async submit(data1) {
      const res  = await fetch('http://localhost:3000/remplirpoubelle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data1 })
      })
      const data = await res.json()
      if (data.success) {
        // Met à jour le poids localement
        const c = this.contenants.find(x => x.Id_contenant === data1)
        if (c) c.poids_actuel_kg = data.poids_actuel_kg
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.map-page {
  font-family: 'IBM Plex Sans', sans-serif;
  display: flex;
  height: calc(100vh - 49px);
  background: #0f1117;
}

/* ── CARTE ── */
#map {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 340px;
  min-width: 340px;
  background: #0f1117;
  border-left: 1px solid #2d3748;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #4a5568;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.sidebar-placeholder span {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 12px;
}

/* ── SIDEBAR HEADER ── */
.sidebar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #2d3748;
}

.sidebar-header h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f7fafc;
}

.sidebar-cp {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #718096;
}

.close-btn {
  background: none;
  border: 1px solid #2d3748;
  border-radius: 6px;
  color: #718096;
  font-size: 0.8rem;
  padding: 4px 8px;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}

.close-btn:hover { color: #e2e8f0; border-color: #4a5568; }

/* ── SECTION TITLE ── */
.section-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot-green { background: #48bb78; box-shadow: 0 0 6px #48bb78; }

.empty-state {
  text-align: center;
  padding: 30px;
  color: #4a5568;
  font-size: 0.85rem;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── CONTENANT CARD ── */
.contenant-card {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color .2s;
}

.contenant-card:hover { border-color: #4a5568; }

.contenant-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.contenant-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #42b983;
  background: #111827;
  border: 1px solid #42b98333;
  border-radius: 4px;
  padding: 2px 6px;
}

.contenant-type {
  font-size: 0.78rem;
  font-weight: 600;
  color: #a0aec0;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 4px;
  padding: 2px 8px;
}

.contenant-scelle {
  font-size: 0.72rem;
  border-radius: 4px;
  padding: 2px 7px;
  margin-left: auto;
}

.scelle-oui { background: #2d2a1a; color: #f6ad55; border: 1px solid #f6ad5533; }
.scelle-non { background: #1a2535; color: #63b3ed; border: 1px solid #63b3ed33; }

/* ── BARRE DE POIDS ── */
.poids-bar-wrap { display: flex; flex-direction: column; gap: 4px; }

.poids-bar-label {
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #718096;
}

.poids-pct { color: #a0aec0; }

.poids-bar-bg {
  height: 6px;
  background: #111827;
  border-radius: 99px;
  overflow: hidden;
}

.poids-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s ease;
}

.bar-ok     { background: #48bb78; }
.bar-warn   { background: #f6ad55; }
.bar-danger { background: #fc8181; }

/* ── BOUTON ── */
.btn-ajouter {
  background: #1e2d1f;
  color: #48bb78;
  border: 1px solid #48bb7844;
  border-radius: 7px;
  padding: 8px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  text-align: center;
}

.btn-ajouter:hover { background: #276749; }
</style>