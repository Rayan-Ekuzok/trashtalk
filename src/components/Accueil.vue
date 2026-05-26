<template>
  <div v-if="NavVar === 0" class="accueil-wrap">

    <div class="hero">
      <div class="hero-badge">🗑 TrashTalk</div>
      <h1>Gestion intelligente<br>des déchets urbains</h1>
      <p class="hero-sub">Suivez les contenants en temps réel, signalez les problèmes et optimisez les collectes à Marseille.</p>

      <div class="hero-actions">
        <button v-if="!user" class="btn-primary" @click="$emit('ChangePage', 2)">
          Se connecter
        </button>
        <button class="btn-secondary" @click="$emit('ChangePage', 1)">
          Voir la carte →
        </button>
      </div>
    </div>

    <div class="stats-row" v-if="user">
      <div class="stat-card">
        <span class="stat-icon">👤</span>
        <div>
          <p class="stat-val">{{ user.login }}</p>
          <p class="stat-lbl">Connecté</p>
        </div>
      </div>
      <div class="stat-card" v-if="user.isAdmin">
        <span class="stat-icon">⚠</span>
        <div>
          <p class="stat-val">Admin</p>
          <p class="stat-lbl">Accès total</p>
        </div>
      </div>
      <div class="stat-card" v-if="user.isConducteur">
        <span class="stat-icon">🚛</span>
        <div>
          <p class="stat-val">Conducteur</p>
          <p class="stat-lbl">Transferts affectés</p>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🚨</span>
        <div>
          <p class="stat-val">{{ user.nb_avertissement || 0 }} / 5</p>
          <p class="stat-lbl">Avertissements</p>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="feature-card" @click="$emit('ChangePage', 1)">
        <span class="feature-icon">🗺</span>
        <h3>Carte interactive</h3>
        <p>Visualisez tous les emplacements de collecte et leur niveau de remplissage en temps réel.</p>
        <span class="feature-link">Ouvrir la carte →</span>
      </div>

      <div class="feature-card" v-if="user && user.isConducteur" @click="$emit('ChangePage', 4)">
        <span class="feature-icon">🚛</span>
        <h3>Mes transferts</h3>
        <p>Consultez vos missions de collecte, les véhicules affectés et les centres de destination.</p>
        <span class="feature-link">Voir mes transferts →</span>
      </div>

      <div class="feature-card" v-if="user && user.isAdmin" @click="$emit('ChangePage', 3)">
        <span class="feature-icon">⚠</span>
        <h3>Panneau admin</h3>
        <p>Gérez les signalements citoyens, validez ou rejetez les rapports et suivez les avertissements.</p>
        <span class="feature-link">Accéder →</span>
      </div>

      <div class="feature-card" v-if="!user" @click="$emit('ChangePage', 2)">
        <span class="feature-icon">🔑</span>
        <h3>Connexion</h3>
        <p>Connectez-vous pour accéder à toutes les fonctionnalités selon votre rôle.</p>
        <span class="feature-link">Se connecter →</span>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'AccueilView',
  props: {
    NavVar: Number,
    user: Object
  },
  emits: ['ChangePage']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.accueil-wrap {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #e2e8f0;
  padding: 60px 40px;
  box-sizing: border-box;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── HERO ── */
.hero {
  text-align: center;
  padding: 60px 20px 50px;
  border-bottom: 1px solid #2d3748;
  margin-bottom: 48px;
}

.hero-badge {
  display: inline-block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  color: #42b983;
  background: #1a2d1f;
  border: 1px solid #42b98333;
  border-radius: 99px;
  padding: 4px 14px;
  margin-bottom: 24px;
  letter-spacing: 0.06em;
}

.hero h1 {
  margin: 0 0 16px;
  font-size: 2.8rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1.15;
  color: #f7fafc;
}

.hero-sub {
  margin: 0 auto 32px;
  max-width: 520px;
  font-size: 1rem;
  color: #718096;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: #276749;
  color: #c6f6d5;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}

.btn-primary:hover { background: #2f855a; }

.btn-secondary {
  background: transparent;
  color: #a0aec0;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 12px 28px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}

.btn-secondary:hover { color: #e2e8f0; border-color: #4a5568; }

/* ── STATS ── */
.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.stat-card {
  flex: 1;
  min-width: 160px;
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  font-size: 1.6rem;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 8px 10px;
}

.stat-val {
  margin: 0 0 2px;
  font-size: 1rem;
  font-weight: 600;
  color: #f7fafc;
  font-family: 'IBM Plex Mono', monospace;
}

.stat-lbl {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
}

/* ── FEATURES ── */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.feature-card {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 28px 24px;
  cursor: pointer;
  transition: border-color .2s, transform .15s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-card:hover {
  border-color: #42b983;
  transform: translateY(-3px);
}

.feature-icon {
  font-size: 1.8rem;
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 8px 12px;
  display: inline-block;
  width: fit-content;
}

.feature-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f7fafc;
}

.feature-card p {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.55;
}

.feature-link {
  font-size: 0.8rem;
  color: #42b983;
  font-family: 'IBM Plex Mono', monospace;
  margin-top: 4px;
}
</style>