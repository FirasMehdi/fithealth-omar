import { router } from '@inertiajs/react';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TIERS = [
    { key: 'under25', label: 'Moins de 25%', color: '#C4643F' },
    { key: '25to50', label: '25 – 50%', color: '#D9C9A8' },
    { key: '50to75', label: '50 – 75%', color: '#A9C4A8' },
    { key: 'over75', label: 'Plus de 75%', color: '#7FA07E' },
];

export default function TierBreakdownChart({ tiers }) {
    const data = {
        labels: TIERS.map((t) => t.label),
        datasets: [
            {
                data: TIERS.map((t) => tiers[t.key] ?? 0),
                backgroundColor: TIERS.map((t) => t.color),
                borderRadius: 6,
                barThickness: 26,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1B3A2F',
                titleColor: '#F7F4ED',
                bodyColor: '#F7F4ED',
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (item) => `${item.raw} patient${item.raw > 1 ? 's' : ''}`,
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: 'rgba(217,201,168,0.3)' },
                ticks: { color: '#6B7568', font: { size: 11 }, precision: 0 },
            },
            y: {
                grid: { display: false },
                ticks: { color: '#1B3A2F', font: { size: 13, weight: '600' } },
            },
        },
        onClick: (_event, elements) => {
            if (elements.length === 0) return;
            router.visit(`/praticien/patients?observance=${TIERS[elements[0].index].key}`);
        },
        onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
        },
    };

    return (
        <div style={{ height: '220px' }}>
            <Bar data={data} options={options} />
        </div>
    );
}
