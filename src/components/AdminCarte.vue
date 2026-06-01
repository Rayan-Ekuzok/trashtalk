<template>
  <div v-if="nav === 5 && user && user.isAdmin" class="gestion-carte page">

    <header class="entete">
      <div class="entete_gauche">
        <span class="entete_icone">🗺</span>
        <div>
          <h1 class="entete_titre">Gestion de la carte</h1>
          <p class="entete_sous-titre">Emplacements · Contenants · Assignations</p>
        </div>
      </div>
    </header>

    <div class="onglets">
      <button v-for="t in onglets" :key="t.id" class="onglet" :class="{ 'onglet-actif': actif === t.id }" @click="actif = t.id">
        {{ t.label }}
      </button>
    </div>

    <!-- Emplacements -->
    <div v-if="actif === 'emp'" class="deux-colonnes">

      <div class="panneau">
        <h2 class="panneau_titre">➕ Nouvel emplacement</h2>
        <div class="champ"><label class="champ_label">Libellé</label><input class="champ_input" v-model="nouvelEmp.libelle" placeholder="Ex : Castellane" /></div>
        <div class="champ"><label class="champ_label">Code postal</label><input class="champ_input" v-model="nouvelEmp.cp" placeholder="13006" maxlength="5" /></div>
        <div class="champ-ligne">
          <div class="champ"><label class="champ_label">Latitude</label><input class="champ_input" v-model="nouvelEmp.lat" placeholder="43.2850" type="number" step="0.0001" /></div>
          <div class="champ"><label class="champ_label">Longitude</label><input class="champ_input" v-model="nouvelEmp.lng" placeholder="5.3800" type="number" step="0.0001" /></div>
        </div>
        <button class="btn-principal" :disabled="empChargement" @click="ajouterEmp">{{ empChargement ? 'Ajout…' : "Ajouter l'emplacement" }}</button>
        <p v-if="empMsg" class="message" :class="empMsg.ok ? 'message-succes' : 'message-erreur'">{{ empMsg.txt }}</p>
      </div>

      <div class="panneau">
        <h2 class="panneau_titre">📍 Emplacements existants</h2>
        <div v-if="!emplacements.length" class="aucun">Aucun emplacement</div>
        <div class="liste-elements">
          <div v-for="e in emplacements" :key="e.Id_emplacement" class="element-ligne">
            <div class="element-info">
              <span class="carte-item_id">#{{ e.Id_emplacement }}</span>
              <span class="element-nom">{{ e.libelle }}</span>
              <span class="element-sous-titre">{{ e.code_postal }}</span>
            </div>
            <span class="element-coords">{{ e.latitude }}, {{ e.longitude }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Contenants -->
    <div v-if="actif === 'cont'" class="deux-colonnes">

      <div class="panneau">
        <h2 class="panneau_titre">➕ Nouveau contenant</h2>
        <div class="champ"><label class="champ_label">Capacité (kg)</label><input class="champ_input" v-model="nouveauCont.cap" placeholder="100" type="number" min="1" /></div>
        <div class="champ"><label class="champ_label">Poids actuel (kg)</label><input class="champ_input" v-model="nouveauCont.poids" placeholder="0" type="number" min="0" /></div>
        <div class="champ">
          <label class="champ_label">Type de déchet</label>
          <select class="champ_select" v-model="nouveauCont.typeId">
            <option disabled value="">Choisir un type</option>
            <option v-for="t in types" :key="t.Id_type_dechet" :value="t.Id_type_dechet">{{ t.libelle }}</option>
          </select>
        </div>
        <div class="champ">
          <label class="champ_label">Emplacement</label>
          <select class="champ_select" v-model="nouveauCont.empId">
            <option disabled value="">Choisir un emplacement</option>
            <option v-for="e in emplacements" :key="e.Id_emplacement" :value="e.Id_emplacement">#{{ e.Id_emplacement }} — {{ e.libelle }}</option>
          </select>
        </div>
        <div class="champ">
          <label class="champ_label">Scellé</label>
          <button class="btn-bascule" :class="nouveauCont.scelle ? 'btn-bascule-actif' : 'btn-bascule-inactif'" @click="nouveauCont.scelle = !nouveauCont.scelle">
            {{ nouveauCont.scelle ? '🔒 Oui' : '🔓 Non' }}
          </button>
        </div>
        <button class="btn-principal" :disabled="contChargement" @click="ajouterCont">{{ contChargement ? 'Ajout…' : 'Ajouter le contenant' }}</button>
        <p v-if="contMsg" class="message" :class="contMsg.ok ? 'message-succes' : 'message-erreur'">{{ contMsg.txt }}</p>
      </div>

      <div class="panneau">
        <h2 class="panneau_titre">🗑 Contenants existants</h2>
        <div v-if="!contenants.length" class="aucun">Aucun contenant</div>
        <div class="liste-elements">
          <div v-for="c in contenants" :key="c.Id_contenant" class="element-ligne">
            <div class="element-info">
              <span class="carte-item_id">#{{ c.Id_contenant }}</span>
              <span class="element-nom">{{ getType(c.Id_type_dechet) }}</span>
              <span class="element-sous-titre">Emp. #{{ c.Id_emplacement }}</span>
            </div>
            <div class="element-droite">
              <div class="barre-fond barre-fond-petite">
                <div class="barre-remplissage" :style="{ width: pct(c) + '%' }" :class="pct(c) >= 80 ? 'barre-remplissage-plein' : pct(c) >= 50 ? 'barre-remplissage-mid' : 'barre-remplissage-ok'"></div>
              </div>
              <span class="element-sous-titre">{{ c.poids_actuel_kg }}/{{ c.capacite_kg }} kg</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Assignation -->
    <div v-if="actif === 'assign'" class="deux-colonnes">

      <div class="panneau">
        <h2 class="panneau_titre">🔗 Assigner un contenant</h2>
        <p class="panneau_desc">Déplace un contenant existant vers un autre emplacement.</p>
        <div class="champ">
          <label class="champ_label">Contenant</label>
          <select class="champ_select" v-model="assignation.contId">
            <option disabled value="">Choisir un contenant</option>
            <option v-for="c in contenants" :key="c.Id_contenant" :value="c.Id_contenant">
              #{{ c.Id_contenant }} — {{ getType(c.Id_type_dechet) }} ({{ c.poids_actuel_kg }}/{{ c.capacite_kg }} kg)
            </option>
          </select>
        </div>
        <div v-if="contSelectionne" class="apercu">
          <p class="apercu_label">Emplacement actuel</p>
          <p class="apercu_valeur">{{ getEmp(contSelectionne.Id_emplacement) }}</p>
        </div>
        <div class="champ">
          <label class="champ_label">Nouvel emplacement</label>
          <select class="champ_select" v-model="assignation.empId">
            <option disabled value="">Choisir un emplacement</option>
            <option v-for="e in emplacements" :key="e.Id_emplacement" :value="e.Id_emplacement">#{{ e.Id_emplacement }} — {{ e.libelle }} ({{ e.code_postal }})</option>
          </select>
        </div>
        <button class="btn-principal" :disabled="assignChargement || !assignation.contId || !assignation.empId" @click="assigner">{{ assignChargement ? 'Assignation…' : "Confirmer l'assignation" }}</button>
        <p v-if="assignMsg" class="message" :class="assignMsg.ok ? 'message-succes' : 'message-erreur'">{{ assignMsg.txt }}</p>
      </div>

      <div class="panneau">
        <h2 class="panneau_titre">📊 Synthèse par emplacement</h2>
        <div class="synthese-liste">
          <div v-for="e in emplacements" :key="e.Id_emplacement" class="synthese-ligne">
            <div class="synthese-entete">
              <span class="carte-item_id">#{{ e.Id_emplacement }}</span>
              <span class="element-nom">{{ e.libelle }}</span>
              <span class="synthese-compteur">{{ contenantsDeLEmp(e.Id_emplacement).length }} contenant(s)</span>
            </div>
            <div v-if="contenantsDeLEmp(e.Id_emplacement).length" class="synthese-tags">
              <span v-for="c in contenantsDeLEmp(e.Id_emplacement)" :key="c.Id_contenant" class="synthese-tag">#{{ c.Id_contenant }} {{ getType(c.Id_type_dechet) }}</span>
            </div>
            <p v-else class="synthese-vide">Aucun contenant assigné</p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'AdminCarte',
  props: { nav: Number, user: Object },
  data() {
    return {
      actif: 'emp',
      onglets: [
        { id: 'emp',    label: '📍 Emplacements' },
        { id: 'cont',   label: '🗑 Contenants' },
        { id: 'assign', label: '🔗 Assignation' }
      ],
      emplacements: [], contenants: [], types: [],
      nouvelEmp:    { libelle: '', cp: '', lat: '', lng: '' },
      empChargement: false, empMsg: null,
      nouveauCont:  { cap: '', poids: 0, typeId: '', empId: '', scelle: false },
      contChargement: false, contMsg: null,
      assignation:  { contId: '', empId: '' },
      assignChargement: false, assignMsg: null
    }
  },
  computed: {
    contSelectionne() {
      return this.assignation.contId ? this.contenants.find(c => c.Id_contenant === this.assignation.contId) : null
    }
  },
  watch: {
    nav(v) { if (v === 5 && this.user?.isAdmin) this.chargerTout() }
  },
  methods: {
    async chargerTout() {
      const [e, c, t] = await Promise.all([
        fetch('http://localhost:3000/emplacement').then(r => r.json()),
        fetch('http://localhost:3000/contenant').then(r => r.json()),
        fetch('http://localhost:3000/type_dechet').then(r => r.json())
      ])
      this.emplacements = Array.isArray(e) ? e : []
      this.contenants   = Array.isArray(c) ? c : []
      this.types        = Array.isArray(t) ? t : []
    },
    getType(id) { const t = this.types.find(t => t.Id_type_dechet === id); return t ? t.libelle : '?' },
    getEmp(id)  { const e = this.emplacements.find(e => e.Id_emplacement === id); return e ? `#${e.Id_emplacement} — ${e.libelle}` : '?' },
    contenantsDeLEmp(id) { return this.contenants.filter(c => c.Id_emplacement === id) },
    pct(c) { const p = parseFloat(c.poids_actuel_kg), cap = parseFloat(c.capacite_kg); return cap ? Math.min(100, Math.round((p / cap) * 100)) : 0 },

    async ajouterEmp() {
      const { libelle, cp, lat, lng } = this.nouvelEmp
      if (!libelle || !cp || !lat || !lng) { this.empMsg = { ok: false, txt: 'Tous les champs sont obligatoires' }; return }
      this.empChargement = true; this.empMsg = null
      try {
        const res  = await fetch('http://localhost:3000/emplacement/ajouter', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ libelle, code_postal: cp, latitude: parseFloat(lat), longitude: parseFloat(lng) }) })
        const data = await res.json()
        if (data.success) { this.empMsg = { ok: true, txt: `Emplacement "${libelle}" ajouté ✔` }; this.nouvelEmp = { libelle: '', cp: '', lat: '', lng: '' }; await this.chargerTout() }
        else this.empMsg = { ok: false, txt: data.message || 'Erreur' }
      } catch { this.empMsg = { ok: false, txt: 'Erreur serveur' } }
      finally  { this.empChargement = false }
    },

    async ajouterCont() {
      const { cap, poids, typeId, empId, scelle } = this.nouveauCont
      if (!cap || !typeId || !empId) { this.contMsg = { ok: false, txt: 'Capacité, type et emplacement sont obligatoires' }; return }
      this.contChargement = true; this.contMsg = null
      try {
        const res  = await fetch('http://localhost:3000/contenant/ajouter', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ capacite_kg: parseInt(cap), poids_actuel_kg: parseFloat(poids) || 0, Id_type_dechet: parseInt(typeId), Id_emplacement: parseInt(empId), scelle: scelle ? 1 : 0 }) })
        const data = await res.json()
        if (data.success) { this.contMsg = { ok: true, txt: `Contenant #${data.id} ajouté ✔` }; this.nouveauCont = { cap: '', poids: 0, typeId: '', empId: '', scelle: false }; await this.chargerTout() }
        else this.contMsg = { ok: false, txt: data.message || 'Erreur' }
      } catch { this.contMsg = { ok: false, txt: 'Erreur serveur' } }
      finally  { this.contChargement = false }
    },

    async assigner() {
      const { contId, empId } = this.assignation
      if (!contId || !empId) return
      this.assignChargement = true; this.assignMsg = null
      try {
        const res  = await fetch('http://localhost:3000/contenant/assigner', { method: 'POST', headers: this.$auth(), body: JSON.stringify({ Id_contenant: parseInt(contId), Id_emplacement: parseInt(empId) }) })
        const data = await res.json()
        if (data.success) {
          const e = this.emplacements.find(e => e.Id_emplacement === parseInt(empId))
          this.assignMsg = { ok: true, txt: `Contenant #${contId} assigné à ${e?.libelle} ✔` }
          this.assignation = { contId: '', empId: '' }
          await this.chargerTout()
        } else this.assignMsg = { ok: false, txt: data.message || 'Erreur' }
      } catch { this.assignMsg = { ok: false, txt: 'Erreur serveur' } }
      finally  { this.assignChargement = false }
    }
  }
}
</script>