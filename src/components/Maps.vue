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
</style>