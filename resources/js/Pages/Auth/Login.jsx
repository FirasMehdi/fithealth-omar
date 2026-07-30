import { Head, useForm } from '@inertiajs/react';

export default function Login() {
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
            <Head title="Connexion" />

            <div className="w-full max-w-sm">
                <h1 className="mb-10 text-center font-display text-3xl text-forest">
                    FitHealth
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm text-forest">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                            className="w-full rounded border border-sand bg-white px-3 py-2 text-forest focus:outline-none focus:ring-2 focus:ring-sage"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-terracotta">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm text-forest">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded border border-sand bg-white px-3 py-2 text-forest focus:outline-none focus:ring-2 focus:ring-sage"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-terracotta">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded bg-forest py-2 font-medium text-cream transition hover:opacity-90 disabled:opacity-50"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
