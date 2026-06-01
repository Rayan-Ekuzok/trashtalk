<template>
  <div v-if="nav === 1" class="page-carte">
    <div id="carte-leaflet"></div>

    <div class="panneau-lateral">
      <div v-if="!selection" class="panneau-lateral-vide">
        <span>📍</span>
        <p>Cliquez sur un marqueur pour voir les contenants</p>
      </div>

      <div v-else>
        <div class="panneau-lateral-entete">
          <div>
            <h2>{{ selection.libelle }}</h2>
            <p class="panneau-lateral-cp">{{ selection.code_postal }}</p>
          </div>
          <button class="panneau-lateral-fermer" @click="selection = null">✕</button>
        </div>

        <h2 class="section-titre"><span class="point point-vert"></span>Contenants disponibles</h2>

        <div v-if="!contenantsFiltres.length" class="aucun">Aucun contenant disponible</div>

        <div v-for="c in contenantsFiltres" :key="c.Id_contenant" class="contenant-carte">
          <div class="contenant-carte_entete">
            <span class="carte-item_id">#{{ c.Id_contenant }}</span>
            <span class="contenant-carte-type">{{ getType(c.Id_type_dechet) }}</span>
            <span class="contenant-carte-scelle" :class="c.scelle ? 'contenant-carte_scelle-ferme' : 'contenant-carte_scelle-ouvert'">
              {{ c.scelle ? 'Scellé' : 'Ouvert' }}
            </span>
          </div>
          <div class="contenant-carte-barre">
            <div class="barre-legende">
              <span>{{ c.poids_actuel_kg }} kg / {{ c.capacite_kg }} kg</span>
              <span>{{ pct(c) }}%</span>
            </div>
            <div class="barre-fond">
              <div class="barre-remplissage"
                :style="{ width: pct(c) + '%' }"
                :class="pct(c) >= 80 ? 'barre-remplissage-plein' : pct(c) >= 50 ? 'barre-remplissage-mid' : 'barre-remplissage-ok'">
              </div>
            </div>
          </div>
          <button v-if="user" class="btn-signaler" @click="ouvrirSignalement(c.Id_emplacement)">🚨 Signaler un problème</button>
        </div>
      </div>
    </div>

    <!-- Modal signalement -->
    <div v-if="modalSignalement" class="overlay" @click.self="modalSignalement = false">
      <div class="popup">
        <span class="popup-icone">🚨</span>
        <h2 class="popup-titre">Signaler un problème</h2>
        <p class="popup-texte">Emplacement #{{ signalementContenantId }}</p>
        <div class="champ" style="width:100%; text-align:left">
          <label class="champ-label">Description</label>
          <textarea class="popup-textarea" v-model="signalementTexte" placeholder="Décrivez le problème…" rows="4"></textarea>
        </div>
        <div class="popup_actions">
          <button class="btn-rejeter" @click="modalSignalement = false">Annuler</button>
          <button class="btn-valider" :disabled="signalementChargement || !signalementTexte.trim()" @click="envoyerSignalement">
            {{ signalementChargement ? '…' : 'Envoyer' }}
          </button>
        </div>
        <p v-if="signalementMsg" class="message" :class="signalementMsg.ok ? 'message-succes' : 'message-erreur'">{{ signalementMsg.txt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'CarteInteractive',
  props: { nav: Number, user: Object },
  data() {
    return {
      carte: null, marqueurs: [], emplacements: [], contenants: [], types: [], selection: null,
      modalSignalement: false, signalementContenantId: null, signalementTexte: '',
      signalementChargement: false, signalementMsg: null
    }
  },
  computed: {
    contenantsFiltres() {
      if (!this.selection) return []
      return this.contenants.filter(c => c.Id_emplacement === this.selection.Id_emplacement)
    }
  },
  watch: {
    nav(v) {
      if (v === 1) this.$nextTick(() => this.initialiser())
      else this.detruire()
    }
  },
  methods: {
    pct(c) {
      const p = parseFloat(c.poids_actuel_kg), cap = parseFloat(c.capacite_kg)
      return cap ? Math.min(100, Math.round((p / cap) * 100)) : 0
    },
    getType(id) {
      const t = this.types.find(t => t.Id_type_dechet === id)
      return t ? t.libelle : 'Inconnu'
    },
    ouvrirSignalement(id) {
      this.signalementContenantId = id
      this.signalementTexte = ''
      this.signalementMsg = null
      this.modalSignalement = true
    },
    async envoyerSignalement() {
      this.signalementChargement = true
      this.signalementMsg = null
      try {
        const res  = await fetch('http://localhost:3000/signalement/creer', {
          method: 'POST',
          headers: this.$auth(),
          body: JSON.stringify({ Id_emplacement: this.signalementContenantId, text: this.signalementTexte })
        })
        const data = await res.json()
        if (data.success) {
          this.signalementMsg = { ok: true, txt: 'Signalement envoyé' }
          this.signalementTexte = ''
          setTimeout(() => { this.modalSignalement = false; this.signalementMsg = null }, 1500)
        } else {
          this.signalementMsg = { ok: false, txt: data.message || 'Erreur' }
        }
      } catch { this.signalementMsg = { ok: false, txt: 'Erreur serveur' } }
      finally  { this.signalementChargement = false }
    },
    async chargerDonnees() {
      const [e, c, t] = await Promise.all([
        fetch('http://localhost:3000/emplacement').then(r => r.json()),
        fetch('http://localhost:3000/contenant', { headers: this.$auth() }).then(r => r.json()),
        fetch('http://localhost:3000/type_dechet').then(r => r.json())
      ])
      this.emplacements = Array.isArray(e) ? e : []
      this.contenants   = Array.isArray(c) ? c : []
      this.types        = Array.isArray(t) ? t : []
    },
    async initialiser() {
      this.detruire()
      await this.chargerDonnees()

      // Fix icônes par défaut Leaflet cassées avec Vite/Webpack
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      this.carte = L.map('carte-leaflet').setView([43.2965, 5.3698], 12)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.carte)

      // "icon" (pas "icone") — propriété reconnue par Leaflet
      const icon = L.icon({
        iconUrl:    'https://cdn-icons-png.flaticon.com/512/484/484662.png',
        iconSize:   [30, 30],
        iconAnchor: [15, 30]
      })

      const disponibles = new Set(
        this.contenants
          .filter(c => parseFloat(c.poids_actuel_kg) < parseFloat(c.capacite_kg))
          .map(c => c.Id_emplacement)
      )

      this.emplacements.filter(e => disponibles.has(e.Id_emplacement)).forEach(e => {
        const m = L.marker([e.latitude, e.longitude], { icon })
          .addTo(this.carte)
          .on('click', () => { this.selection = e })
        this.marqueurs.push(m)
      })

      setTimeout(() => { if (this.carte) this.carte.invalidateSize() }, 150)
    },
    detruire() {
      if (this.carte) { this.carte.off(); this.carte.remove(); this.carte = null }
      this.marqueurs = []; this.selection = null
      const el = document.getElementById('carte-leaflet')
      if (el) el.innerHTML = ''
    },
    async remplir(id) {
      const res  = await fetch('http://localhost:3000/remplirpoubelle', {
        method: 'POST', headers: this.$auth(), body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        const c = this.contenants.find(x => x.Id_contenant === id)
        if (c) c.poids_actuel_kg = data.poids_actuel_kg
      }
    }
  }
}
</script>