# 🗑️ TrashTalk — Client Vue.js

> 📚 Projet réalisé dans le cadre de mes études en **BTS SIO** (Services Informatiques aux Organisations).  
> Il est volontairement rendu public sur GitHub à titre de référence et d'apprentissage. Vous êtes libres de vous en inspirer.

🔗 **Dépôt serveur Node.js :** [github.com/Rayan-Ekuzok/Trashtalk_serveur](https://github.com/Rayan-Ekuzok/Trashtalk_serveur)

Interface web de l'application **TrashTalk**, une plateforme de gestion des déchets urbains à Marseille. Elle permet aux citoyens de localiser les contenants sur une carte, de signaler des problèmes, et offre aux conducteurs et administrateurs des vues dédiées à la gestion des transferts et des emplacements.

---

## 🌐 Démo en ligne

| | URL |
|---|---|
| **Client Vue.js** | [https://rayanfellous.alwaysdata.net](https://rayanfellous.alwaysdata.net) |
| **Serveur API** | [https://fellous.alwaysdata.net](https://fellous.alwaysdata.net) |

---

## 🚀 Technologies utilisées

| Dépendance | Rôle |
|---|---|
| [Vue.js 3](https://vuejs.org/) | Framework JavaScript frontend |
| [Leaflet](https://leafletjs.com/) | Carte interactive OpenStreetMap |
| [IBM Plex Sans / Mono](https://fonts.google.com/) | Typographie |

---

## 📱 Vues de l'application

| Vue | Accès | Description |
|---|---|---|
| **Accueil** | Public | Présentation de l'application et statistiques utilisateur |
| **Carte** | Public | Carte interactive avec les contenants et signalements |
| **Connexion** | Public | Connexion et création de compte |
| **Transferts** | Conducteur / Admin | Suivi des missions de collecte (en cours, en attente, terminées) |
| **Admin** | Admin | Modération des signalements citoyens |
| **Gestion carte** | Admin | Ajout d'emplacements, de contenants et réassignation |

---

## ⚙️ Installation

```bash
# Cloner le dépôt
git clone https://github.com/Rayan-Ekuzok/trashtalk.git
cd trashtalk

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Par défaut, le client pointe vers le serveur en production `https://fellous.alwaysdata.net`.  
Pour pointer vers un serveur local, remplacez les URLs dans les composants par `http://localhost:3000`.

---

## 🔐 Gestion de session

- Le token JWT est stocké dans le `localStorage` et renouvelé automatiquement toutes les **10 minutes** si l'utilisateur est actif.
- Après **10 minutes d'inactivité** (aucun clic, scroll ou frappe), la session expire et une popup invite à se reconnecter.
- Les événements d'activité surveillés : `mousemove`, `keydown`, `click`, `scroll`, `touchstart`.

---

## 👥 Rôles utilisateurs

| Rôle | Accès |
|---|---|
| **Citoyen** | Carte, signalement de problèmes |
| **Conducteur** | Carte + vue de ses transferts de collecte |
| **Admin** | Tout — modération, gestion carte, tous les transferts |

---

## 🧪 Comptes de test

Des comptes préconfigurés sont disponibles pour tester les différentes fonctionnalités de la démo :

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| **Administrateur** | `Joe` | `JeSuisJoe` |
| **Conducteur** | `Simon` | `JeSuisSimon` |
| **Utilisateur** | `Nathan` | `JeSuisNathan` |

---

## 🗺️ Fonctionnement de la carte

La carte (powered by **Leaflet** + **OpenStreetMap**) affiche uniquement les emplacements ayant au moins un contenant non plein. En cliquant sur un marqueur, un panneau latéral affiche les contenants disponibles avec leur taux de remplissage, et permet aux utilisateurs connectés de soumettre un signalement.
