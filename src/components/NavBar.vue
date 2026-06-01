<template>
  <nav class="navbar">
    <a class="navbar-lien" @click="$emit('go', 0)">Accueil</a>
    <a class="navbar-lien" @click="$emit('go', 1)">Carte</a>
    <a v-if="!user" class="navbar-lien" @click="$emit('go', 2)">Connexion</a>
    <a v-if="user && (user.isConducteur || user.isAdmin)" class="navbar-lien navbar-lien-conducteur" @click="$emit('go', 4)">Transferts</a>
    <a v-if="user && user.isAdmin" class="navbar-lien navbar-lien-admin" @click="$emit('go', 3)">Admin</a>
    <a v-if="user && user.isAdmin" class="navbar-lien navbar-lien-carte" @click="$emit('go', 5)">Gestion carte</a>
    <a v-if="user" class="navbar-lien navbar-lien-deconnexion" @click="$emit('logout')">Déconnexion</a>
    <span v-if="user" class="navbar-utilisateur">{{ user.login }}</span>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: { nav: Number, user: Object },
  emits: ['go', 'logout']
}
</script>