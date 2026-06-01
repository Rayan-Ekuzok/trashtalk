<template>
  <div v-if="nav === 4 && user && (user.isConducteur || user.isAdmin)" class="conducteur page">

    <header class="entete">
      <div class="entete-gauche">
        <div>
          <h1 class="entete-titre">{{ user.isAdmin ? 'Tous les transferts' : 'Mes Transferts' }}</h1>
          <p class="entete-sous-titre">{{ user.isAdmin ? 'Vue administrateur — toutes les missions' : user.login + ' — vos affectations' }}</p>
        </div>
      </div>
      <div class="entete-stats">
        <div class="stat">
          <span class="stat-nombre">{{ enCours.length }}</span>
          <span class="stat-libelle">En cours</span>
        </div>
        <div class="stat">
          <span class="stat-nombre">{{ enAttente.length }}</span>
          <span class="stat-libelle">En attente</span>
        </div>
        <div class="stat">
          <span class="stat-nombre">{{ termines.length }}</span>
          <span class="stat-libelle">Terminés</span>
        </div>
      </div>
    </header>

    <div v-if="chargement" class="chargement">Chargement des transferts…</div>
    <div v-else-if="erreur" class="vide vide-erreur"><span>⚠️</span><p>{{ erreur }}</p></div>
    <div v-else-if="!transferts.length" class="vide"><span>📭</span><p>Aucun transfert trouvé</p></div>

    <div v-else>

      <section v-if="enCours.length > 0">
        <h2 class="section-titre"><span class="point point-vert"></span>En cours</h2>
        <div class="grille">
          <div v-for="t in enCours" :key="t.Id_transfert" class="carte-item carte-item-vert">
            <div class="carte-item-entete">
              <span class="carte-item-id">#{{ t.Id_transfert }}</span>
              <span class="badge badge-vert">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="carte-item-section"><p class="carte-item-section-label">🗓 Dates</p><p class="carte-item-valeur">Demande : {{ formater(t.date_demande) }}</p><p class="carte-item-valeur">Début : {{ formater(t.date_debut) }}</p><p class="carte-item-valeur">Fin : {{ t.date_fin ? formater(t.date_fin) : '—' }}</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">🚚 Véhicule</p><p class="carte-item-valeur"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p><p class="carte-item-valeur">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">📍 Destination</p><p class="carte-item-valeur"><b>{{ t.centre_ville }}</b></p><p class="carte-item-valeur">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p><p class="carte-item-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p></div>
          </div>
        </div>
      </section>

      <section v-if="enAttente.length > 0">
        <h2 class="section-titre"><span class="point point-jaune"></span>En attente</h2>
        <div class="grille">
          <div v-for="t in enAttente" :key="t.Id_transfert" class="carte-item carte-item-jaune">
            <div class="carte-item-entete">
              <span class="carte-item-id">#{{ t.Id_transfert }}</span>
              <span class="badge badge-jaune">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="carte-item-section"><p class="carte-item-section-label">🗓 Dates</p><p class="carte-item-valeur">Demande : {{ formater(t.date_demande) }}</p><p class="carte-item-valeur">Début : {{ formater(t.date_debut) }}</p><p class="carte-item-valeur">Fin : {{ t.date_fin ? formater(t.date_fin) : '—' }}</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">🚚 Véhicule</p><p class="carte-item-valeur"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p><p class="carte-item-valeur">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">📍 Destination</p><p class="carte-item-valeur"><b>{{ t.centre_ville }}</b></p><p class="carte-item-valeur">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p><p class="carte-item-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p></div>
          </div>
        </div>
      </section>

      <section v-if="termines.length > 0">
        <h2 class="section-titre"><span class="point point-gris"></span>Terminés</h2>
        <div class="grille">
          <div v-for="t in termines" :key="t.Id_transfert" class="carte-item carte-item-gris">
            <div class="carte-item-entete">
              <span class="carte-item-id">#{{ t.Id_transfert }}</span>
              <span class="badge badge-gris">{{ t.statut }}</span>
              <span v-if="user.isAdmin && t.conducteur_login" class="badge-conducteur">🧑 {{ t.conducteur_login }}</span>
            </div>
            <div class="carte-item-section"><p class="carte-item-section-label">🗓 Dates</p><p class="carte-item-valeur">Demande : {{ formater(t.date_demande) }}</p><p class="carte-item-valeur">Début : {{ formater(t.date_debut) }}</p><p class="carte-item-valeur">Fin : {{ formater(t.date_fin) }}</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">🚚 Véhicule</p><p class="carte-item-valeur"><b>{{ t.type_vehicule }}</b> — matricule #{{ t.matricule }}</p><p class="carte-item-valeur">Capacité : {{ t.capacite_kg }} kg / {{ t.capacite_m2 }} m²</p></div>
            <div class="carte-item-section"><p class="carte-item-section-label">📍 Destination</p><p class="carte-item-valeur"><b>{{ t.centre_ville }}</b></p><p class="carte-item-valeur">{{ t.centre_adresse }}, {{ t.centre_code_postal }}</p><p class="carte-item-coords">{{ t.centre_latitude }}, {{ t.centre_longitude }}</p></div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ConducteurView',
  props: { nav: Number, user: Object },
  data() {
    return { transferts: [], chargement: false, erreur: null }
  },
  computed: {
    enCours() { 
      return this.transferts.filter(t => t.statut === 'en cours')
    },
    enAttente() { 
      return this.transferts.filter(t => t.statut === 'en attente')
    },
    termines() {
      return this.transferts.filter(t => t.statut === 'terminé')
    }
  },
  watch: {
    nav(v) { if (v === 4 && this.user && (this.user.isConducteur || this.user.isAdmin)) this.charger() }
  },
  methods: {
    async charger() {
      this.chargement = true; this.erreur = null; this.transferts = []
      try {
        const url  = this.user.isAdmin
          ? 'http://localhost:3000/transferts/all'
          : `http://localhost:3000/conducteur/transferts/${this.user.Id_utilisateur}`
        const res  = await fetch(url, { headers: this.$auth() })
        const data = await res.json()
        if (Array.isArray(data)) this.transferts = data
        else this.erreur = data.message || 'Réponse inattendue du serveur'
      } catch { this.erreur = 'Impossible de contacter le serveur' }
      finally  { this.chargement = false }
    },
    formater(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
}
</script>