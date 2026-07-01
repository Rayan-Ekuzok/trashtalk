<template>
  <div v-if="nav === 3 && user && user.isAdmin" class="admin page">

    <header class="entete">
      <div class="entete-gauche">
        <div>
          <h1 class="entete-titre">Panneau Admin</h1>
          <p class="entete-sous-titre">Gestion des signalements</p>
        </div>
      </div>
      <div class="entete-stats">
        <div class="stat">
          <span class="stat-nombre">{{ enAttente.length }}</span>
          <span class="stat-libelle">En attente</span>
        </div>
        <div class="stat">
          <span class="stat-nombre">{{ traites.length }}</span>
          <span class="stat-libelle">Traités</span>
        </div>
      </div>
    </header>

    <div v-if="chargement" class="chargement">Chargement des signalements…</div>

    <div v-else>

      <section v-if="enAttente.length > 0">
        <h2 class="section-titre">En attente de traitement</h2>
        <div class="grille">
          <div v-for="s in enAttente" :key="s.Id_signalement" class="carte-item" :class="{ 'carte-item-traitement': traitement === s.Id_signalement }">
            <div class="carte-item-entete">
              <span class="carte-item-id">#{{ s.Id_signalement }}</span>
              <span class="carte-item-date">{{ formater(s.date_) }}</span>
            </div>
            <p class="carte-item-texte">{{ s.text }}</p>
            <div class="carte-item-meta">
              <div class="carte-item-ligne"><span>{{ s.emplacement_libelle }} ({{ s.code_postal }})</span></div>
              <div class="carte-item-ligne">
                <span>
                  {{ s.citoyen_login }}
                  <span class="badge-avertissement" :class="{ 'badge-avertissement-critique': s.nb_avertissement >= 4 }">{{ s.nb_avertissement }}/5 avert.</span>
                  <span v-if="s.est_bannie" class="badge-banni">BANNI</span>
                </span>
              </div>
            </div>
            <div class="carte-item-actions">
              <button class="btn-valider" :disabled="traitement === s.Id_signalement" @click="valider(s)">✔ Valider</button>
              <button class="btn-rejeter" :disabled="traitement === s.Id_signalement" @click="rejeter(s)">✘ Rejeter</button>
            </div>
            <p v-if="retours[s.Id_signalement]" class="retour" :class="retours[s.Id_signalement].cls">{{ retours[s.Id_signalement].msg }}</p>
          </div>
        </div>
      </section>

      <div v-else class="vide"><span></span><p>Aucun signalement en attente</p></div>

      <section v-if="traites.length > 0">
        <h2 class="section-titre">Signalements traités</h2>
        <div class="grille">
          <div v-for="s in traites" :key="s.Id_signalement" class="carte-item carte-item-attenué" :class="s.evalutaion === 1 ? 'carte-item-vert' : 'carte-item-rouge'">
            <div class="carte-item-entete">
              <span class="carte-item-id">#{{ s.Id_signalement }}</span>
              <span class="badge" :class="s.evalutaion === 1 ? 'badge-valide' : 'badge-rejeté'">{{ s.evalutaion === 1 ? '✔ Validé' : '✘ Rejeté' }}</span>
              <span class="carte-item-date">{{ formater(s.date_) }}</span>
            </div>
            <p class="carte-item-texte carte-item-texte-attenué">{{ s.text }}</p>
            <div class="carte-item-meta">
              <div class="carte-item-ligne">
                <span>{{ s.emplacement_libelle }}</span>
              </div>
              <div class="carte-item-ligne">
                <span>👤</span>
                <span>
                  {{ s.citoyen_login }}
                  <span class="badge-avertissement" :class="{ 'badge-avertissement-critique': s.nb_avertissement >= 4 }">{{ s.nb_avertissement }}/5</span>
                  <span v-if="s.est_bannie" class="badge-banni">BANNI</span>
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
export default {
  name: 'AdminView',
  props: { nav: Number, user: Object },
  data() {
    return { signalements: [], chargement: false, traitement: null, retours: {} }
  },
  computed: {
    enAttente() { return this.signalements.filter(s => s.evalutaion === null) },
    traites()   { return this.signalements.filter(s => s.evalutaion !== null) }
  },
  watch: {
    nav(v) { if (v === 3 && this.user?.isAdmin) this.charger() }
  },
  methods: {
    async charger() {
      this.chargement = true
      try {
        const res = await fetch('https://fellous.alwaysdata.net/signalement', { headers: this.$auth() })
        //const res = await fetch('http://localhost:3000/signalement', { headers: this.$auth() })

        this.signalements = await res.json()
      } catch(e) { console.error(e) }
      finally { this.chargement = false }
    },
    async valider(s) {
      this.traitement = s.Id_signalement
      try {
        const res  = await fetch('https://fellous.alwaysdata.net/signalement/valider', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })
        //const res  = await fetch('http://localhost:3000/signalement/valider', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })

        const data = await res.json()
        if (data.success) {
          this.retours[s.Id_signalement] = { msg: data.message, cls: 'retour-succes' }
          const sig = this.signalements.find(x => x.Id_signalement === s.Id_signalement)
          if (sig) { sig.evalutaion = 1; sig.nb_avertissement = data.user.nb_avertissement; sig.est_bannie = data.user.est_bannie }
        }
      } catch { this.retours[s.Id_signalement] = { msg: 'Erreur serveur', cls: 'retour-erreur' } }
      finally  { this.traitement = null }
    },
    async rejeter(s) {
      this.traitement = s.Id_signalement
      try {
        const res  = await fetch('https://fellous.alwaysdata.net/signalement/rejeter', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })
        //const res  = await fetch('http://localhost:3000/signalement/rejeter', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })

        const data = await res.json()
        if (data.success) {
          this.retours[s.Id_signalement] = { msg: data.message, cls: 'retour-avertissement' }
          const sig = this.signalements.find(x => x.Id_signalement === s.Id_signalement)
          if (sig) { sig.evalutaion = 0; sig.nb_avertissement = data.user.nb_avertissement; sig.est_bannie = data.user.est_bannie }
        }
      } catch { this.retours[s.Id_signalement] = { msg: 'Erreur serveur', cls: 'retour-erreur' } }
      finally  { this.traitement = null }
    },
    formater(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>