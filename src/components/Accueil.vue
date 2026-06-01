<template>
  <div v-if="nav === 0" class="accueil">

    <div class="hero">
      <div class="hero-badge">🗑 TrashTalk</div>
      <h1 class="hero-titre">Gestion intelligente<br>des déchets urbains</h1>
      <p class="hero-sous-titre">Suivez les contenants en temps réel, signalez les problèmes et optimisez les collectes à Marseille.</p>
      <div class="hero-boutons">
        <button v-if="!user" class="btn-principal" @click="$emit('go', 2)">Se connecter</button>
        <button class="btn-secondaire" @click="$emit('go', 1)">Voir la carte →</button>
      </div>
    </div>

    <div v-if="user" class="stat-rangee">
      <div class="stat-carte">
        <span class="stat-carte-icone">👤</span>
        <div>
          <p class="stat-carte-valeur">{{ user.login }}</p>
          <p class="stat-carte-label">Connecté</p>
        </div>
      </div>
      <div v-if="user.isAdmin" class="stat-carte">
        <span class="stat-carte-icone">⚠</span>
        <div>
          <p class="stat-carte-valeur">Admin</p>
          <p class="stat-carte-label">Accès total</p>
        </div>
      </div>
      <div v-if="user.isConducteur" class="stat-carte">
        <span class="stat-carte-icone">🚛</span>
        <div>
          <p class="stat-carte-valeur">Conducteur</p>
          <p class="stat-carte-label">Transferts affectés</p>
        </div>
      </div>
      <div class="stat-carte">
        <span class="stat-carte-icone">🚨</span>
        <div>
          <p class="stat-carte-valeur">{{ user.nb_avertissement || 0 }} / 5</p>
          <p class="stat-carte-label">Avertissements</p>
        </div>
      </div>
    </div>

    <div class="fonctionnalites">
      <div class="fonctionnalite" @click="$emit('go', 1)">
        <span class="fonctionnalite-icone">🗺</span>
        <h3 class="fonctionnalite-titre">Carte interactive</h3>
        <p class="fonctionnalite-desc">Visualisez tous les emplacements de collecte et leur niveau de remplissage en temps réel.</p>
        <span class="fonctionnalite-lien">Ouvrir la carte →</span>
      </div>
      <div v-if="user && user.isConducteur" class="fonctionnalite" @click="$emit('go', 4)">
        <span class="fonctionnalite-icone">🚛</span>
        <h3 class="fonctionnalite-titre">Mes transferts</h3>
        <p class="fonctionnalite-desc">Consultez vos missions de collecte, les véhicules affectés et les centres de destination.</p>
        <span class="fonctionnalite-lien">Voir mes transferts →</span>
      </div>
      <div v-if="user && user.isAdmin" class="fonctionnalite" @click="$emit('go', 3)">
        <span class="fonctionnalite-icone">⚠</span>
        <h3 class="fonctionnalite-titre">Panneau admin</h3>
        <p class="fonctionnalite-desc">Gérez les signalements citoyens, validez ou rejetez les rapports et suivez les avertissements.</p>
        <span class="fonctionnalite-lien">Accéder →</span>
      </div>
      <div v-if="!user" class="fonctionnalite" @click="$emit('go', 2)">
        <span class="fonctionnalite-icone">🔑</span>
        <h3 class="fonctionnalite-titre">Connexion</h3>
        <p class="fonctionnalite-desc">Connectez-vous pour accéder à toutes les fonctionnalités selon votre rôle.</p>
        <span class="fonctionnalite-lien">Se connecter →</span>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  // eslint-disable-next-line
  name: 'Accueil',
  props: { nav: Number, user: Object },
  emits: ['go']
}
</script>