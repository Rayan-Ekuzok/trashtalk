<template>
  <div class="container">

    <!-- MAP -->
    <div v-if="NavVar === 1" id="map"></div>

    <!-- SIDEBAR -->
    <div class="sidebar" v-if="selectedEmplacement">
      <h2>{{ selectedEmplacement.libelle }}</h2>
      <p>Code postal : {{ selectedEmplacement.code_postal }}</p>

      <hr>

      <h3>Contenants</h3>

      <div v-for="c in contenantsFiltrés" :key="c.Id_contenant" class="box">
        <p><b>ID :</b> {{ c.Id_contenant }}</p>
        <p><b>Capacité :</b> {{ c.capacite_kg }} kg</p>
        <p><b>Poids :</b> {{ c.poids_actuel_kg }} kg</p>
        <p><b>Scellé :</b> {{ c.scelle ? 'Oui' : 'Non' }}</p>
        <p><b>Type :</b> {{ getType(c.Id_type_dechet) }}</p>
        <button @click="submit(c.Id_contenant)"> Ajouter du poids</button>
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
        this.$nextTick(() => {
          this.initMap()
        })
      } else {
        this.destroyMap()
      }
    }
  },

  methods: {
    

    removeAtIndex(arr, index) {
      if (!Array.isArray(arr)) {
          throw new TypeError("First argument must be an array");
      }
      if (typeof index !== "number" || index < 0 || index >= arr.length) {
          console.warn("Invalid index. No element removed.");
          return arr; 
      }
      arr.splice(index, 1);
      return arr;
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

      this.emplacements.forEach((emplacement, index) => {
        console.log( " Mon emplacement : " + emplacement + '  Mon index : ' + index);
        var compteur = 0;

        this.contenants.forEach((contenant, index1) => {
          
          if (emplacement['Id_emplacement'] == contenant['Id_emplacement'] ) {
            compteur++;
          } if (contenant['capacite_kg'] <= contenant['poids_actuel_kg']) {
            this.removeAtIndex(this.contenants, index1)
          }

        })

        if (compteur == 0){
            this.removeAtIndex(this.emplacements, index)
          }
      })

      this.emplacements.forEach(e => {
        const marker = L.marker([e.latitude, e.longitude], { icon })
          .addTo(this.map)
          .on('click', () => {
            this.selectedEmplacement = e
          })

        this.markers.push(marker)
      })

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
        }
      }, 150)
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
      console.log('envoie')


      const url = 'http://localhost:3000/remplirpoubelle'

      const body = 
          {
            id: data1
          }


      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      console.log(data)



    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
}

#map {
  height: 500px;
  width: 70%;
}

.sidebar {
  width: 30%;
  padding: 10px;
  background: #f4f4f4;
  overflow-y: auto;
  height: 500px;
}

.box {
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 8px;
  background: white;
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