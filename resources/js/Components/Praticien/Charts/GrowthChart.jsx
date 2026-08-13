import { BarElement, CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

const AXIS_COLOR = '#6B7568';
const GRID_COLOR = 'rgba(217,201,168,0.3)';

export default function GrowthChart({ trend, t }) {
    const data = {
        labels: trend.map((entry) => entry.label),
        datasets: [
            {
                type: 'line',
                label: t('Total patients suivis'),
                data: trend.map((entry) => entry.total),
                borderColor: '#1B3A2F',
                backgroundColor: 'rgba(127,160,126,0.18)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: '#1B3A2F',
                yAxisID: 'y',
                order: 1,
            },
            {
                type: 'bar',
                label: t('Nouveaux patients'),
                data: trend.map((entry) => entry.new),
                backgroundColor: '#D9C9A8',
                borderRadius: 4,
                barThickness: 12,
                yAxisID: 'y1',
                order: 2,
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
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: AXIS_COLOR, font: { size: 11 } },
            },
            y: {
                position: 'left',
                beginAtZero: true,
                grid: { color: GRID_COLOR },
                ticks: { color: AXIS_COLOR, font: { size: 11 }, precision: 0 },
                title: { display: false },
            },
            y1: {
                position: 'right',
                beginAtZero: true,
                grid: { display: false },
                ticks: { color: AXIS_COLOR, font: { size: 11 }, precision: 0 },
            },
        },
    };

    return (
        <div style={{ height: '260px' }}>
            <Chart type="bar" data={data} options={options} />
        </div>
    );
}
