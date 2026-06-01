<template>
  <div v-if="nav === 0" class="accueil">

    <div class="hero">
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
     
      <div class="stat-carte">
        <span class="stat-carte-icone">🚨</span>
        <div>
          <p class="stat-carte-valeur">{{ user.nb_avertissement || 0 }} / 5</p>
          <p class="stat-carte-label">Avertissements</p>
        </div>
      </div>
    </div>

    <div class="stat-carte">
      <h2 class="stat-carte-valeur">Pourquoi choisir TrashTalk ?</h2>
      <p class="stat-carte-label">TrashTalk révolutionne la gestion des déchets à Marseille grâce à une plateforme intelligente qui connecte citoyens, conducteurs et administrateurs. Suivez les contenants en temps réel, signalez les problèmes et optimisez les collectes pour une ville plus propre et plus efficace.</p>
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