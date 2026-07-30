import { Head } from '@inertiajs/react';
import Sidebar from '../Components/Patient/Sidebar';

export default function PatientLayout({ title, children }) {
    return (
        <div className="flex min-h-screen bg-cream">
            <Head title={title} />
            <Sidebar />
            <main className="flex min-h-0 min-w-0 flex-1 flex-col px-11 pt-9 pb-15">{children}</main>
        </div>
    );
}
