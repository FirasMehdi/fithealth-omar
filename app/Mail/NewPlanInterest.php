<?php

namespace App\Mail;

use App\Models\PlanInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewPlanInterest extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PlanInterest $planInterest)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvelle demande — '.$this->planInterest->first_name.' '.$this->planInterest->last_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-plan-interest',
        );
    }
}
