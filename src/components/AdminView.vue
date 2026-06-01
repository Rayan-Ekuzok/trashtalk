<template>
  <div v-if="nav === 3 && user && user.isAdmin" class="admin page">

    <header class="entete">
      <div class="entete_gauche">
        <span class="entete_icone">⚠</span>
        <div>
          <h1 class="entete_titre">Panneau Admin</h1>
          <p class="entete_sous-titre">Gestion des signalements</p>
        </div>
      </div>
      <div class="entete_stats">
        <div class="stat">
          <span class="stat_nombre">{{ enAttente.length }}</span>
          <span class="stat_libelle">En attente</span>
        </div>
        <div class="stat">
          <span class="stat_nombre">{{ traites.length }}</span>
          <span class="stat_libelle">Traités</span>
        </div>
      </div>
    </header>

    <div v-if="chargement" class="chargement">Chargement des signalements…</div>

    <div v-else>

      <section v-if="enAttente.length > 0">
        <h2 class="section-titre"><span class="point point-jaune"></span>En attente de traitement</h2>
        <div class="grille">
          <div v-for="s in enAttente" :key="s.Id_signalement" class="carte-item" :class="{ 'carte-item-traitement': traitement === s.Id_signalement }">
            <div class="carte-item_entete">
              <span class="carte-item_id">#{{ s.Id_signalement }}</span>
              <span class="carte-item_date">{{ formater(s.date_) }}</span>
            </div>
            <p class="carte-item_texte">{{ s.text }}</p>
            <div class="carte-item_meta">
              <div class="carte-item_ligne"><span>📍</span><span>{{ s.emplacement_libelle }} ({{ s.code_postal }})</span></div>
              <div class="carte-item_ligne">
                <span>👤</span>
                <span>
                  {{ s.citoyen_login }}
                  <span class="badge-avertissement" :class="{ 'badge-avertissement-critique': s.nb_avertissement >= 4 }">{{ s.nb_avertissement }}/5 avert.</span>
                  <span v-if="s.est_bannie" class="badge-banni">BANNI</span>
                </span>
              </div>
            </div>
            <div class="carte-item_actions">
              <button class="btn-valider" :disabled="traitement === s.Id_signalement" @click="valider(s)">✔ Valider</button>
              <button class="btn-rejeter" :disabled="traitement === s.Id_signalement" @click="rejeter(s)">✘ Rejeter</button>
            </div>
            <p v-if="retours[s.Id_signalement]" class="retour" :class="retours[s.Id_signalement].cls">{{ retours[s.Id_signalement].msg }}</p>
          </div>
        </div>
      </section>

      <div v-else class="vide"><span>✅</span><p>Aucun signalement en attente</p></div>

      <section v-if="traites.length > 0">
        <h2 class="section-titre"><span class="point point-gris"></span>Signalements traités</h2>
        <div class="grille">
          <div v-for="s in traites" :key="s.Id_signalement" class="carte-item carte-item-attenué" :class="s.evalutaion === 1 ? 'carte-item-vert' : 'carte-item-rouge'">
            <div class="carte-item_entete">
              <span class="carte-item_id">#{{ s.Id_signalement }}</span>
              <span class="badge" :class="s.evalutaion === 1 ? 'badge-valide' : 'badge-rejeté'">{{ s.evalutaion === 1 ? '✔ Validé' : '✘ Rejeté' }}</span>
              <span class="carte-item_date">{{ formater(s.date_) }}</span>
            </div>
            <p class="carte-item_texte carte-item_texte-attenué">{{ s.text }}</p>
            <div class="carte-item_meta">
              <div class="carte-item_ligne"><span>📍</span><span>{{ s.emplacement_libelle }}</span></div>
              <div class="carte-item_ligne">
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
        const res = await fetch('http://localhost:3000/signalement', { headers: this.$auth() })
        this.signalements = await res.json()
      } catch(e) { console.error(e) }
      finally { this.chargement = false }
    },
    async valider(s) {
      this.traitement = s.Id_signalement
      try {
        const res  = await fetch('http://localhost:3000/signalement/valider', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })
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
        const res  = await fetch('http://localhost:3000/signalement/rejeter', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ id_signalement: s.Id_signalement }) })
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