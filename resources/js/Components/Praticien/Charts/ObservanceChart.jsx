import { CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const AXIS_COLOR = '#6B7568';
const GRID_COLOR = 'rgba(217,201,168,0.3)';
const TARGET = 70;

export default function ObservanceChart({ trend }) {
    const labels = trend.map((t) => t.label);
    const flat = trend.map(() => TARGET);

    const data = {
        labels,
        datasets: [
            {
                label: 'Zone de référence',
                data: flat,
                borderColor: 'transparent',
                backgroundColor: 'rgba(127,160,126,0.12)',
                fill: 'origin',
                pointRadius: 0,
                order: 3,
            },
            {
                label: 'Objectif 70%',
                data: flat,
                borderColor: '#D9C9A8',
                borderWidth: 1.5,
                borderDash: [6, 4],
                pointRadius: 0,
                fill: false,
                order: 2,
            },
            {
                label: 'Observance moyenne',
                data: trend.map((t) => t.average),
                borderColor: '#1B3A2F',
                backgroundColor: '#1B3A2F',
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: '#1B3A2F',
                tension: 0.3,
                fill: false,
                spanGaps: false,
                order: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1B3A2F',
                titleColor: '#F7F4ED',
                bodyColor: '#F7F4ED',
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                filter: (item) => item.datasetIndex === 2,
                callbacks: {
                    label: (item) => (item.raw === null ? 'Aucun patient actif' : `${item.raw}% d’observance`),
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: AXIS_COLOR, font: { size: 11 } },
            },
            y: {
                min: 0,
                max: 100,
                grid: { color: GRID_COLOR },
                ticks: { color: AXIS_COLOR, font: { size: 11 }, callback: (v) => `${v}%` },
            },
        },
    };

    return (
        <div style={{ height: '260px' }}>
            <Line data={data} options={options} />
        </div>
    );
}
