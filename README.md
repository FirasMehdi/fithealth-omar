# FitHealth

Application de suivi santé pour un cabinet de naturopathie et coaching en
activité physique adaptée. Un praticien unique (médecin, naturopathe et coach)
y accompagne ses patients entre les consultations : protocoles personnalisés,
check-ins hebdomadaires, messagerie directe et tableau de bord d'activité.

## Stack

- **Backend** — Laravel 12, PHP 8.2+, PostgreSQL
- **Frontend** — Inertia.js 3 + React 19 (JSX, pas de TypeScript), Tailwind CSS 4
- **Graphiques** — Chart.js / react-chartjs-2
- **Icônes** — lucide-react

Installation bare Laravel — pas de starter kit (Breeze/Fortify), auth et
autorisations écrites à la main (policies Laravel).

## Fonctionnalités

**Espace praticien**
- Tableau de bord : indicateurs d'activité, courbe de croissance du cabinet,
  courbe d'observance moyenne, répartition des patients par tranche
  d'observance (cliquable, filtre la liste des patients), patients à relancer
- Gestion des patients : fiche complète, protocoles (mouvement / nutrition),
  consignes de vitalité, historique des check-ins
- Templates de protocoles réutilisables
- Messagerie par patient

**Espace patient**
- Accueil : protocole du jour à cocher, consignes de vitalité
- Protocole de la semaine, vue par jour
- Check-in hebdomadaire (énergie, sommeil, digestion, humeur, observance, note)
- Messagerie avec son praticien

## Modèle de données

La référence complète du modèle (tables, relations, règles métier) est dans
[`docs/MODELE-DONNEES.md`](docs/MODELE-DONNEES.md). À consulter avant toute
migration ou modification de modèle.

## Installation

Prérequis : PHP 8.2+, Composer, Node.js 18+, PostgreSQL.

```bash
git clone <url-du-repo>
cd fithealth

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configurer la base de données dans `.env` (`DB_DATABASE`, `DB_USERNAME`,
`DB_PASSWORD`), puis :

```bash
php artisan migrate --seed
```

## Lancer le projet en local

```bash
composer run dev
```

Lance en parallèle le serveur Laravel, le worker de queue, les logs (Pail) et
Vite en mode watch. Alternative manuelle :

```bash
php artisan serve
npm run dev
```

## Comptes de démonstration

Après le seed (`php artisan migrate --seed`), mot de passe commun : `password`

| Rôle | Email |
|---|---|
| Praticien | `praticien@fithealth.tn` |
| Patient | `amina.trabelsi@example.com` |
| Patient | `karim.bouazizi@example.com` |
| Patient | `salma.gharbi@example.com` |
| Patient | `youssef.mansouri@example.com` |
| Patient | `nour.chaabane@example.com` |
| Patient | `mehdi.jlassi@example.com` |

## Tests

```bash
composer run test
```

## Build de production

```bash
npm run build
```
