<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
    </head>
    <body style="margin: 0; padding: 24px; background: #F7F4ED; font-family: sans-serif; color: #1B3A2F;">
        <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 32px;">
            <h1 style="font-size: 20px; margin: 0 0 16px;">Nouvelle demande de contact</h1>

            @if ($planInterest->plan_title)
                <p style="margin: 0 0 16px; font-size: 14px; color: #6B7568;">
                    Formule : <strong>{{ $planInterest->plan_title }}</strong>
                </p>
            @endif

            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr>
                    <td style="padding: 6px 0; color: #6B7568;">Nom</td>
                    <td style="padding: 6px 0;">{{ $planInterest->last_name }} {{ $planInterest->first_name }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6B7568;">Téléphone</td>
                    <td style="padding: 6px 0;">{{ $planInterest->phone }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6B7568;">Email</td>
                    <td style="padding: 6px 0;">{{ $planInterest->email }}</td>
                </tr>
                @if ($planInterest->goal)
                    <tr>
                        <td style="padding: 6px 0; color: #6B7568;">Objectif</td>
                        <td style="padding: 6px 0;">{{ $planInterest->goal }}</td>
                    </tr>
                @endif
            </table>

            @if ($planInterest->message)
                <p style="margin: 16px 0 0; padding-top: 16px; border-top: 1px solid #D9C9A8; font-size: 14px; line-height: 1.6;">
                    {{ $planInterest->message }}
                </p>
            @endif
        </div>
    </body>
</html>
