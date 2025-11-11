import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface NotasDistributionChartProps {
  data: {
    etapa1: number;
    etapa2: number;
    etapa3: number;
  };
}

export function NotasDistributionChart({ data }: NotasDistributionChartProps) {
  const chartData = {
    labels: ["1ª Etapa", "2ª Etapa", "3ª Etapa"],
    datasets: [
      {
        label: "Média de Notas",
        data: [data.etapa1, data.etapa2, data.etapa3],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(99, 102, 241, 0.8)", // indigo-500
          "rgba(139, 92, 246, 0.8)", // violet-500
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Distribuição de Notas por Etapa",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 35,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

interface ComportamentoChartProps {
  data: {
    excelente: number;
    ok: number;
    inapropriado: number;
  };
}

export function ComportamentoChart({ data }: ComportamentoChartProps) {
  const chartData = {
    labels: ["Excelente", "Ok", "Inapropriado"],
    datasets: [
      {
        data: [data.excelente, data.ok, data.inapropriado],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", // green-500
          "rgba(107, 114, 128, 0.8)", // gray-500
          "rgba(239, 68, 68, 0.8)", // red-500
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(107, 114, 128, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Distribuição de Comportamento",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Pie data={chartData} options={options} />
    </div>
  );
}

interface FrequenciaChartProps {
  data: Array<{
    mes: string;
    frequencia: number;
  }>;
}

export function FrequenciaChart({ data }: FrequenciaChartProps) {
  const chartData = {
    labels: data.map((d) => d.mes),
    datasets: [
      {
        label: "Frequência Média (%)",
        data: data.map((d) => d.frequencia),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Evolução da Frequência",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: (value: any) => value + "%",
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}

interface DesempenhoGeralChartProps {
  data: Array<{
    aluno: string;
    total: number;
  }>;
}

export function DesempenhoGeralChart({ data }: DesempenhoGeralChartProps) {
  const chartData = {
    labels: data.map((d) => d.aluno),
    datasets: [
      {
        label: "Pontuação Total",
        data: data.map((d) => d.total),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Desempenho Geral dos Alunos",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
