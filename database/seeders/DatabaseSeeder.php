<?php

namespace Database\Seeders;

use App\Enums\Adherence;
use App\Enums\Pillar;
use App\Enums\ProtocolStatus;
use App\Enums\Role;
use App\Enums\Sex;
use App\Models\CheckIn;
use App\Models\Message;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;
use App\Models\ProtocolTemplate;
use App\Models\User;
use App\Models\VitaliteItem;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private Carbon $windowStart;

    public function run(): void
    {
        $this->windowStart = today()->subDays(21);

        $practitioner = User::create([
            'name' => 'Dr Sami Ben Youssef',
            'email' => 'praticien@fithealth.tn',
            'password' => Hash::make('password'),
            'role' => Role::Praticien,
        ]);

        $amina = $this->createPatient($practitioner, [
            'name' => 'Amina Trabelsi',
            'email' => 'amina.trabelsi@example.com',
            'sex' => Sex::Femme,
            'birth_date' => '1990-05-14',
            'goal' => "Retrouver de l'énergie au quotidien",
            'height_cm' => 162,
            'initial_weight' => 68.50,
            'medical_background' => "Hypothyroïdie diagnostiquée en 2019, sous surveillance biologique régulière. Pas d'allergie alimentaire connue.",
            'current_treatments' => 'Lévothyroxine 50µg le matin à jeun.',
        ]);

        $karim = $this->createPatient($practitioner, [
            'name' => 'Karim Bouazizi',
            'email' => 'karim.bouazizi@example.com',
            'sex' => Sex::Homme,
            'birth_date' => '1985-11-02',
            'goal' => 'Reprendre une activité physique en confiance',
            'height_cm' => 178,
            'initial_weight' => 92.00,
            'medical_background' => 'Ancienne tendinite au genou droit (2022), résolue depuis. Léger surpoids.',
            'current_treatments' => 'Aucun traitement en cours.',
        ]);

        $salma = $this->createPatient($practitioner, [
            'name' => 'Salma Gharbi',
            'email' => 'salma.gharbi@example.com',
            'sex' => Sex::Femme,
            'birth_date' => '1993-03-22',
            'goal' => 'Rééquilibrer mon transit',
            'height_cm' => 165,
            'initial_weight' => 61.20,
            'medical_background' => "Syndrome de l'intestin irritable diagnostiqué par un gastro-entérologue. Intolérance au lactose.",
            'current_treatments' => 'Probiotiques en cure ponctuelle, antispasmodique (Spasfon) si besoin.',
        ]);

        $youssef = $this->createPatient($practitioner, [
            'name' => 'Youssef Mansouri',
            'email' => 'youssef.mansouri@example.com',
            'sex' => Sex::Homme,
            'birth_date' => '1980-07-09',
            'goal' => 'Retrouver un sommeil réparateur',
            'height_cm' => 175,
            'initial_weight' => 88.30,
            'medical_background' => 'Apnée du sommeil légère suspectée, pas encore explorée. Stress professionnel important.',
            'current_treatments' => 'Mélatonine en automédication occasionnelle.',
        ]);

        $nour = $this->createPatient($practitioner, [
            'name' => 'Nour Chaabane',
            'email' => 'nour.chaabane@example.com',
            'sex' => Sex::Femme,
            'birth_date' => '1988-01-30',
            'goal' => 'Stabiliser mon poids durablement',
            'height_cm' => 160,
            'initial_weight' => 71.00,
            'medical_background' => 'Antécédent de diabète gestationnel (2021), aucun diabète depuis. RAS par ailleurs.',
            'current_treatments' => 'Aucun traitement en cours.',
        ]);

        // Patient sans aucune donnée : vient de s'inscrire, sert à tester l'état vide.
        $this->createPatient($practitioner, [
            'name' => 'Mehdi Jlassi',
            'email' => 'mehdi.jlassi@example.com',
            'sex' => Sex::Homme,
            'birth_date' => '1995-09-18',
            'goal' => 'Faire un bilan complet avant de me lancer',
            'height_cm' => 180,
            'initial_weight' => 84.00,
            'medical_background' => 'Hypertension légère sous contrôle. Père diabétique (antécédent familial).',
            'current_treatments' => 'Amlodipine 5mg par jour.',
        ]);

        // Amina : assidue (~90%)
        $this->buildProtocolWithLogs($amina, 'Reprise en douceur — phase 1', fn (int $occurrence) => $occurrence % 10 !== 0);
        $this->createCheckIns($amina, [
            ['days' => 6, 'energy' => 8, 'sleep' => 7, 'digestion' => 8, 'mood' => 8, 'adherence' => Adherence::Totalement, 'weight' => 67.80],
            ['days' => 13, 'energy' => 8, 'sleep' => 8, 'digestion' => 8, 'mood' => 9, 'adherence' => Adherence::Totalement, 'weight' => null],
            ['days' => 20, 'energy' => 9, 'sleep' => 8, 'digestion' => 8, 'mood' => 9, 'adherence' => Adherence::Totalement, 'weight' => 66.90],
            ['days' => 21, 'energy' => 9, 'sleep' => 8, 'digestion' => 9, 'mood' => 9, 'adherence' => Adherence::Totalement, 'weight' => null],
        ]);
        $this->createConversation($practitioner, $amina, [
            [3, 'patient', 'Bonjour Docteur, je voulais vous dire que je me sens vraiment mieux depuis le début du protocole, merci !', true],
            [3, 'praticien', 'Ravi de l’entendre Amina, continuez comme ça, on fait le point à la prochaine consultation.', true],
            [15, 'patient', 'Petite question : je peux remplacer la marche par du vélo certains jours ?', true],
            [15, 'praticien', "Oui sans problème, l'important est de garder la régularité.", false],
        ]);
        $this->createVitaliteItems($amina, [
            'Se coucher avant 22h30',
            "Faire une pause de 10 minutes sans écran l'après-midi",
        ]);

        // Karim : irrégulier (~55%)
        $this->buildProtocolWithLogs($karim, 'Retour au mouvement — en douceur', fn (int $occurrence) => $occurrence % 9 < 5);
        $this->createCheckIns($karim, [
            ['days' => 6, 'energy' => 6, 'sleep' => 5, 'digestion' => 6, 'mood' => 5, 'adherence' => Adherence::Partiellement, 'weight' => 91.40],
            ['days' => 19, 'energy' => 5, 'sleep' => 6, 'digestion' => 5, 'mood' => 5, 'adherence' => Adherence::Partiellement, 'weight' => null],
        ]);
        $this->createConversation($practitioner, $karim, [
            [8, 'patient', "Désolé, j'ai raté plusieurs séances cette semaine, le travail a été intense.", true],
            [9, 'praticien', 'Pas de souci Karim, on ajuste le rythme si besoin. Qu’est-ce qui vous bloque le plus ?', false],
        ]);
        $this->createVitaliteItems($karim, [
            "Prévoir un temps de récupération après l'effort",
            'Limiter les écrans après 21h',
        ]);

        // Salma : décrochante — forte semaine 1, quasi nulle ensuite
        $this->buildProtocolWithLogs($salma, 'Rééquilibrage digestif', function (int $occurrence, Carbon $date) {
            if ($date->lt($this->windowStart->copy()->addDays(7))) {
                return $occurrence % 10 !== 0;
            }

            return $occurrence < 30; // les tout premiers jours de la semaine 2, puis plus rien
        });
        $this->createCheckIns($salma, [
            ['days' => 5, 'energy' => 7, 'sleep' => 7, 'digestion' => 8, 'mood' => 8, 'adherence' => Adherence::Totalement, 'weight' => 60.90],
            ['days' => 16, 'energy' => 4, 'sleep' => 4, 'digestion' => 5, 'mood' => 3, 'adherence' => Adherence::Peu, 'weight' => null, 'note' => 'Moins de motivation ces derniers temps, période chargée au travail.'],
        ]);
        $this->createConversation($practitioner, $salma, [
            [5, 'patient', 'Première semaine plutôt bien suivie, je sens déjà une différence sur les ballonnements.', true],
            [6, 'praticien', 'Excellent début Salma, on garde ce cap.', true],
            [17, 'patient', "J'ai beaucoup de mal à suivre le protocole ces deux dernières semaines, désolée.", false],
        ]);
        $this->createVitaliteItems($salma, [
            'Manger dans le calme, sans stress',
            'Éviter les produits laitiers',
        ]);

        // Youssef : check-in en retard (dernier > 10 jours)
        $this->buildProtocolWithLogs($youssef, 'Retrouver un sommeil réparateur', fn (int $occurrence) => $occurrence % 5 < 3);
        $this->createCheckIns($youssef, [
            ['days' => 2, 'energy' => 5, 'sleep' => 4, 'digestion' => 6, 'mood' => 5, 'adherence' => Adherence::Partiellement, 'weight' => 87.90],
            ['days' => 9, 'energy' => 5, 'sleep' => 5, 'digestion' => 6, 'mood' => 5, 'adherence' => Adherence::Partiellement, 'weight' => null],
        ]);
        $this->createConversation($practitioner, $youssef, [
            [2, 'patient', 'Bonjour, le protocole sommeil est bien lancé.', true],
            [9, 'praticien', "Youssef, je remarque que vous n'avez pas fait de check-in récemment, tout va bien ?", false],
        ]);
        $this->createVitaliteItems($youssef, [
            'Couper les écrans 1h avant le coucher',
            'Pratiquer une respiration profonde le soir',
        ]);

        // Nour : patient "normal", suivi solide sans être parfait (~75%)
        $this->buildProtocolWithLogs($nour, 'Stabilisation du poids', fn (int $occurrence) => $occurrence % 4 !== 0);
        $this->createCheckIns($nour, [
            ['days' => 6, 'energy' => 7, 'sleep' => 7, 'digestion' => 7, 'mood' => 7, 'adherence' => Adherence::Totalement, 'weight' => 70.60],
            ['days' => 13, 'energy' => 7, 'sleep' => 6, 'digestion' => 7, 'mood' => 7, 'adherence' => Adherence::Partiellement, 'weight' => null],
            ['days' => 20, 'energy' => 8, 'sleep' => 7, 'digestion' => 8, 'mood' => 8, 'adherence' => Adherence::Totalement, 'weight' => 69.80],
        ]);
        $this->createConversation($practitioner, $nour, [
            [7, 'patient', 'Le poids reste stable pour l’instant mais je me sens mieux dans mon corps.', true],
            [7, 'praticien', "C'est déjà un bon signe, la stabilisation prend du temps.", true],
            [19, 'patient', 'Merci pour le suivi, à bientôt pour la prochaine consultation.', false],
        ]);
        $this->createVitaliteItems($nour, [
            'Fractionner les repas dans la journée',
            'Surveiller les signaux de faim et de satiété',
        ]);

        $this->createProtocolTemplates();
    }

    private function createPatient(User $practitioner, array $attributes): User
    {
        return User::create(array_merge([
            'password' => Hash::make('password'),
            'role' => Role::Patient,
            'practitioner_id' => $practitioner->id,
        ], $attributes));
    }

    /**
     * Items partagés par tous les protocoles de démo : mélange mouvement /
     * nutrition, avec des consignes datées et des consignes permanentes.
     */
    private function buildProtocolWithLogs(User $patient, string $title, \Closure $shouldComplete): void
    {
        $protocol = Protocol::create([
            'patient_id' => $patient->id,
            'practitioner_id' => $patient->practitioner_id,
            'title' => $title,
            'starts_on' => $this->windowStart->toDateString(),
            'status' => ProtocolStatus::Actif,
        ]);

        $items = collect([
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => 1, 'title' => 'Marche rapide 30 min', 'reps' => '30 min', 'position' => 1]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => 3, 'title' => 'Marche rapide 30 min', 'reps' => '30 min', 'position' => 1]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => 5, 'title' => 'Marche rapide 30 min', 'reps' => '30 min', 'position' => 1]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => 2, 'title' => 'Renforcement musculaire léger', 'sets' => 3, 'reps' => '12', 'position' => 2]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => 4, 'title' => 'Renforcement musculaire léger', 'sets' => 3, 'reps' => '12', 'position' => 2]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Mouvement, 'day_of_week' => null, 'title' => 'Étirements avant le coucher', 'notes' => '5 à 10 minutes, en douceur.', 'position' => 3]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Nutrition, 'day_of_week' => null, 'title' => 'Boire 1,5 L d’eau', 'position' => 1]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Nutrition, 'day_of_week' => null, 'title' => 'Assiette anti-inflammatoire au déjeuner', 'position' => 2]),
            ProtocolItem::create(['protocol_id' => $protocol->id, 'pillar' => Pillar::Nutrition, 'day_of_week' => 7, 'title' => 'Préparer les repas de la semaine', 'position' => 3]),
        ]);

        $items->each(fn (ProtocolItem $item) => $item->setRelation('protocol', $protocol));

        $occurrence = 0;

        for ($i = 0; $i < 21; $i++) {
            $date = $this->windowStart->copy()->addDays($i);
            $iso = $date->dayOfWeekIso;

            foreach ($items as $item) {
                $expected = $item->day_of_week === null || $item->day_of_week === $iso;

                if (! $expected) {
                    continue;
                }

                $completed = $shouldComplete($occurrence, $date);
                $occurrence++;

                if ($completed) {
                    ProtocolLog::record($item, $date->toDateString(), ['completed' => true]);
                }
            }
        }
    }

    /**
     * Consignes de vitalité : indépendantes du protocole, rattachées
     * directement au patient (voir docs/MODELE-DONNEES.md).
     */
    private function createVitaliteItems(User $patient, array $texts): void
    {
        foreach ($texts as $text) {
            VitaliteItem::create([
                'patient_id' => $patient->id,
                'text' => $text,
            ]);
        }
    }

    private function createCheckIns(User $patient, array $checkIns): void
    {
        foreach ($checkIns as $data) {
            CheckIn::create([
                'patient_id' => $patient->id,
                'submitted_at' => $this->windowStart->copy()->addDays($data['days']),
                'energy' => $data['energy'],
                'sleep' => $data['sleep'],
                'digestion' => $data['digestion'],
                'mood' => $data['mood'],
                'adherence' => $data['adherence'],
                'weight' => $data['weight'] ?? null,
                'note' => $data['note'] ?? null,
            ]);
        }
    }

    private function createConversation(User $practitioner, User $patient, array $messages): void
    {
        foreach ($messages as [$days, $from, $body, $read]) {
            $sentAt = $this->windowStart->copy()->addDays($days);

            Message::create([
                'sender_id' => $from === 'patient' ? $patient->id : $practitioner->id,
                'recipient_id' => $from === 'patient' ? $practitioner->id : $patient->id,
                'body' => $body,
                'read_at' => $read ? $sentAt->copy()->addHours(2) : null,
                'created_at' => $sentAt,
                'updated_at' => $sentAt,
            ]);
        }
    }

    private function createProtocolTemplates(): void
    {
        ProtocolTemplate::create([
            'title' => 'Reprise en douceur — phase 1',
            'description' => "Pour un patient sédentaire depuis longtemps, qui reprend un accompagnement après une période d'arrêt.",
            'payload' => [
                'items' => [
                    ['pillar' => 'mouvement', 'day_of_week' => 1, 'title' => 'Marche rapide 20 min', 'sets' => null, 'reps' => '20 min', 'notes' => 'Rythme confortable, sans essoufflement.', 'position' => 1],
                    ['pillar' => 'mouvement', 'day_of_week' => 4, 'title' => 'Marche rapide 20 min', 'sets' => null, 'reps' => '20 min', 'notes' => null, 'position' => 1],
                    ['pillar' => 'mouvement', 'day_of_week' => null, 'title' => 'Étirements du matin', 'sets' => null, 'reps' => null, 'notes' => '5 minutes au réveil.', 'position' => 2],
                    ['pillar' => 'nutrition', 'day_of_week' => null, 'title' => 'Boire 1,5 L d’eau', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 1],
                    ['pillar' => 'nutrition', 'day_of_week' => null, 'title' => 'Assiette anti-inflammatoire au déjeuner', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 2],
                ],
            ],
        ]);

        ProtocolTemplate::create([
            'title' => 'Vitalité digestive',
            'description' => 'Pour les patients avec un terrain digestif fragile (ballonnements, transit irrégulier).',
            'payload' => [
                'items' => [
                    ['pillar' => 'nutrition', 'day_of_week' => null, 'title' => 'Boire 1,5 L d’eau à température ambiante', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 1],
                    ['pillar' => 'nutrition', 'day_of_week' => null, 'title' => 'Repas pris assis, sans écran', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 2],
                    ['pillar' => 'nutrition', 'day_of_week' => 1, 'title' => 'Cure de probiotiques', 'sets' => null, 'reps' => null, 'notes' => '1 gélule le matin à jeun.', 'position' => 3],
                    ['pillar' => 'mouvement', 'day_of_week' => null, 'title' => 'Marche digestive après le déjeuner', 'sets' => null, 'reps' => '10-15 min', 'notes' => null, 'position' => 1],
                ],
            ],
        ]);

        ProtocolTemplate::create([
            'title' => 'Regain d’énergie — programme intensif',
            'description' => 'Pour un patient motivé, en bonne condition générale, prêt pour un rythme soutenu.',
            'payload' => [
                'items' => [
                    ['pillar' => 'mouvement', 'day_of_week' => 1, 'title' => 'Renforcement musculaire complet', 'sets' => 4, 'reps' => '12', 'notes' => 'Charges progressives.', 'position' => 1],
                    ['pillar' => 'mouvement', 'day_of_week' => 3, 'title' => 'Renforcement musculaire complet', 'sets' => 4, 'reps' => '12', 'notes' => null, 'position' => 2],
                    ['pillar' => 'mouvement', 'day_of_week' => 5, 'title' => 'Cardio (vélo, course, natation)', 'sets' => null, 'reps' => '30 min', 'notes' => null, 'position' => 3],
                    ['pillar' => 'mouvement', 'day_of_week' => null, 'title' => 'Étirements après chaque séance', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 4],
                    ['pillar' => 'nutrition', 'day_of_week' => null, 'title' => 'Boire 2 L d’eau', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 1],
                    ['pillar' => 'nutrition', 'day_of_week' => 7, 'title' => 'Préparer les repas de la semaine', 'sets' => null, 'reps' => null, 'notes' => null, 'position' => 2],
                ],
            ],
        ]);
    }
}
