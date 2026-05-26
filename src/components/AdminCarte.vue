<template>
  <div v-if="NavVar === 5 && user && user.isAdmin" class="admin-carte-wrap">

    <header class="page-header">
      <div class="header-left">
        <span class="header-icon">🗺</span>
        <div>
          <h1>Gestion de la carte</h1>
          <p class="header-sub">Emplacements · Contenants · Assignations</p>
        </div>
      </div>
    </header>

    <!-- ── ONGLETS ── -->
    <div class="tabs">
      <button
        v-for="tab in tabs" :key="tab.id"
        class="tab"
        :class="{ 'tab-active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ══════════════════════════════════════════
         ONGLET 1 : EMPLACEMENTS
    ══════════════════════════════════════════ -->
    <div v-if="activeTab === 'emplacements'" class="tab-content">

      <div class="two-col">

        <!-- Formulaire ajout -->
        <div class="panel">
          <h2 class="panel-title">➕ Nouvel emplacement</h2>
          <div class="form-group">
            <label>Libellé</label>
            <input v-model="newEmp.libelle" placeholder="Ex : Castellane" />
          </div>
          <div class="form-group">
            <label>Code postal</label>
            <input v-model="newEmp.code_postal" placeholder="13006" maxlength="5" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input v-model="newEmp.latitude" placeholder="43.2850" type="number" step="0.0001" />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input v-model="newEmp.longitude" placeholder="5.3800" type="number" step="0.0001" />
            </div>
          </div>
          <button class="btn-primary" :disabled="empLoading" @click="ajouterEmplacement">
            {{ empLoading ? 'Ajout…' : 'Ajouter l\'emplacement' }}
          </button>
          <p v-if="empMsg" class="msg" :class="empMsg.ok ? 'msg-ok' : 'msg-err'">{{ empMsg.text }}</p>
        </div>

        <!-- Liste emplacements -->
        <div class="panel">
          <h2 class="panel-title">📍 Emplacements existants</h2>
          <div v-if="emplacements.length === 0" class="empty">Aucun emplacement</div>
          <div class="item-list">
            <div v-for="e in emplacements" :key="e.Id_emplacement" class="item-row">
              <div class="item-info">
                <span class="item-id">#{{ e.Id_emplacement }}</span>
                <span class="item-name">{{ e.libelle }}</span>
                <span class="item-sub">{{ e.code_postal }}</span>
              </div>
              <span class="item-coords">{{ e.latitude }}, {{ e.longitude }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════
         ONGLET 2 : CONTENANTS
    ══════════════════════════════════════════ -->
    <div v-if="activeTab === 'contenants'" class="tab-content">

      <div class="two-col">

        <!-- Formulaire ajout -->
        <div class="panel">
          <h2 class="panel-title">➕ Nouveau contenant</h2>
          <div class="form-group">
            <label>Capacité (kg)</label>
            <input v-model="newCont.capacite_kg" placeholder="100" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>Poids actuel (kg)</label>
            <input v-model="newCont.poids_actuel_kg" placeholder="0" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Type de déchet</label>
            <select v-model="newCont.Id_type_dechet">
              <option disabled value="">Choisir un type</option>
              <option v-for="t in types" :key="t.Id_type_dechet" :value="t.Id_type_dechet">
                {{ t.libelle }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Emplacement</label>
            <select v-model="newCont.Id_emplacement">
              <option disabled value="">Choisir un emplacement</option>
              <option v-for="e in emplacements" :key="e.Id_emplacement" :value="e.Id_emplacement">
                #{{ e.Id_emplacement }} — {{ e.libelle }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Scellé</label>
            <div class="toggle-row">
              <button
                class="toggle-btn"
                :class="newCont.scelle ? 'toggle-on' : 'toggle-off'"
                @click="newCont.scelle = !newCont.scelle"
              >
                {{ newCont.scelle ? '🔒 Oui' : '🔓 Non' }}
              </button>
            </div>
          </div>
          <button class="btn-primary" :disabled="contLoading" @click="ajouterContenant">
            {{ contLoading ? 'Ajout…' : 'Ajouter le contenant' }}
          </button>
          <p v-if="contMsg" class="msg" :class="contMsg.ok ? 'msg-ok' : 'msg-err'">{{ contMsg.text }}</p>
        </div>

        <!-- Liste contenants -->
        <div class="panel">
          <h2 class="panel-title">🗑 Contenants existants</h2>
          <div v-if="contenants.length === 0" class="empty">Aucun contenant</div>
          <div class="item-list">
            <div v-for="c in contenants" :key="c.Id_contenant" class="item-row">
              <div class="item-info">
                <span class="item-id">#{{ c.Id_contenant }}</span>
                <span class="item-name">{{ getType(c.Id_type_dechet) }}</span>
                <span class="item-sub">Emp. #{{ c.Id_emplacement }}</span>
              </div>
              <div class="item-right">
                <div class="mini-bar-bg">
                  <div
                    class="mini-bar-fill"
                    :style="{ width: pct(c) + '%' }"
                    :class="pct(c) >= 80 ? 'bar-danger' : pct(c) >= 50 ? 'bar-warn' : 'bar-ok'"
                  ></div>
                </div>
                <span class="item-sub">{{ c.poids_actuel_kg }}/{{ c.capacite_kg }} kg</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════
         ONGLET 3 : ASSIGNATION
    ══════════════════════════════════════════ -->
    <div v-if="activeTab === 'assignation'" class="tab-content">

      <div class="two-col">

        <!-- Formulaire assignation -->
        <div class="panel">
          <h2 class="panel-title">🔗 Assigner un contenant</h2>
          <p class="panel-desc">Déplace un contenant existant vers un autre emplacement.</p>

          <div class="form-group">
            <label>Contenant</label>
            <select v-model="assign.Id_contenant">
              <option disabled value="">Choisir un contenant</option>
              <option v-for="c in contenants" :key="c.Id_contenant" :value="c.Id_contenant">
                #{{ c.Id_contenant }} — {{ getType(c.Id_type_dechet) }} ({{ c.poids_actuel_kg }}/{{ c.capacite_kg }} kg)
              </option>
            </select>
          </div>

          <!-- Aperçu du contenant sélectionné -->
          <div v-if="contenantSelectionne" class="preview-card">
            <p class="preview-label">Emplacement actuel</p>
            <p class="preview-val">
              {{ getEmplacement(contenantSelectionne.Id_emplacement) }}
            </p>
          </div>

          <div class="form-group">
            <label>Nouvel emplacement</label>
            <select v-model="assign.Id_emplacement">
              <option disabled value="">Choisir un emplacement</option>
              <option v-for="e in emplacements" :key="e.Id_emplacement" :value="e.Id_emplacement">
                #{{ e.Id_emplacement }} — {{ e.libelle }} ({{ e.code_postal }})
              </option>
            </select>
          </div>

          <button
            class="btn-primary"
            :disabled="assignLoading || !assign.Id_contenant || !assign.Id_emplacement"
            @click="assigner"
          >
            {{ assignLoading ? 'Assignation…' : 'Confirmer l\'assignation' }}
          </button>
          <p v-if="assignMsg" class="msg" :class="assignMsg.ok ? 'msg-ok' : 'msg-err'">{{ assignMsg.text }}</p>
        </div>

        <!-- Vue synthèse emplacement → contenants -->
        <div class="panel">
          <h2 class="panel-title">📊 Synthèse par emplacement</h2>
          <div class="synthese-list">
            <div v-for="e in emplacements" :key="e.Id_emplacement" class="synthese-row">
              <div class="synthese-header">
                <span class="item-id">#{{ e.Id_emplacement }}</span>
                <span class="item-name">{{ e.libelle }}</span>
                <span class="synthese-count">{{ contenantsPourEmp(e.Id_emplacement).length }} contenant(s)</span>
              </div>
              <div v-if="contenantsPourEmp(e.Id_emplacement).length > 0" class="synthese-tags">
                <span
                  v-for="c in contenantsPourEmp(e.Id_emplacement)"
                  :key="c.Id_contenant"
                  class="synthese-tag"
                >
                  #{{ c.Id_contenant }} {{ getType(c.Id_type_dechet) }}
                </span>
              </div>
              <p v-else class="synthese-empty">Aucun contenant assigné</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { authHeaders } from '../composables/useAuth.js'

export default {
  name: 'AdminCarte',

  props: {
    NavVar: Number,
    user: Object
  },

  data() {
    return {
      activeTab: 'emplacements',
      tabs: [
        { id: 'emplacements', label: '📍 Emplacements' },
        { id: 'contenants',   label: '🗑 Contenants' },
        { id: 'assignation',  label: '🔗 Assignation' }
      ],

      emplacements: [],
      contenants: [],
      types: [],

      // Formulaire emplacement
      newEmp: { libelle: '', code_postal: '', latitude: '', longitude: '' },
      empLoading: false,
      empMsg: null,

      // Formulaire contenant
      newCont: { capacite_kg: '', poids_actuel_kg: 0, Id_type_dechet: '', Id_emplacement: '', scelle: false },
      contLoading: false,
      contMsg: null,

      // Formulaire assignation
      assign: { Id_contenant: '', Id_emplacement: '' },
      assignLoading: false,
      assignMsg: null
    }
  },

  computed: {
    contenantSelectionne() {
      if (!this.assign.Id_contenant) return null
      return this.contenants.find(c => c.Id_contenant === this.assign.Id_contenant) || null
    }
  },

  watch: {
    NavVar(val) {
      if (val === 5 && this.user?.isAdmin) this.fetchAll()
    }
  },

  methods: {
    // ── FETCH ──────────────────────────────────────────────────────
    async fetchAll() {
      const [e, c, t] = await Promise.all([
        fetch('http://localhost:3000/emplacement').then(r => r.json()),
        fetch('http://localhost:3000/contenant').then(r => r.json()),
        fetch('http://localhost:3000/type_dechet').then(r => r.json())
      ])
      this.emplacements = Array.isArray(e) ? e : []
      this.contenants   = Array.isArray(c) ? c : []
      this.types        = Array.isArray(t) ? t : []
    },

    // ── HELPERS ────────────────────────────────────────────────────
    getType(id) {
      const t = this.types.find(t => t.Id_type_dechet === id)
      return t ? t.libelle : '?'
    },

    getEmplacement(id) {
      const e = this.emplacements.find(e => e.Id_emplacement === id)
      return e ? `#${e.Id_emplacement} — ${e.libelle}` : '?'
    },

    contenantsPourEmp(id) {
      return this.contenants.filter(c => c.Id_emplacement === id)
    },

    pct(c) {
      const p = parseFloat(c.poids_actuel_kg)
      const cap = parseFloat(c.capacite_kg)
      if (!cap) return 0
      return Math.min(100, Math.round((p / cap) * 100))
    },

    // ── AJOUTER EMPLACEMENT ────────────────────────────────────────
    async ajouterEmplacement() {
      const { libelle, code_postal, latitude, longitude } = this.newEmp
      if (!libelle || !code_postal || !latitude || !longitude) {
        this.empMsg = { ok: false, text: 'Tous les champs sont obligatoires' }
        return
      }
      this.empLoading = true
      this.empMsg = null
      try {
        const res  = await fetch('http://localhost:3000/emplacement/ajouter', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ libelle, code_postal, latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
        })
        const data = await res.json()
        if (data.success) {
          this.empMsg = { ok: true, text: `Emplacement "${libelle}" ajouté ✔` }
          this.newEmp = { libelle: '', code_postal: '', latitude: '', longitude: '' }
          await this.fetchAll()
        } else {
          this.empMsg = { ok: false, text: data.message || 'Erreur' }
        }
      } catch {
        this.empMsg = { ok: false, text: 'Erreur serveur' }
      } finally {
        this.empLoading = false
      }
    },

    // ── AJOUTER CONTENANT ──────────────────────────────────────────
    async ajouterContenant() {
      const { capacite_kg, poids_actuel_kg, Id_type_dechet, Id_emplacement, scelle } = this.newCont
      if (!capacite_kg || !Id_type_dechet || !Id_emplacement) {
        this.contMsg = { ok: false, text: 'Capacité, type et emplacement sont obligatoires' }
        return
      }
      this.contLoading = true
      this.contMsg = null
      try {
        const res  = await fetch('http://localhost:3000/contenant/ajouter', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            capacite_kg:     parseInt(capacite_kg),
            poids_actuel_kg: parseFloat(poids_actuel_kg) || 0,
            Id_type_dechet:  parseInt(Id_type_dechet),
            Id_emplacement:  parseInt(Id_emplacement),
            scelle:          scelle ? 1 : 0
          })
        })
        const data = await res.json()
        if (data.success) {
          this.contMsg = { ok: true, text: `Contenant #${data.id} ajouté ✔` }
          this.newCont = { capacite_kg: '', poids_actuel_kg: 0, Id_type_dechet: '', Id_emplacement: '', scelle: false }
          await this.fetchAll()
        } else {
          this.contMsg = { ok: false, text: data.message || 'Erreur' }
        }
      } catch {
        this.contMsg = { ok: false, text: 'Erreur serveur' }
      } finally {
        this.contLoading = false
      }
    },

    // ── ASSIGNER CONTENANT ─────────────────────────────────────────
    async assigner() {
      const { Id_contenant, Id_emplacement } = this.assign
      if (!Id_contenant || !Id_emplacement) return
      this.assignLoading = true
      this.assignMsg = null
      try {
        const res  = await fetch('http://localhost:3000/contenant/assigner', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ Id_contenant: parseInt(Id_contenant), Id_emplacement: parseInt(Id_emplacement) })
        })
        const data = await res.json()
        if (data.success) {
          const emp = this.emplacements.find(e => e.Id_emplacement === parseInt(Id_emplacement))
          this.assignMsg = { ok: true, text: `Contenant #${Id_contenant} assigné à ${emp?.libelle} ✔` }
          this.assign = { Id_contenant: '', Id_emplacement: '' }
          await this.fetchAll()
        } else {
          this.assignMsg = { ok: false, text: data.message || 'Erreur' }
        }
      } catch {
        this.assignMsg = { ok: false, text: 'Erreur serveur' }
      } finally {
        this.assignLoading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

.admin-carte-wrap {
  font-family: 'IBM Plex Sans', sans-serif;
  background: #0f1117;
  min-height: 100vh;
  color: #e2e8f0;
  padding: 32px;
  box-sizing: border-box;
}

/* ── HEADER ── */
.page-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 24px;
  margin-bottom: 28px;
}

.header-left { display: flex; align-items: center; gap: 16px; }

.header-icon {
  font-size: 2rem;
  background: #1e2330;
  border: 1px solid #42b983;
  border-radius: 10px;
  padding: 10px 14px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #f7fafc;
}

.header-sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #718096;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── TABS ── */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  border-bottom: 1px solid #2d3748;
  padding-bottom: 0;
}

.tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 18px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.88rem;
  color: #718096;
  cursor: pointer;
  transition: color .15s, border-color .15s;
  margin-bottom: -1px;
}

.tab:hover    { color: #a0aec0; }
.tab-active   { color: #42b983; border-bottom-color: #42b983; font-weight: 600; }

/* ── LAYOUT ── */
.tab-content { animation: fadein .15s ease; }
@keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ── PANEL ── */
.panel {
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f7fafc;
  padding-bottom: 14px;
  border-bottom: 1px solid #2d3748;
}

.panel-desc {
  margin: -8px 0 0;
  font-size: 0.82rem;
  color: #718096;
}

/* ── FORM ── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
}

.form-group input,
.form-group select {
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 10px 12px;
  color: #e2e8f0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.88rem;
  outline: none;
  transition: border-color .2s;
}

.form-group input:focus,
.form-group select:focus { border-color: #42b983; }
.form-group input::placeholder { color: #4a5568; }

.form-group select option { background: #1a1f2e; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.toggle-row { display: flex; }

.toggle-btn {
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background .15s;
}

.toggle-on  { background: #2d2a1a; color: #f6ad55; border-color: #f6ad5544; }
.toggle-off { background: #111827; color: #718096; }

/* ── BOUTON ── */
.btn-primary {
  background: #276749;
  color: #c6f6d5;
  border: none;
  border-radius: 8px;
  padding: 11px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  margin-top: 4px;
}

.btn-primary:hover:not(:disabled) { background: #2f855a; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── MESSAGES ── */
.msg {
  margin: 0;
  font-size: 0.8rem;
  font-family: 'IBM Plex Mono', monospace;
  border-radius: 6px;
  padding: 8px 10px;
}

.msg-ok  { background: #1a2d1f; color: #48bb78; border: 1px solid #48bb7833; }
.msg-err { background: #2d1a1a; color: #fc8181; border: 1px solid #fc818133; }

/* ── ITEM LIST ── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.item-list::-webkit-scrollbar { width: 4px; }
.item-list::-webkit-scrollbar-track { background: #111827; border-radius: 99px; }
.item-list::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 99px; }

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 8px;
  padding: 10px 12px;
  gap: 8px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #42b983;
  background: #1a2d1f;
  border: 1px solid #42b98333;
  border-radius: 4px;
  padding: 1px 6px;
}

.item-name {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 500;
}

.item-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #4a5568;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 80px;
}

.item-coords {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  color: #4a5568;
}

.empty {
  text-align: center;
  color: #4a5568;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  padding: 24px 0;
}

/* ── MINI BAR ── */
.mini-bar-bg {
  width: 80px;
  height: 5px;
  background: #1f2937;
  border-radius: 99px;
  overflow: hidden;
}

.mini-bar-fill { height: 100%; border-radius: 99px; transition: width .3s; }
.bar-ok     { background: #48bb78; }
.bar-warn   { background: #f6ad55; }
.bar-danger { background: #fc8181; }

/* ── PREVIEW CARD ── */
.preview-card {
  background: #111827;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 12px 14px;
}

.preview-label {
  margin: 0 0 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4a5568;
}

.preview-val {
  margin: 0;
  font-size: 0.88rem;
  color: #a0aec0;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── SYNTHÈSE ── */
.synthese-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 480px;
  overflow-y: auto;
}

.synthese-row {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.synthese-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.synthese-count {
  margin-left: auto;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #718096;
}

.synthese-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.synthese-tag {
  font-size: 0.72rem;
  background: #1a1f2e;
  border: 1px solid #2d3748;
  border-radius: 4px;
  padding: 2px 8px;
  color: #a0aec0;
  font-family: 'IBM Plex Mono', monospace;
}

.synthese-empty {
  margin: 0;
  font-size: 0.75rem;
  color: #4a5568;
  font-family: 'IBM Plex Mono', monospace;
}
</style>