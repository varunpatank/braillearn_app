import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { BrailleClass } from '../types/classTypes';
import { Users, BookOpen, Star, Clock } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ClassDashboardProps {
  classData: BrailleClass;
  onClose: () => void;
}

const generateAttendanceData = () => {
  // Generate sample attendance data for last 7 sessions
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    attendance: Math.floor(Math.random() * 5) + 5,
  }));
};

const generateProgressData = () => {
  // Generate sample progress data for different skills
  return {
    labels: ['Reading', 'Writing', 'Comprehension', 'Speed', 'Accuracy'],
    data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) + 60),
  };
};

export const ClassDashboard: React.FC<ClassDashboardProps> = ({ classData, onClose }) => {
  const attendanceData = generateAttendanceData();
  const progressData = generateProgressData();

  const lineChartData: ChartData<'line'> = {
    labels: attendanceData.map(d => d.date),
    datasets: [
      {
        label: 'Student Attendance',
        data: attendanceData.map(d => d.attendance),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const barChartData: ChartData<'bar'> = {
    labels: progressData.labels,
    datasets: [
      {
        label: 'Class Progress (%)',
        data: progressData.data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const metrics = [
    {
      icon: Users,
      label: 'Active Students',
      value: classData.enrolledStudents.length,
      color: 'blue',
    },
    {
      icon: BookOpen,
      label: 'Chapters',
      value: classData.chapters.length,
      color: 'green',
    },
    {
      icon: Clock,
      label: 'Hours Completed',
      value: Math.floor(Math.random() * 20) + 10,
      color: 'purple',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: '4.8/5',
      color: 'yellow',
    },
  ];

  const upcomingMilestones = [
    'Complete Chapter 3: Advanced Patterns',
    'Group Project Presentation',
    'Mid-term Assessment',
    'Guest Speaker Session',
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{classData.title}</h2>
          <p className="text-gray-600">{classData.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-full bg-${metric.color}-100 flex items-center justify-center mb-3`}>
              <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Progress</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Milestones</h3>
        <div className="space-y-3">
          {upcomingMilestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {index + 1}
                </span>
              </div>
              <span className="text-gray-700">{milestone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};