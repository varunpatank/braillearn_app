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
  mockUsers?: { [key: string]: string };
  currentUserId?: string;
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

export const ClassDashboard: React.FC<ClassDashboardProps> = ({ classData, onClose, mockUsers = {}, currentUserId }) => {
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
    <div className="bg-gradient-to-br from-white via-gray-50 to-white p-8 rounded-2xl shadow-xl border-2 border-gray-900 space-y-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{classData.title}</h2>
          <p className="text-gray-600 font-medium text-lg">{classData.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors border-2 border-gray-900 shadow-md hover:shadow-lg"
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
            className="bg-white p-6 rounded-xl border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-full bg-${metric.color}-100 flex items-center justify-center mb-4 border-2 border-gray-900 shadow-md`}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
            </div>
            <h3 className="text-sm font-bold text-gray-700">{metric.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Trend</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Progress</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolled Students ({classData.enrolledStudents.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {classData.enrolledStudents.map((studentId, index) => {
            const isCurrentUser = currentUserId === studentId;
            return (
              <div
                key={studentId}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 shadow-sm ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-600' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 border-gray-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isCurrentUser 
                    ? 'bg-green-300 border-green-700' 
                    : 'bg-blue-200 border-gray-900'
                }`}>
                  <span className={`text-xs font-bold ${
                    isCurrentUser ? 'text-green-800' : 'text-blue-700'
                  }`}>
                    {(mockUsers[studentId] || `Student ${index + 1}`).charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {mockUsers[studentId] || `Student ${index + 1}`}
                  {isCurrentUser && <span className="text-green-600 font-bold"> (You)</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Milestones</h3>
        <div className="space-y-3">
          {upcomingMilestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-900 shadow-sm">
                <span className="text-sm font-bold text-blue-600">
                  {index + 1}
                </span>
              </div>
              <span className="text-gray-800 font-medium">{milestone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};