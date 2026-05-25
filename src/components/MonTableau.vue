<template>
    <table> 




        

        <tr v-for='uneListe in maListe' :key='uneListe'>
            
            <td>{{ uneListe.Id_contenant }} </td>
            <td>{{ uneListe.Id_lot }}  </td>
            <td>{{ uneListe.poids_total_kg }}  </td>
            <td>{{ uneListe.Id_transfert }}  </td>
        </tr>
    </table>
  </template>
  
  <script>
  export default {
    name: 'MonTableau',
    data () {
        return {
            maListe: []
        }
    },
    methods : {
        afficherGares () {
            fetch('http://localhost:3000/lot')
                .then(res => res.json())
                .then(data => {this.maListe = data})
        }
    },
    mounted () {
        this.afficherGares()
    }
  }
  </script>
  
  <style scoped>

  </style>
  