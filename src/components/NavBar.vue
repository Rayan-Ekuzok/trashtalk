<template>
<nav>
    <a v-on:click='AfficherPage(0)'>Acceuille </a> 
    <a v-on:click='AfficherPage(1)'>carte </a>  
    <a v-on:click='AfficherPage(2)'>Connexion </a>
   <!--  <a v-if="" v-on:click='AfficherPage(3)'>Déconnexion </a>   

    


    <p>{{ NavVar }}</p> -->


</nav>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
    props : {
      NavVar : Number
    },
    methods : {
        AfficherPage (a) {
            this.$emit('ChangePage',a)
        }
    }

  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
    margin-right: 5em;
  }
  </style>
  