# Fondations i18n/RTL + refonte espace patient — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre l'espace patient de FitHealth (dashboard, programme, check-in, messagerie, connexion) utilisable en français simplifié ou en derja tunisienne (arabe, RTL), avec un design plus visuel (icônes, cartes) — sans toucher à l'espace praticien ni au site public (sous-projets suivants).

**Architecture:** Le sens de lecture et les traductions sont pilotés côté serveur (colonne `users.locale`, middleware dédié, fichiers `lang/fr.json`/`lang/ar.json` partagés à chaque réponse Inertia) et consommés côté client par un hook `useTranslation()` léger, sans librairie i18n externe. Le design garde la charte existante ("Style A" validé en brainstorming) mais introduit un composant `ChecklistItem` icône-first et des classes Tailwind logiques pour un miroir RTL automatique en derja.

**Tech Stack:** Laravel 12 (PHP 8.2+), Inertia.js 3 + React 19 (JSX), Tailwind CSS 4, PostgreSQL, PHPUnit, lucide-react.

**Spec de référence :** `docs/superpowers/specs/2026-08-12-patient-i18n-rtl-redesign-design.md`

## Global Constraints

- Aucune nouvelle dépendance npm/composer : pas de librairie i18n externe (pas de react-i18next), pas de nouvelle librairie d'icônes (lucide-react suffit).
- Toute chaîne visible par l'utilisateur dans le périmètre de ce plan passe par `__()` côté backend ou `t()` côté frontend — jamais de texte en dur.
- Convention de clé de traduction : la clé **est** la phrase française simplifiée exacte (voir spec, section "Traductions — source unique").
- Palette de couleurs et `--radius: 14px` inchangés. Seuls les tokens de police (`--font-display`, `--font-sans`) changent sous `[dir='rtl']`, et les classes Tailwind physiques (`pl-`, `pr-`, `ml-`, `mr-`, `text-left`, `text-right`) deviennent logiques (`ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`) dans les fichiers touchés.
- Cibles tactiles ≥ 44px sur les nouveaux éléments interactifs (`ChecklistItem`).
- Périmètre strict : fichiers `Praticien/*`, `Layouts/PraticienLayout.jsx` et `Public/Accueil.jsx` ne sont **pas** modifiés dans ce plan (sous-projets 2 et 3).
- La localisation des messages de validation Laravel intégrés (`required`, `email`, etc. sans message custom) est explicitement hors scope — seules les chaînes propres à l'application sont traduites.
- Pas de suite de tests JS dans ce projet (aucune actuellement) : les tâches frontend se vérifient par `npm run build` (0 erreur) + vérification manuelle au navigateur, pas par des tests automatisés. Les tâches backend suivent TDD avec PHPUnit.
- PostgreSQL doit tourner localement pour les tests (`fithealth_testing`) et pour la vérification manuelle (`fithealth`). Sur cette machine : `"C:\laragon\bin\postgresql\postgresql\bin\pg_ctl.exe" -D "C:\laragon\data\postgresql" status` pour vérifier, `... start` pour démarrer si besoin.

---

### Task 1: Colonne `locale`, enum, et règle de défaut à la création d'un patient

**Files:**
- Create: `app/Enums/Locale.php`
- Create: `database/migrations/2026_08_12_120000_add_locale_to_users_table.php`
- Modify: `app/Models/User.php`
- Modify: `database/factories/UserFactory.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Modify: `app/Http/Requests/StorePatientRequest.php`
- Modify: `app/Http/Controllers/Praticien/PatientsController.php`
- Test: `tests/Feature/LocaleTest.php` (nouveau fichier, complété par les tâches suivantes)

**Interfaces:**
- Produces: `App\Enums\Locale` (cases `Fr`, `Ar`, méthode `direction(): string` retournant `'ltr'`/`'rtl'`), colonne `users.locale` (string, défaut `'fr'`), `User::casts()['locale'] = Locale::class`.

- [ ] **Step 1: Écrire les tests (échouent tous, rien n'existe encore)**

Créer `tests/Feature/LocaleTest.php` :

```php
<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_nouveau_patient_a_la_derja_par_defaut_via_la_factory(): void
    {
        $patient = User::factory()->patient()->create();

        $this->assertSame(Locale::Ar, $patient->locale);
    }

    public function test_un_nouveau_praticien_a_le_francais_par_defaut_via_la_factory(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->assertSame(Locale::Fr, $practitioner->locale);
    }

    public function test_la_colonne_locale_vaut_fr_par_defaut_en_base(): void
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Sans locale explicite',
            'email' => 'sans-locale@example.com',
            'password' => bcrypt('password'),
            'role' => Role::Praticien->value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertSame('fr', DB::table('users')->find($userId)->locale);
    }

    public function test_un_nouveau_patient_cree_par_le_praticien_est_en_derja_par_defaut(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->actingAs($practitioner)->post('/praticien/patients', [
            'name' => 'Nouveau Patient',
            'email' => 'nouveau.patient@example.com',
            'password' => 'password123',
        ])->assertRedirect();

        $this->assertSame(Locale::Ar, User::where('email', 'nouveau.patient@example.com')->first()->locale);
    }

    public function test_le_praticien_peut_choisir_explicitement_le_francais_a_la_creation(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->actingAs($practitioner)->post('/praticien/patients', [
            'name' => 'Patient Francophone',
            'email' => 'patient.fr@example.com',
            'password' => 'password123',
            'locale' => 'fr',
        ])->assertRedirect();

        $this->assertSame(Locale::Fr, User::where('email', 'patient.fr@example.com')->first()->locale);
    }
}
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent**

Run: `php artisan test --filter=LocaleTest`
Expected: FAIL (colonne `locale` inexistante / classe `Locale` introuvable).

- [ ] **Step 3: Créer l'enum**

`app/Enums/Locale.php` :

```php
<?php

namespace App\Enums;

enum Locale: string
{
    case Fr = 'fr';
    case Ar = 'ar';

    /**
     * Sens de lecture associé — pilote l'attribut `dir` du document et le
     * miroir de mise en page (sidebar, alignement, icônes directionnelles).
     */
    public function direction(): string
    {
        return match ($this) {
            self::Fr => 'ltr',
            self::Ar => 'rtl',
        };
    }
}
```

- [ ] **Step 4: Créer la migration**

`database/migrations/2026_08_12_120000_add_locale_to_users_table.php` :

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('locale', 5)->default('fr')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('locale');
        });
    }
};
```

- [ ] **Step 5: Caster `locale` sur le modèle `User`**

Dans `app/Models/User.php`, ajouter l'import `use App\Enums\Locale;` à côté des autres imports `App\Enums\*`, puis dans `casts()` :

```php
protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => Role::class,
        'sex' => Sex::class,
        'locale' => Locale::class,
        'birth_date' => 'date',
        'height_cm' => 'integer',
        'initial_weight' => 'decimal:2',
    ];
}
```

- [ ] **Step 6: Défauts de la factory**

Dans `database/factories/UserFactory.php`, ajouter l'import `use App\Enums\Locale;`, puis dans `praticien()` :

```php
public function praticien(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => Role::Praticien,
        'locale' => Locale::Fr,
        'practitioner_id' => null,
        'birth_date' => null,
        'sex' => null,
        'goal' => null,
        'height_cm' => null,
        'initial_weight' => null,
    ]);
}
```

et dans `patient()` :

```php
public function patient(?User $practitioner = null): static
{
    return $this->state(fn (array $attributes) => [
        'role' => Role::Patient,
        'locale' => Locale::Ar,
        'practitioner_id' => $practitioner?->id ?? User::factory()->praticien(),
        'birth_date' => fake()->dateTimeBetween('-65 years', '-18 years'),
        'sex' => fake()->randomElement(Sex::cases()),
        'goal' => fake()->randomElement([
            "Retrouver de l'énergie au quotidien",
            'Améliorer mon sommeil',
            'Reprendre une activité physique en confiance',
            'Rééquilibrer mon transit',
        ]),
        'height_cm' => fake()->numberBetween(155, 190),
        'initial_weight' => fake()->randomFloat(2, 55, 95),
    ]);
}
```

- [ ] **Step 7: Défauts du seeder de démo**

Dans `database/seeders/DatabaseSeeder.php`, ajouter l'import `use App\Enums\Locale;`. Dans `run()`, sur la création du praticien :

```php
$practitioner = User::create([
    'name' => 'Dr Sami Ben Youssef',
    'email' => 'praticien@fithealth.tn',
    'password' => Hash::make('password'),
    'role' => Role::Praticien,
    'locale' => Locale::Fr,
]);
```

Dans `createPatient()` :

```php
private function createPatient(User $practitioner, array $attributes): User
{
    return User::create(array_merge([
        'password' => Hash::make('password'),
        'role' => Role::Patient,
        'locale' => Locale::Ar,
        'practitioner_id' => $practitioner->id,
    ], $attributes));
}
```

- [ ] **Step 8: Règle de défaut à la création d'un patient par le praticien**

Dans `app/Http/Requests/StorePatientRequest.php`, ajouter l'import `use App\Enums\Locale;` et la règle :

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8'],
        'phone' => ['nullable', 'string', 'max:255'],
        'birth_date' => ['nullable', 'date'],
        'sex' => ['nullable', new Enum(Sex::class)],
        'goal' => ['nullable', 'string', 'max:255'],
        'height_cm' => ['nullable', 'integer', 'min:1', 'max:300'],
        'initial_weight' => ['nullable', 'numeric', 'min:1', 'max:999'],
        'medical_background' => ['nullable', 'string', 'max:2000'],
        'current_treatments' => ['nullable', 'string', 'max:2000'],
        'locale' => ['nullable', new Enum(Locale::class)],
    ];
}
```

Dans `app/Http/Controllers/Praticien/PatientsController.php`, ajouter l'import `use App\Enums\Locale;` et modifier `store()` :

```php
public function store(StorePatientRequest $request): RedirectResponse
{
    /** @var User $practitioner */
    $practitioner = $request->user();

    User::create([
        ...$request->validated(),
        'password' => Hash::make($request->validated('password')),
        'role' => Role::Patient,
        'practitioner_id' => $practitioner->id,
        'locale' => $request->validated('locale') ?? Locale::Ar->value,
    ]);

    return back();
}
```

- [ ] **Step 9: Lancer les tests, vérifier qu'ils passent**

Run: `php artisan test --filter=LocaleTest`
Expected: PASS (6 tests).

- [ ] **Step 10: Commit**

```bash
git add app/Enums/Locale.php database/migrations/2026_08_12_120000_add_locale_to_users_table.php app/Models/User.php database/factories/UserFactory.php database/seeders/DatabaseSeeder.php app/Http/Requests/StorePatientRequest.php app/Http/Controllers/Praticien/PatientsController.php tests/Feature/LocaleTest.php
git commit -m "feat(i18n): add users.locale column with fr/ar enum and creation defaults"
```

---

### Task 2: Middleware `SetLocale`

**Files:**
- Create: `app/Http/Middleware/SetLocale.php`
- Modify: `bootstrap/app.php`
- Test: `tests/Feature/LocaleTest.php` (ajout de méthodes)

**Interfaces:**
- Consumes: `App\Enums\Locale` (Task 1).
- Produces: `App::getLocale()` reflète, sur chaque requête `web`, la locale du compte connecté ou la session pour un invité.

- [ ] **Step 1: Écrire les tests (échouent, le middleware n'existe pas encore)**

Ajouter à `tests/Feature/LocaleTest.php` :

```php
public function test_locale_par_defaut_est_fr_pour_un_invite(): void
{
    $this->get('/');

    $this->assertSame('fr', app()->getLocale());
}

public function test_locale_invite_suit_la_session(): void
{
    $this->withSession(['locale' => 'ar'])->get('/');

    $this->assertSame('ar', app()->getLocale());
}

public function test_locale_suit_le_compte_du_patient_connecte(): void
{
    $patient = User::factory()->patient()->create(['locale' => Locale::Ar]);

    $this->actingAs($patient)->get('/patient/dashboard');

    $this->assertSame('ar', app()->getLocale());
}
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent (ou passent par hasard)**

Run: `php artisan test --filter=LocaleTest`
Expected: le test `test_locale_invite_suit_la_session` et `test_locale_suit_le_compte_du_patient_connecte` échouent (`app()->getLocale()` reste sur la valeur de config, jamais `'ar'`).

- [ ] **Step 3: Créer le middleware**

`app/Http/Middleware/SetLocale.php` :

```php
<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->user()?->locale?->value
            ?? $request->session()->get('locale', Locale::Fr->value);

        App::setLocale($locale);

        return $next($request);
    }
}
```

- [ ] **Step 4: Enregistrer le middleware avant `HandleInertiaRequests`**

Dans `bootstrap/app.php`, remplacer :

```php
$middleware->web(append: [
    \App\Http\Middleware\HandleInertiaRequests::class,
]);
```

par :

```php
$middleware->web(append: [
    \App\Http\Middleware\SetLocale::class,
    \App\Http\Middleware\HandleInertiaRequests::class,
]);
```

- [ ] **Step 5: Lancer les tests, vérifier qu'ils passent**

Run: `php artisan test --filter=LocaleTest`
Expected: PASS (9 tests).

- [ ] **Step 6: Commit**

```bash
git add app/Http/Middleware/SetLocale.php bootstrap/app.php tests/Feature/LocaleTest.php
git commit -m "feat(i18n): resolve app locale from account or guest session"
```

---

### Task 3: Route et contrôleur pour changer de langue

**Files:**
- Create: `app/Http/Controllers/LocaleController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/LocaleTest.php` (ajout de méthodes)

**Interfaces:**
- Consumes: `App\Enums\Locale` (Task 1).
- Produces: route `POST /langue` (name `locale.update`), accessible invité et connecté.

- [ ] **Step 1: Écrire les tests (échouent, route 404)**

Ajouter à `tests/Feature/LocaleTest.php` :

```php
public function test_un_invite_peut_changer_la_langue_en_session(): void
{
    $this->post('/langue', ['locale' => 'ar'])->assertRedirect();

    $this->assertSame('ar', session('locale'));
}

public function test_un_patient_connecte_change_la_langue_sur_son_compte(): void
{
    $patient = User::factory()->patient()->create(['locale' => Locale::Fr]);

    $this->actingAs($patient)->post('/langue', ['locale' => 'ar'])->assertRedirect();

    $this->assertSame(Locale::Ar, $patient->fresh()->locale);
}

public function test_une_valeur_de_langue_invalide_est_rejetee(): void
{
    $this->post('/langue', ['locale' => 'es'])->assertSessionHasErrors('locale');
}
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent**

Run: `php artisan test --filter=LocaleTest`
Expected: FAIL (404 sur `/langue`).

- [ ] **Step 3: Créer le contrôleur**

`app/Http/Controllers/LocaleController.php` :

```php
<?php

namespace App\Http\Controllers;

use App\Enums\Locale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'locale' => ['required', Rule::enum(Locale::class)],
        ]);

        if ($user = $request->user()) {
            $user->update(['locale' => $data['locale']]);
        } else {
            $request->session()->put('locale', $data['locale']);
        }

        return back();
    }
}
```

- [ ] **Step 4: Ajouter la route**

Dans `routes/web.php`, ajouter l'import `use App\Http\Controllers\LocaleController;` en haut, puis juste après la route `home` :

```php
Route::get('/', fn () => Inertia::render('Public/Accueil'))->name('home');

Route::post('/langue', [LocaleController::class, 'update'])->name('locale.update');
```

- [ ] **Step 5: Lancer les tests, vérifier qu'ils passent**

Run: `php artisan test --filter=LocaleTest`
Expected: PASS (12 tests).

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/LocaleController.php routes/web.php tests/Feature/LocaleTest.php
git commit -m "feat(i18n): add POST /langue to switch locale for guest or account"
```

---

### Task 4: Dictionnaires de traduction + partage Inertia

**Files:**
- Create: `lang/fr.json`
- Create: `lang/ar.json`
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Modify: `.env.example`
- Test: `tests/Feature/LocaleTest.php` (ajout de méthodes)

**Interfaces:**
- Consumes: `App\Enums\Locale` (Task 1).
- Produces: props Inertia partagées `locale: { current, direction }` et `translations: Record<string, string>` sur **chaque** page — consommées par le hook `useTranslation()` (Task 6).

- [ ] **Step 1: Écrire les tests (échouent, props absentes)**

Ajouter à `tests/Feature/LocaleTest.php`, avec l'import `use Inertia\Testing\AssertableInertia as Assert;` en haut du fichier :

```php
public function test_les_props_inertia_exposent_la_locale_et_les_traductions_en_derja(): void
{
    $response = $this->withSession(['locale' => 'ar'])->get('/');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('locale.current', 'ar')
        ->where('locale.direction', 'rtl')
        ->where('translations.Sport', 'الرياضة')
    );
}

public function test_les_props_inertia_par_defaut_sont_en_francais(): void
{
    $response = $this->get('/');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('locale.current', 'fr')
        ->where('locale.direction', 'ltr')
        ->has('translations')
    );
}
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent**

Run: `php artisan test --filter=LocaleTest`
Expected: FAIL (props `locale`/`translations` absentes, ou fichier `lang/ar.json` introuvable).

- [ ] **Step 3: Créer `lang/fr.json`**

Le français est la langue "clé" : `__()`/`t()` retombent sur la clé elle-même quand aucune entrée n'existe. Ce fichier reste volontairement quasi vide, prêt à accueillir une entrée le jour où une clé a besoin d'un libellé différent de la phrase par défaut.

```json
{}
```

- [ ] **Step 4: Créer `lang/ar.json`**

Dictionnaire complet en derja tunisienne (écriture arabe) pour toutes les clés utilisées dans ce plan (tâches 7 à 12) :

```json
{
    "Accueil": "البداية",
    "Mon programme": "البرنامج متاعي",
    "Comment je vais": "كيفاش حالتي",
    "Messages": "الرسائل",
    "Se déconnecter": "الخروج",

    "Email": "الإيميل",
    "Mot de passe": "كلمة السر",
    "Se connecter": "دخول",
    "Email ou mot de passe incorrect.": "الإيميل أو كلمة السر غالطة.",

    "Bonjour, :name": "أهلا، :name",
    "Premier check-in à faire": "لازمك تعمل الشيك-إن الأول",
    "Check-in disponible": "الشيك-إن جاهز",
    "Prochain check-in demain": "الشيك-إن الجاي غدوة",
    "Prochain check-in dans :n jours": "باقي :n أيام للشيك-إن الجاي",
    "Aujourd'hui": "اليوم",
    "Rien de prévu aujourd'hui.": "ما فماش حاجة اليوم.",
    "Conseils": "نصايح",
    "Pas encore de conseils.": "ما فماش نصايح توا.",
    "Comment tu te sens aujourd'hui ?": "كيفاش حالتك اليوم؟",
    "Une question rapide, en quelques secondes.": "سؤال صغير، ياخذ برشة ثواني برك.",
    "Faire mon check-in": "اعمل الشيك-إن",

    "Mon programme de la semaine": "البرنامج متاعي لهاذي الجمعة",
    "Pas encore de programme.": "ما عندكش برنامج توا.",
    "Ton praticien va bientôt t'en créer un.": "الطبيب متاعك باش يعملك وحدة قريب.",
    "Sport": "الرياضة",
    "Alimentation": "الأكل",
    "Rien aujourd'hui.": "ما فماش حاجة اليوم.",
    "Jour de repos": "يوم راحة",
    "Rien de prévu — repose-toi.": "ما فماش حاجة — استريح شوية.",

    "Comment tu te sens ?": "كيفاش حالتك؟",
    "Énergie": "الطاقة",
    "Sommeil": "النوم",
    "Digestion": "الهضم",
    "Humeur": "المزاج",
    "Tu as fait ton programme ?": "عملت البرنامج متاعك؟",
    "Totalement": "بالكامل",
    "En partie": "نص بنص",
    "Peu": "قليل",
    "Une note pour ton praticien": "كلمة للطبيب متاعك",
    "(optionnel)": "(مش إجباري)",
    "Ce que tu veux dire…": "اكتب اللي تحب…",
    "Envoyer mon check-in": "إبعث الشيك-إن",

    "Naturopathe & coach": "طبيب طبيعي ومدرب",
    "Pas encore de message. Écris le premier !": "ما فماش رسائل توا. ابعث الأول!",
    "Écrire un message…": "اكتب رسالة…",

    "Lun": "الإثنين",
    "Mar": "الثلاثاء",
    "Mer": "الأربعاء",
    "Jeu": "الخميس",
    "Ven": "الجمعة",
    "Sam": "السبت",
    "Dim": "الأحد",
    "Lundi": "الإثنين",
    "Mardi": "الثلاثاء",
    "Mercredi": "الأربعاء",
    "Jeudi": "الخميس",
    "Vendredi": "الجمعة",
    "Samedi": "السبت",
    "Dimanche": "الأحد"
}
```

> ⚠️ Ces traductions derja sont rédigées par un assistant IA non-locuteur natif (voir spec, section "Contenu des traductions") — à faire relire par un locuteur natif avant un usage avec de vrais patients.

- [ ] **Step 5: Partager `locale` et `translations` via Inertia**

Remplacer le contenu de `app/Http/Middleware/HandleInertiaRequests.php` :

```php
<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = Locale::from(app()->getLocale());

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'role' => $request->user()->role->value,
                ] : null,
            ],
            'locale' => [
                'current' => $locale->value,
                'direction' => $locale->direction(),
            ],
            'translations' => json_decode(
                file_get_contents(lang_path($locale->value.'.json')),
                true
            ) ?? [],
        ];
    }
}
```

- [ ] **Step 6: Cohérence de la config locale**

Dans `.env.example`, remplacer :

```
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
```

par :

```
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
```

(`render.yaml` a déjà `fr` en production — ceci aligne l'environnement de référence pour les nouvelles installations locales. Le comportement réel de l'app ne dépend pas de cette valeur : `SetLocale`, Task 2, fixe toujours explicitement la locale.)

- [ ] **Step 7: Lancer les tests, vérifier qu'ils passent**

Run: `php artisan test --filter=LocaleTest`
Expected: PASS (14 tests).

- [ ] **Step 8: Commit**

```bash
git add lang/fr.json lang/ar.json app/Http/Middleware/HandleInertiaRequests.php .env.example tests/Feature/LocaleTest.php
git commit -m "feat(i18n): share locale and translations dictionary on every Inertia response"
```

---

### Task 5: Document HTML miroir (RTL) et police Cairo

**Files:**
- Modify: `resources/views/app.blade.php`
- Modify: `resources/css/app.css`
- Modify: `resources/js/app.jsx`
- Test: `tests/Feature/LocaleTest.php` (ajout de méthodes)

**Interfaces:**
- Consumes: `app()->getLocale()` (Task 2).
- Produces: `<html lang dir>` correct au premier chargement ET synchronisé à chaque navigation Inertia côté client.

- [ ] **Step 1: Écrire les tests (échouent, attributs absents)**

Ajouter à `tests/Feature/LocaleTest.php` :

```php
public function test_le_document_html_est_en_rtl_en_derja(): void
{
    $response = $this->withSession(['locale' => 'ar'])->get('/');

    $response->assertSee('dir="rtl"', false);
    $response->assertSee('lang="ar"', false);
}

public function test_le_document_html_est_en_ltr_en_francais(): void
{
    $response = $this->get('/');

    $response->assertSee('dir="ltr"', false);
    $response->assertSee('lang="fr"', false);
}
```

- [ ] **Step 2: Lancer les tests, vérifier qu'ils échouent**

Run: `php artisan test --filter=LocaleTest`
Expected: FAIL (`lang="fr"` codé en dur, pas de `dir`).

- [ ] **Step 3: Rendre `app.blade.php` sensible à la locale et ajouter Cairo**

Remplacer `resources/views/app.blade.php` :

```blade
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600;700&family=Cairo:wght@500;600;700&display=swap"
            rel="stylesheet"
        />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
```

- [ ] **Step 4: Basculer les tokens de police en RTL**

Dans `resources/css/app.css`, juste après le bloc `@theme { ... }` existant, ajouter :

```css
[dir='rtl'] {
    --font-display: 'Cairo', sans-serif;
    --font-sans: 'Cairo', sans-serif;
}
```

- [ ] **Step 5: Synchroniser `<html>` à chaque navigation Inertia côté client**

Remplacer `resources/js/app.jsx` :

```jsx
import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

function syncDocumentDirection(props) {
    const locale = props?.locale;

    if (!locale) return;

    document.documentElement.lang = locale.current;
    document.documentElement.dir = locale.direction;
}

router.on('navigate', (event) => {
    syncDocumentDirection(event.detail.page.props);
});

createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        syncDocumentDirection(props.initialPage.props);
        createRoot(el).render(<App {...props} />);
    },
});
```

- [ ] **Step 6: Lancer les tests, vérifier qu'ils passent**

Run: `php artisan test --filter=LocaleTest`
Expected: PASS (16 tests).

- [ ] **Step 7: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 8: Commit**

```bash
git add resources/views/app.blade.php resources/css/app.css resources/js/app.jsx tests/Feature/LocaleTest.php
git commit -m "feat(i18n): mirror document direction and switch to Cairo font in RTL"
```

---

### Task 6: Hook `useTranslation()` + composant `LanguageSwitcher`

**Files:**
- Create: `resources/js/i18n.js`
- Create: `resources/js/Components/LanguageSwitcher.jsx`

**Interfaces:**
- Consumes: props Inertia `locale`, `translations` (Task 4).
- Produces: `useTranslation()` → `{ t(key, params?), locale, direction }`, exporté depuis `resources/js/i18n.js` ; `<LanguageSwitcher tone="dark" | "light" />`, exporté depuis `resources/js/Components/LanguageSwitcher.jsx`.

- [ ] **Step 1: Créer le hook de traduction**

`resources/js/i18n.js` :

```js
import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations = {}, locale = { current: 'fr', direction: 'ltr' } } = usePage().props;

    function t(key, params = {}) {
        let text = translations[key] ?? key;

        for (const [name, value] of Object.entries(params)) {
            text = text.replaceAll(`:${name}`, value);
        }

        return text;
    }

    return { t, locale: locale.current, direction: locale.direction };
}
```

- [ ] **Step 2: Créer le sélecteur de langue**

`resources/js/Components/LanguageSwitcher.jsx` :

```jsx
import { router, usePage } from '@inertiajs/react';

export default function LanguageSwitcher({ tone = 'dark' }) {
    const { locale } = usePage().props;

    function switchTo(value) {
        if (value === locale.current) return;
        router.post('/langue', { locale: value }, { preserveScroll: true, preserveState: false });
    }

    const trackClass = tone === 'dark' ? 'bg-cream/10' : 'bg-sand/25';
    const inactiveTextClass = tone === 'dark' ? 'text-cream/70' : 'text-forest/60';

    return (
        <div className={'flex items-center gap-1 rounded-full p-1 text-xs font-bold ' + trackClass}>
            <button
                type="button"
                onClick={() => switchTo('fr')}
                className={'rounded-full px-2.5 py-1 ' + (locale.current === 'fr' ? 'bg-sage text-forest' : inactiveTextClass)}
            >
                FR
            </button>
            <button
                type="button"
                onClick={() => switchTo('ar')}
                className={'rounded-full px-2.5 py-1 ' + (locale.current === 'ar' ? 'bg-sage text-forest' : inactiveTextClass)}
            >
                عربي
            </button>
        </div>
    );
}
```

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur. (Ces deux fichiers ne sont pas encore utilisés ailleurs — c'est normal, ils sont branchés dans les tâches suivantes.)

- [ ] **Step 4: Commit**

```bash
git add resources/js/i18n.js resources/js/Components/LanguageSwitcher.jsx
git commit -m "feat(i18n): add useTranslation hook and language switcher component"
```

---

### Task 7: Page de connexion

**Files:**
- Modify: `resources/js/Pages/Auth/Login.jsx`
- Modify: `app/Http/Controllers/AuthController.php`

**Interfaces:**
- Consumes: `useTranslation()`, `<LanguageSwitcher />` (Task 6).

- [ ] **Step 1: Traduire le message d'erreur de connexion**

Dans `app/Http/Controllers/AuthController.php`, remplacer :

```php
throw ValidationException::withMessages([
    'email' => 'Ces identifiants ne correspondent à aucun compte.',
]);
```

par :

```php
throw ValidationException::withMessages([
    'email' => __('Email ou mot de passe incorrect.'),
]);
```

- [ ] **Step 2: Réécrire la page de connexion**

Remplacer `resources/js/Pages/Auth/Login.jsx` :

```jsx
import { Head, useForm } from '@inertiajs/react';
import LanguageSwitcher from '../../Components/LanguageSwitcher';
import { useTranslation } from '../../i18n';

export default function Login() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
            <Head title={t('Se connecter')} />

            <div className="w-full max-w-sm">
                <div className="mb-6 flex justify-center">
                    <LanguageSwitcher tone="light" />
                </div>

                <h1 className="mb-10 text-center font-display text-3xl text-forest">FitHealth</h1>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-forest">
                            {t('Email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                            className="w-full rounded border border-sand bg-white px-3 py-2 text-forest focus:outline-none focus:ring-2 focus:ring-sage"
                        />
                        {errors.email && <p className="mt-1 text-sm text-terracotta">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm text-forest">
                            {t('Mot de passe')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded border border-sand bg-white px-3 py-2 text-forest focus:outline-none focus:ring-2 focus:ring-sage"
                        />
                        {errors.password && <p className="mt-1 text-sm text-terracotta">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded bg-forest py-2 font-medium text-cream transition hover:opacity-90 disabled:opacity-50"
                    >
                        {t('Se connecter')}
                    </button>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 4: Vérification manuelle**

Run: `php artisan serve` (dans un terminal séparé), ouvrir `http://127.0.0.1:8000/login`.
- Le sélecteur FR / عربي est visible en haut du formulaire.
- Cliquer "عربي" : la page recharge en arabe, alignée à droite (RTL), champs "الإيميل" / "كلمة السر" / bouton "دخول".
- Se tromper de mot de passe : le message d'erreur s'affiche en arabe.
- Cliquer "FR" : retour en français, LTR.

- [ ] **Step 5: Commit**

```bash
git add resources/js/Pages/Auth/Login.jsx app/Http/Controllers/AuthController.php
git commit -m "feat(i18n): translate and mirror the login page"
```

---

### Task 8: Sidebar et layout patient

**Files:**
- Modify: `resources/js/Components/Patient/Sidebar.jsx`

**Interfaces:**
- Consumes: `useTranslation()`, `<LanguageSwitcher />` (Task 6).

- [ ] **Step 1: Réécrire la sidebar patient**

Remplacer `resources/js/Components/Patient/Sidebar.jsx` :

```jsx
import { Link, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, Heart, Home, LogOut, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher';

function initials(name) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth.user;
    const { post, processing } = useForm();
    const { t } = useTranslation();

    const navItems = [
        { label: t('Accueil'), href: '/patient/dashboard', icon: Home },
        { label: t('Mon programme'), href: '/patient/protocole', icon: ClipboardList },
        { label: t('Comment je vais'), href: '/patient/checkin', icon: Heart },
        { label: t('Messages'), href: '/patient/messages', icon: MessageSquare },
    ];

    function logout(e) {
        e.preventDefault();
        post('/logout');
    }

    return (
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-forest px-4 py-6">
            <div className="mb-5 ms-2 self-start whitespace-nowrap">
                <span className="font-display text-xl font-semibold text-white">FitHealth</span>
            </div>

            <div className="mb-4">
                <LanguageSwitcher tone="dark" />
            </div>

            <div className="mb-5 border-t border-cream/15" />

            <nav className="flex flex-1 flex-col gap-0.5">
                {navItems.map((item) => {
                    const active = url.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                'flex items-center gap-3 rounded-xl px-3 py-2.75 text-sm font-semibold whitespace-nowrap ' +
                                (active ? 'bg-sage text-forest' : 'text-cream/70 hover:bg-cream/10')
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <button
                type="button"
                onClick={logout}
                disabled={processing}
                className="mt-2 -mb-6 flex items-center gap-2.5 rounded-xl border-t border-cream/15 px-3 pt-3.5 pb-3.5 text-start"
            >
                <span className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-forest">
                    {initials(user.name)}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-cream">{user.name}</span>
                    <span className="flex items-center gap-1 text-xs text-cream/60">
                        <LogOut size={12} />
                        {t('Se déconnecter')}
                    </span>
                </span>
            </button>
        </aside>
    );
}
```

Note : `ml-2` devient `ms-2` (margin-inline-start) pour que le titre reste correctement placé en RTL. `PatientLayout.jsx` n'a pas besoin de changement — ses classes (`px-11`, `pt-9`, `pb-15`) sont déjà symétriques ou non-directionnelles.

- [ ] **Step 2: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 3: Vérification manuelle**

Se connecter en tant que `amina.trabelsi@example.com` / `password` (patiente seedée en derja par défaut après le Task 1 — au besoin, relancer `php artisan migrate:fresh --seed` en local).
- La sidebar est en arabe, alignée à droite, icônes à droite du texte.
- Basculer en FR via le sélecteur : sidebar repasse en français, alignée à gauche.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Components/Patient/Sidebar.jsx
git commit -m "feat(i18n): translate and mirror the patient sidebar"
```

---

### Task 9: Composant `ChecklistItem` + Dashboard patient

**Files:**
- Create: `resources/js/Components/Patient/ChecklistItem.jsx`
- Modify: `resources/js/Pages/Patient/Dashboard.jsx`
- Modify: `app/Http/Controllers/Patient/DashboardController.php`

**Interfaces:**
- Consumes: `useTranslation()` (Task 6).
- Produces: `<ChecklistItem icon label detail? done? onToggle? />` et `PILLAR_ICONS: { mouvement, nutrition }`, exportés depuis `resources/js/Components/Patient/ChecklistItem.jsx` — réutilisés en Task 10.
- Backend : `todayItems[].pillar` (`'mouvement' | 'nutrition'`) ajouté à la réponse Inertia du dashboard.

- [ ] **Step 1: Exposer le pilier de chaque item et traduire les libellés calculés**

Remplacer `app/Http/Controllers/Patient/DashboardController.php` :

```php
<?php

namespace App\Http\Controllers\Patient;

use App\Enums\Pillar;
use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $patient */
        $patient = $request->user();

        $protocol = $patient->activeProtocol()->with('items')->first();

        return Inertia::render('Patient/Dashboard', [
            'todayLabel' => ucfirst(Carbon::now()->locale(app()->getLocale())->translatedFormat('l j F Y')),
            'nextCheckIn' => $this->nextCheckInLabel($patient->latestCheckIn),
            'todayItems' => $protocol ? $this->todayItems($protocol) : [],
            'vitalite' => $patient->vitaliteItems()->orderByDesc('id')->get(['id', 'text']),
        ]);
    }

    private function nextCheckInLabel(?CheckIn $lastCheckIn): string
    {
        if (! $lastCheckIn) {
            return __('Premier check-in à faire');
        }

        $remaining = 7 - $lastCheckIn->submitted_at->diffInDays(now());

        if ($remaining <= 0) {
            return __('Check-in disponible');
        }

        return $remaining === 1
            ? __('Prochain check-in demain')
            : __('Prochain check-in dans :n jours', ['n' => $remaining]);
    }

    private function todayItems($protocol): array
    {
        $todayIso = today()->dayOfWeekIso;

        $todaysLogs = ProtocolLog::where('patient_id', $protocol->patient_id)
            ->where('logged_on', today()->toDateString())
            ->get()
            ->keyBy('protocol_item_id');

        return $protocol->items
            ->filter(fn (ProtocolItem $item) => in_array($item->pillar, [Pillar::Mouvement, Pillar::Nutrition], true)
                && ($item->day_of_week === null || $item->day_of_week === $todayIso))
            ->map(fn (ProtocolItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'detail' => $this->itemDetail($item),
                'pillar' => $item->pillar->value,
                'done' => (bool) ($todaysLogs->get($item->id)?->completed ?? false),
            ])
            ->values()
            ->all();
    }

    private function itemDetail(ProtocolItem $item): ?string
    {
        if ($item->notes) {
            return $item->notes;
        }

        if ($item->pillar === Pillar::Mouvement) {
            return $item->sets ? "{$item->sets} séries · {$item->reps}" : $item->reps;
        }

        return null;
    }
}
```

(Diffs : `'pillar' => $item->pillar->value,` ajouté, les 3 libellés de `nextCheckInLabel` passent par `__()`, `->locale('fr')` devient `->locale(app()->getLocale())`.)

- [ ] **Step 2: Créer le composant `ChecklistItem`**

`resources/js/Components/Patient/ChecklistItem.jsx` :

```jsx
import { Apple, Check, Dumbbell } from 'lucide-react';

export const PILLAR_ICONS = {
    mouvement: Dumbbell,
    nutrition: Apple,
};

function IconTile({ icon: Icon }) {
    return (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage/20">
            <Icon size={22} className="text-sage" strokeWidth={1.8} />
        </div>
    );
}

export default function ChecklistItem({ icon, label, detail, done = false, onToggle }) {
    const interactive = typeof onToggle === 'function';

    return (
        <div
            onClick={interactive ? onToggle : undefined}
            className={
                'flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-md shadow-forest/10 ' +
                (interactive ? 'cursor-pointer' : '')
            }
        >
            <IconTile icon={icon} />
            <div className="min-w-0 flex-1">
                <div className={'text-sm font-semibold ' + (done ? 'text-forest/40 line-through' : 'text-forest')}>{label}</div>
                {detail && <div className="text-xs text-forest/50">{detail}</div>}
            </div>
            {interactive && (
                <span
                    className={
                        'flex size-7 shrink-0 items-center justify-center rounded-full border-2 ' +
                        (done ? 'border-sage bg-sage' : 'border-sand bg-transparent')
                    }
                >
                    {done && <Check size={14} strokeWidth={3} className="text-cream" />}
                </span>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Réécrire le Dashboard patient**

Remplacer `resources/js/Pages/Patient/Dashboard.jsx` :

```jsx
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, SquareCheck } from 'lucide-react';
import ChecklistItem, { PILLAR_ICONS } from '../../Components/Patient/ChecklistItem';
import PatientLayout from '../../Layouts/PatientLayout';
import { useTranslation } from '../../i18n';

function CardIcon({ icon: Icon }) {
    return (
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-sage">
            <Icon size={19} className="text-cream" />
        </div>
    );
}

export default function Dashboard({ todayLabel, nextCheckIn, todayItems, vitalite }) {
    const firstName = usePage().props.auth.user.name.split(' ')[0];
    const { t } = useTranslation();

    function toggleItem(item) {
        router.post(`/patient/protocol-items/${item.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <PatientLayout title={t('Accueil')}>
            <div style={{ maxWidth: '1000px' }}>
                <div className="mb-7.5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display mb-1 text-2xl font-semibold text-forest">
                            {t('Bonjour, :name', { name: firstName })}
                        </h1>
                        <p className="text-sm text-forest/60">{todayLabel}</p>
                    </div>
                    <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">{nextCheckIn}</span>
                </div>

                <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                    <div className="rounded-2xl bg-white px-7 py-6.5 shadow-lg shadow-forest/20">
                        <div className="mb-4.5 flex items-center gap-3">
                            <CardIcon icon={SquareCheck} />
                            <h2 className="font-display text-lg font-semibold text-forest">{t("Aujourd'hui")}</h2>
                        </div>

                        {todayItems.length === 0 ? (
                            <p className="text-sm text-forest/60">{t('Rien de prévu aujourd\'hui.')}</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {todayItems.map((item) => (
                                    <ChecklistItem
                                        key={item.id}
                                        icon={PILLAR_ICONS[item.pillar]}
                                        label={item.title}
                                        detail={item.detail}
                                        done={item.done}
                                        onToggle={() => toggleItem(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white px-7 py-6.5 shadow-lg shadow-forest/20">
                        <div className="mb-4.5 flex items-center gap-3">
                            <CardIcon icon={Heart} />
                            <h2 className="font-display text-lg font-semibold text-forest">{t('Conseils')}</h2>
                        </div>

                        {vitalite.length === 0 ? (
                            <p className="text-sm text-forest/60">{t('Pas encore de conseils.')}</p>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {vitalite.map((item) => (
                                    <ChecklistItem key={item.id} icon={Heart} label={item.text} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-forest px-8 py-7.5">
                    <div>
                        <h2 className="font-display mb-1.5 text-lg font-semibold text-cream">
                            {t('Comment tu te sens aujourd\'hui ?')}
                        </h2>
                        <p className="text-sm text-cream/70" style={{ maxWidth: '44ch' }}>
                            {t('Une question rapide, en quelques secondes.')}
                        </p>
                    </div>
                    <Link
                        href="/patient/checkin"
                        className="rounded-xl bg-sage px-6.5 py-3.25 text-sm font-semibold whitespace-nowrap text-forest hover:opacity-90"
                    >
                        {t('Faire mon check-in')}
                    </Link>
                </div>
            </div>
        </PatientLayout>
    );
}
```

- [ ] **Step 4: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS (tous les tests, y compris `LocaleTest` et `PatientIsolationTest`).

- [ ] **Step 5: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 6: Vérification manuelle**

`http://127.0.0.1:8000/patient/dashboard` connecté en tant qu'Amina (derja par défaut) :
- Les items du jour s'affichent en cartes icône (haltère pour mouvement, pomme pour nutrition), cochables.
- Les conseils de vitalité s'affichent avec une icône cœur, sans case à cocher.
- Le texte "Prochain check-in dans :n jours" (ou équivalent) s'affiche correctement en arabe avec le bon nombre.
- Basculer en FR : mêmes cartes, en français, alignées à gauche.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/Patient/DashboardController.php resources/js/Components/Patient/ChecklistItem.jsx resources/js/Pages/Patient/Dashboard.jsx
git commit -m "feat(i18n): translate patient dashboard and switch to icon-first checklist"
```

---

### Task 10: Page Protocole (programme de la semaine)

**Files:**
- Modify: `app/Services/WeekPlanBuilder.php`
- Modify: `resources/js/Pages/Patient/Protocole/Index.jsx`

**Interfaces:**
- Consumes: `ChecklistItem`, `PILLAR_ICONS` non utilisé ici (icône fixe par colonne) (Task 9), `useTranslation()` (Task 6).
- Produces: `WeekPlanBuilder::build()` retourne des libellés de jour traduits selon `app()->getLocale()` — consommé aussi par `Praticien\PatientsController@show` (aucun changement de comportement visible côté praticien tant que sa locale reste `fr`).

- [ ] **Step 1: Rendre les libellés de jour sensibles à la locale**

Remplacer `app/Services/WeekPlanBuilder.php` :

```php
<?php

namespace App\Services;

use App\Enums\Pillar;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;

class WeekPlanBuilder
{
    /**
     * Planning des 7 jours de la semaine en cours (lundi à dimanche), avec
     * pour chaque jour les items prévus (datés sur ce jour, ou permanents)
     * et si un log complété existe pour ce jour précis. Partagé entre
     * l'onglet Suivi du praticien et la page Protocole du patient.
     */
    public function build(Protocol $protocol): array
    {
        $weekStart = now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        $completedLogKeys = ProtocolLog::where('patient_id', $protocol->patient_id)
            ->where('completed', true)
            ->whereBetween('logged_on', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get()
            ->map(fn (ProtocolLog $log) => $log->protocol_item_id.'|'.$log->logged_on->toDateString())
            ->flip();

        $dayLabels = $this->dayLabels();
        $fullDayLabels = $this->fullDayLabels();

        $days = [];

        for ($i = 0; $i < 7; $i++) {
            $date = $weekStart->copy()->addDays($i);
            $iso = $date->dayOfWeekIso;

            $dayItems = $protocol->items->filter(
                fn (ProtocolItem $item) => $item->day_of_week === null || $item->day_of_week === $iso
            );

            $mapItem = fn (ProtocolItem $item) => [
                'id' => $item->id,
                'text' => $item->title,
                'done' => $completedLogKeys->has($item->id.'|'.$date->toDateString()),
            ];

            $days[] = [
                'day' => $dayLabels[$iso],
                'fullDay' => $fullDayLabels[$iso],
                'date' => $date->toDateString(),
                'sport' => $dayItems->where('pillar', Pillar::Mouvement)->map($mapItem)->values()->all(),
                'nutrition' => $dayItems->where('pillar', Pillar::Nutrition)->map($mapItem)->values()->all(),
            ];
        }

        return $days;
    }

    /**
     * @return array<int, string>
     */
    private function dayLabels(): array
    {
        return [
            1 => __('Lun'), 2 => __('Mar'), 3 => __('Mer'), 4 => __('Jeu'),
            5 => __('Ven'), 6 => __('Sam'), 7 => __('Dim'),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function fullDayLabels(): array
    {
        return [
            1 => __('Lundi'), 2 => __('Mardi'), 3 => __('Mercredi'), 4 => __('Jeudi'),
            5 => __('Vendredi'), 6 => __('Samedi'), 7 => __('Dimanche'),
        ];
    }
}
```

- [ ] **Step 2: Réécrire la page Protocole**

Remplacer `resources/js/Pages/Patient/Protocole/Index.jsx` :

```jsx
import { router } from '@inertiajs/react';
import { Apple, Dumbbell, Moon } from 'lucide-react';
import { useState } from 'react';
import ChecklistItem from '../../../Components/Patient/ChecklistItem';
import PatientLayout from '../../../Layouts/PatientLayout';
import { useTranslation } from '../../../i18n';

function dayIsCompleted(day) {
    const all = [...day.sport, ...day.nutrition];
    return all.length > 0 && all.every((item) => item.done);
}

function DayButton({ day, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            style={{ borderRadius: '14px' }}
            className={
                'flex min-w-19.5 flex-col items-center gap-1.5 px-4.5 py-3.5 ' +
                (selected ? 'bg-forest text-cream shadow-lg shadow-forest/30' : 'bg-white text-forest shadow-md shadow-forest/15')
            }
        >
            <span className="text-sm font-bold">{day.day}</span>
            <span className={'size-1.5 rounded-full ' + (dayIsCompleted(day) ? 'bg-sage' : 'bg-transparent')} />
        </button>
    );
}

function ColumnHeader({ icon: Icon, label }) {
    return (
        <div className="mb-3.5 flex items-center gap-2.5">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-sage">
                <Icon size={16} className="text-cream" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-forest/60 uppercase">{label}</h3>
        </div>
    );
}

function RestDayState({ t }) {
    return (
        <div className="px-2.5 py-7.5 text-center">
            <div className="mx-auto mb-3.5 flex size-11.5 items-center justify-center rounded-full bg-sand/30">
                <Moon size={22} className="text-sage" />
            </div>
            <p className="mb-1 text-base font-semibold text-forest">{t('Jour de repos')}</p>
            <p className="text-sm text-forest/60">{t('Rien de prévu — repose-toi.')}</p>
        </div>
    );
}

export default function ProtocoleIndex({ weekPlan }) {
    const todayIndex = (new Date().getDay() + 6) % 7;
    const [selected, setSelected] = useState(weekPlan.length > 0 ? todayIndex : 0);
    const { t } = useTranslation();

    function toggle(item, date) {
        router.post(`/patient/protocol-items/${item.id}/toggle`, { date }, { preserveScroll: true });
    }

    return (
        <PatientLayout title={t('Mon programme')}>
            <div style={{ maxWidth: '900px' }}>
                <h1 className="font-display mb-6.5 text-2xl font-semibold text-forest">{t('Mon programme de la semaine')}</h1>

                {weekPlan.length === 0 ? (
                    <div className="rounded-2xl bg-white px-6 py-16 text-center">
                        <p className="mb-1 text-base font-semibold text-forest">{t('Pas encore de programme.')}</p>
                        <p className="text-sm text-forest/60">{t("Ton praticien va bientôt t'en créer un.")}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-7.5 flex flex-wrap gap-2.5">
                            {weekPlan.map((day, i) => (
                                <DayButton key={day.date} day={day} selected={i === selected} onSelect={() => setSelected(i)} />
                            ))}
                        </div>

                        <div style={{ borderRadius: '18px' }} className="bg-white px-8 py-7.5 shadow-lg shadow-forest/20">
                            <h2 className="font-display mb-5 text-lg font-semibold text-forest">{weekPlan[selected].fullDay}</h2>

                            {weekPlan[selected].sport.length === 0 && weekPlan[selected].nutrition.length === 0 ? (
                                <RestDayState t={t} />
                            ) : (
                                <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="border-e border-sand/30 pe-8">
                                        <ColumnHeader icon={Dumbbell} label={t('Sport')} />
                                        {weekPlan[selected].sport.length === 0 ? (
                                            <p className="text-sm text-forest/40">{t('Rien aujourd\'hui.')}</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].sport.map((item) => (
                                                    <ChecklistItem
                                                        key={item.id}
                                                        icon={Dumbbell}
                                                        label={item.text}
                                                        done={item.done}
                                                        onToggle={() => toggle(item, weekPlan[selected].date)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <ColumnHeader icon={Apple} label={t('Alimentation')} />
                                        {weekPlan[selected].nutrition.length === 0 ? (
                                            <p className="text-sm text-forest/40">{t('Rien aujourd\'hui.')}</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {weekPlan[selected].nutrition.map((item) => (
                                                    <ChecklistItem
                                                        key={item.id}
                                                        icon={Apple}
                                                        label={item.text}
                                                        done={item.done}
                                                        onToggle={() => toggle(item, weekPlan[selected].date)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PatientLayout>
    );
}
```

Note : la colonne "Alimentation" utilise désormais l'icône `Apple` (au lieu de `Heart`), cohérent avec `PILLAR_ICONS.nutrition` du Dashboard (Task 9) — `Heart` reste réservé aux conseils de vitalité.

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/patient/protocole` connecté en tant qu'Amina :
- Les jours de la semaine s'affichent en arabe (noms complets : الإثنين, الثلاثاء...).
- La colonne "sport"/"nutrition" est à droite en RTL (border-e/pe-8 bascule correctement de côté).
- Cocher un item fonctionne, coche visible.
- Basculer en FR : jours en français, colonnes à gauche.

- [ ] **Step 6: Commit**

```bash
git add app/Services/WeekPlanBuilder.php resources/js/Pages/Patient/Protocole/Index.jsx
git commit -m "feat(i18n): translate week plan days and mirror the protocole page"
```

---

### Task 11: Page Check-in

**Files:**
- Modify: `app/Http/Controllers/Patient/CheckInController.php`
- Modify: `resources/js/Pages/Patient/CheckIn/Index.jsx`

**Interfaces:**
- Consumes: `useTranslation()` (Task 6).

- [ ] **Step 1: Rendre `todayLabel` sensible à la locale**

Dans `app/Http/Controllers/Patient/CheckInController.php`, méthode `create()`, remplacer :

```php
public function create(): Response
{
    return Inertia::render('Patient/CheckIn/Index', [
        'todayLabel' => ucfirst(now()->locale('fr')->translatedFormat('l j F Y')),
    ]);
}
```

par :

```php
public function create(): Response
{
    return Inertia::render('Patient/CheckIn/Index', [
        'todayLabel' => ucfirst(now()->locale(app()->getLocale())->translatedFormat('l j F Y')),
    ]);
}
```

- [ ] **Step 2: Réécrire la page Check-in**

Remplacer `resources/js/Pages/Patient/CheckIn/Index.jsx` :

```jsx
import { useForm } from '@inertiajs/react';
import PatientLayout from '../../../Layouts/PatientLayout';
import { useTranslation } from '../../../i18n';

const SLIDER_KEYS = ['energy', 'sleep', 'digestion', 'mood'];

const ADHERENCE_KEYS = ['totalement', 'partiellement', 'peu'];

export default function CheckInIndex({ todayLabel }) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({
        energy: 6,
        sleep: 5,
        digestion: 7,
        mood: 6,
        adherence: 'totalement',
        note: '',
    });

    const sliderLabels = {
        energy: t('Énergie'),
        sleep: t('Sommeil'),
        digestion: t('Digestion'),
        mood: t('Humeur'),
    };

    const adherenceLabels = {
        totalement: t('Totalement'),
        partiellement: t('En partie'),
        peu: t('Peu'),
    };

    function submit(e) {
        e.preventDefault();
        post('/patient/checkin');
    }

    return (
        <PatientLayout title={t('Comment je vais')}>
            <div className="flex justify-center">
                <form onSubmit={submit} style={{ width: '100%', maxWidth: '480px' }}>
                    <h1 style={{ fontSize: '26px' }} className="font-display mb-2 text-center font-semibold text-forest">
                        {t('Comment tu te sens ?')}
                    </h1>
                    <p className="mb-9 text-center text-sm text-forest/60">{todayLabel}</p>

                    <div style={{ borderRadius: '18px' }} className="mb-5 bg-white px-8 py-7.5 shadow-lg shadow-forest/22">
                        {SLIDER_KEYS.map((key) => (
                            <div key={key} className="mb-6.5">
                                <div className="mb-2.5 flex items-baseline justify-between">
                                    <label style={{ fontSize: '15px' }} className="font-semibold text-forest">
                                        {sliderLabels[key]}
                                    </label>
                                    <span style={{ fontSize: '22px' }} className="font-display font-semibold text-forest tabular-nums">
                                        {data[key]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={data[key]}
                                    onChange={(e) => setData(key, Number(e.target.value))}
                                    className="range-slider w-full"
                                />
                            </div>
                        ))}

                        <div className="mb-5.5">
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                {t('Tu as fait ton programme ?')}
                            </label>
                            <div className="flex gap-2">
                                {ADHERENCE_KEYS.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setData('adherence', key)}
                                        style={{ borderRadius: '10px', fontSize: '13.5px' }}
                                        className={
                                            'flex-1 border-none py-2.75 px-2 font-semibold ' +
                                            (data.adherence === key ? 'bg-forest text-cream' : 'bg-sand/30 text-forest')
                                        }
                                    >
                                        {adherenceLabels[key]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '15px' }} className="mb-2.5 block font-semibold text-forest">
                                {t('Une note pour ton praticien')} <span className="font-normal text-forest/50">{t('(optionnel)')}</span>
                            </label>
                            <textarea
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                placeholder={t('Ce que tu veux dire…')}
                                style={{ borderWidth: '1.5px', borderRadius: '12px', fontSize: '14.5px' }}
                                className="min-h-20 w-full resize-y border-sand bg-cream px-3.5 py-3 text-forest"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="w-full rounded bg-forest py-4 text-base font-semibold text-cream">
                        {t('Envoyer mon check-in')}
                    </button>
                </form>
            </div>
        </PatientLayout>
    );
}
```

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/patient/checkin` connecté en tant qu'Amina :
- Curseurs et libellés en arabe, options d'observance traduites.
- Soumettre un check-in fonctionne toujours (redirige vers le dashboard).
- Basculer en FR : mêmes éléments en français.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Patient/CheckInController.php resources/js/Pages/Patient/CheckIn/Index.jsx
git commit -m "feat(i18n): translate the check-in page"
```

---

### Task 12: Page Messages

**Files:**
- Modify: `resources/js/Pages/Patient/Messages/Index.jsx`
- Modify: `app/Http/Controllers/Patient/MessageController.php`

**Interfaces:**
- Consumes: `useTranslation()` (Task 6).

- [ ] **Step 1: Rendre le séparateur de date sensible à la locale**

Dans `app/Http/Controllers/Patient/MessageController.php`, méthode `groupByDate()`, remplacer :

```php
'label' => $message->created_at->locale('fr')->translatedFormat('d F'),
```

par :

```php
'label' => $message->created_at->locale(app()->getLocale())->translatedFormat('d F'),
```

- [ ] **Step 2: Réécrire la page Messages**

Remplacer `resources/js/Pages/Patient/Messages/Index.jsx` :

```jsx
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import PatientLayout from '../../../Layouts/PatientLayout';
import { useTranslation } from '../../../i18n';

function DateSeparator({ label }) {
    return (
        <div style={{ fontSize: '12px' }} className="mt-4 mb-2.5 text-center text-forest/50">
            {label}
        </div>
    );
}

function MessageBubble({ fromPatient, text }) {
    return (
        <div className={'mb-1 flex ' + (fromPatient ? 'justify-end' : 'justify-start')}>
            <div
                style={{ maxWidth: '68%', fontSize: '14.5px', borderWidth: '1.5px' }}
                className={
                    'rounded-2xl px-4 py-3 leading-normal ' +
                    (fromPatient ? 'border-none bg-forest text-cream' : 'border-sand bg-white text-forest')
                }
            >
                {text}
            </div>
        </div>
    );
}

function Composer({ t }) {
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    function submit(e) {
        e.preventDefault();
        post('/patient/messages', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit} className="flex shrink-0 gap-2.5 border-t border-sand/35 py-5">
            <input
                type="text"
                placeholder={t('Écrire un message…')}
                value={data.body}
                onChange={(e) => setData('body', e.target.value)}
                style={{ borderWidth: '1.5px', fontSize: '14.5px' }}
                className="flex-1 rounded-full border-sand bg-white px-4.5 py-3 text-forest placeholder:text-forest/40"
            />
            <button
                type="submit"
                disabled={processing || !data.body}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage disabled:opacity-50"
            >
                <Send size={18} strokeWidth={1.7} className="text-forest" />
            </button>
        </form>
    );
}

export default function MessagesIndex({ practitioner, messages }) {
    const { t } = useTranslation();

    return (
        <PatientLayout title={t('Messages')}>
            <div className="-mt-6 -mb-16 flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center gap-3.5 border-b border-sand/35 pb-5.5">
                    <div
                        style={{ fontSize: '15px' }}
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-bold text-cream"
                    >
                        {practitioner.initials}
                    </div>
                    <div>
                        <div style={{ fontSize: '15.5px' }} className="font-semibold text-forest">
                            {practitioner.name}
                        </div>
                        <div style={{ fontSize: '12.5px' }} className="text-sage">
                            {t('Naturopathe & coach')}
                        </div>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-7">
                    {messages.length === 0 && (
                        <div className="flex h-full items-center justify-center text-center">
                            <p className="text-sm text-forest/60">{t('Pas encore de message. Écris le premier !')}</p>
                        </div>
                    )}

                    {messages.map((m, i) =>
                        m.isDateSeparator ? (
                            <DateSeparator key={`sep-${i}`} label={m.label} />
                        ) : (
                            <MessageBubble key={m.id} fromPatient={m.fromPatient} text={m.text} />
                        ),
                    )}
                </div>

                <Composer t={t} />
            </div>
        </PatientLayout>
    );
}
```

- [ ] **Step 3: Lancer la suite backend, vérifier qu'elle passe toujours**

Run: `php artisan test`
Expected: PASS.

- [ ] **Step 4: Build frontend, vérifier qu'il n'y a pas d'erreur**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 5: Vérification manuelle**

`http://127.0.0.1:8000/patient/messages` connecté en tant qu'Amina :
- Le fil de discussion s'affiche en arabe, bulles bien alignées (patient à droite ou gauche selon la convention RTL adoptée par le composant existant — vérifier que ça reste lisible).
- Le séparateur de date affiche une date en arabe.
- Envoyer un message fonctionne.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Patient/MessageController.php resources/js/Pages/Patient/Messages/Index.jsx
git commit -m "feat(i18n): translate the messages page and localize date separators"
```

---

### Task 13: Vérification finale bilingue + régression praticien

**Files:** aucun (tâche de vérification et de clôture).

- [ ] **Step 1: Réinitialiser et reseeder la base locale**

Run: `php artisan migrate:fresh --seed`
Expected: migrations + seed OK, aucune erreur (le seeder crée maintenant les patients en `locale=ar` et le praticien en `locale=fr`).

- [ ] **Step 2: Lancer toute la suite de tests backend**

Run: `php artisan test`
Expected: PASS, tous les tests (y compris `PatientIsolationTest` et `LocaleTest`).

- [ ] **Step 3: Build de production frontend**

Run: `npm run build`
Expected: build réussi, 0 erreur.

- [ ] **Step 4: Parcours patient complet en derja**

Démarrer `php artisan serve`, se connecter en tant que `amina.trabelsi@example.com` / `password` :
- [ ] Dashboard : cartes icône, texte arabe, RTL correct.
- [ ] Mon programme : jours de la semaine en arabe, cocher un item fonctionne.
- [ ] Comment je vais (check-in) : curseurs traduits, soumission fonctionne.
- [ ] Messages : fil traduit, envoi fonctionne.
- [ ] Sidebar : tous les libellés traduits, déconnexion fonctionne.

- [ ] **Step 5: Bascule de langue en cours de session**

Sur le dashboard patient, cliquer "FR" dans le sélecteur :
- [ ] Toutes les pages repassent en français, LTR, sans avoir à se reconnecter.
- [ ] Se déconnecter puis se reconnecter : la langue choisie est mémorisée (persistée sur le compte).

- [ ] **Step 6: Non-régression côté praticien**

Se connecter en tant que `praticien@fithealth.tn` / `password` :
- [ ] Dashboard praticien, liste patients, fiche patient, messagerie, protocoles : identiques à avant (aucun fichier `Praticien/*` n'a été modifié), toujours en français, LTR.
- [ ] La fiche d'un patient (ex. Amina) affiche toujours correctement son plan de semaine (`WeekPlanBuilder` modifié en Task 10, mais le praticien reste en `fr` donc aucun changement visible).

- [ ] **Step 7: Page publique non affectée dans son contenu, mais reçoit bien le mécanisme global**

Ouvrir `/` en étant déconnecté, cliquer sur le sélecteur de langue s'il est visible (sinon, poster manuellement `POST /langue` avec `locale=ar` via les devtools) :
- [ ] La page ne plante pas ; le contenu de `Public/Accueil.jsx` reste en français (non traduit, hors scope), mais le document passe bien en `dir="rtl"` — confirme que l'infrastructure est saine pour le sous-projet 3 à venir.

- [ ] **Step 8: Commit final (si des ajustements ont été faits pendant la vérification)**

```bash
git add -A
git commit -m "chore(i18n): final QA pass for patient i18n/RTL sub-project"
```

(Si aucun ajustement n'a été nécessaire, ce commit est à sauter.)

- [ ] **Step 9: Marquer le sous-projet comme terminé**

Mettre à jour le spec (`docs/superpowers/specs/2026-08-12-patient-i18n-rtl-redesign-design.md`) n'est pas nécessaire — le plan et son historique de commits en sont la trace. Les sous-projets 2 (espace praticien) et 3 (site public) suivront le même cycle spec → plan → implémentation, en réutilisant telle quelle l'infrastructure posée ici (`Locale`, `SetLocale`, `LocaleController`, `useTranslation`, `LanguageSwitcher`, tokens de police RTL).
