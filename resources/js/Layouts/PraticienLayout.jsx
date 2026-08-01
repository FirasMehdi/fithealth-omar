import { Head } from '@inertiajs/react';
import Sidebar from '../Components/Praticien/Sidebar';

export default function PraticienLayout({ title, children }) {
    return (
        <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
            <Head title={title} />
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 pt-6 pb-10 sm:px-7 lg:px-11 lg:pt-9 lg:pb-15">{children}</main>
        </div>
    );
}
