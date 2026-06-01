<template>
  <div v-if="nav === 2" class="page-center">
    <div class="boite">
      <div class="boite_entete">
        <h1 class="boite_titre">{{ estInscription ? 'Créer un compte' : 'Connexion' }}</h1>
      </div>

      <div class="champ">
        <label class="champ-label">Login</label>
        <input class="champ-input" v-model="login" placeholder="Votre identifiant" autocomplete="username" />
      </div>
      <div class="champ">
        <label class="champ-label">Mot de passe</label>
        <input class="champ-input" v-model="pwd" type="password" placeholder="••••••••" autocomplete="current-password" />
      </div>
      <div v-if="estInscription" class="champ">
        <label class="champ-label">Avatar <span class="champ-opt">(optionnel)</span></label>
        <input class="champ-input" v-model="icon" placeholder="URL d'une image" />
      </div>

      <button class="btn-principal" :disabled="chargement" @click="soumettre">
        {{ chargement ? '…' : estInscription ? 'Créer le compte' : 'Se connecter' }}
      </button>
      <button class="btn-secondaire" @click="basculer">
        {{ estInscription ? '← Retour à la connexion' : 'Pas encore de compte ?' }}
      </button>

      <p v-if="msg" class="message" :class="msg.includes('✔') ? 'message-succes' : 'message-erreur'">{{ msg }}</p>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line
  name: 'Connexion',
  props: { nav: Number },
  emits: ['ok'],
  data() {
    return { login: '', pwd: '', icon: '', msg: '', estInscription: false, chargement: false }
  },
  methods: {
    basculer() { this.estInscription = !this.estInscription; this.msg = '' },
    async soumettre() {
      this.chargement = true; this.msg = ''
      try {
        const url  = this.estInscription ? 'http://localhost:3000/register' : 'http://localhost:3000/login'
        const body = this.estInscription
          ? { login: this.login, password: this.pwd, icon: this.icon }
          : { login: this.login, password: this.pwd }
        const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        if (data.success) {
          this.msg = this.estInscription ? 'Compte créé' : 'Connexion réussie'
          if (!this.estInscription) this.$emit('ok', { token: data.token, user: data.user })
        } else {
          this.msg = data.message || 'Erreur'
        }
      } catch { this.msg = 'Erreur serveur' }
      finally  { this.chargement = false }
    }
  }
}
</script>