<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PlaceholderController extends Controller
{
    public function reglages(): Response
    {
        return Inertia::render('Praticien/Placeholder', ['title' => __('Réglages')]);
    }
}
