import { Head } from '@inertiajs/react';
import Sidebar from '../Components/Praticien/Sidebar';

export default function PraticienLayout({ title, children }) {
    return (
        <div className="flex min-h-screen bg-cream">
            <Head title={title} />
            <Sidebar />
            <main className="min-w-0 flex-1 px-11 pt-9 pb-15">{children}</main>
        </div>
    );
}
