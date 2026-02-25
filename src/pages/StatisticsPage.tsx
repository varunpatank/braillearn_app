import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, BookOpen, Clock, Award, Target, 
  TrendingUp, Zap, Brain, Star,
  Globe, Accessibility, Activity, PieChart
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  description: string;
}

const StatisticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = 'Statistics & Analytics - BrailleLearn';
    window.scrollTo(0, 0);
    
    // Animate numbers on load
    const targetValues: Record<string, number> = {
      users: 1247,
      lessons: 8934,
      accuracy: 87,
      hours: 2156,
      streak: 45,
      achievements: 234
    };
    
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedStats({
        users: Math.round(targetValues.users * easeOut),
        lessons: Math.round(targetValues.lessons * easeOut),
        accuracy: Math.round(targetValues.accuracy * easeOut),
        hours: Math.round(targetValues.hours * easeOut),
        streak: Math.round(targetValues.streak * easeOut),
        achievements: Math.round(targetValues.achievements * easeOut)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  // Stat cards data
  const statCards: StatCard[] = [
    {
      title: 'Active Learners',
      value: animatedStats.users || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'Users learning braille this month'
    },
    {
      title: 'Lessons Completed',
      value: animatedStats.lessons || 0,
      change: '+24%',
      changeType: 'positive',
      icon: BookOpen,
      description: 'Total lessons finished'
    },
    {
      title: 'Average Accuracy',
      value: `${animatedStats.accuracy || 0}%`,
      change: '+5%',
      changeType: 'positive',
      icon: Target,
      description: 'Correct answers across all users'
    },
    {
      title: 'Learning Hours',
      value: animatedStats.hours || 0,
      change: '+18%',
      changeType: 'positive',
      icon: Clock,
      description: 'Total time spent learning'
    },
    {
      title: 'Longest Streak',
      value: `${animatedStats.streak || 0} days`,
      change: 'New record!',
      changeType: 'positive',
      icon: Zap,
      description: 'Consecutive days of learning'
    },
    {
      title: 'Achievements Earned',
      value: animatedStats.achievements || 0,
      change: '+32',
      changeType: 'positive',
      icon: Award,
      description: 'Badges and milestones unlocked'
    }
  ];

  // Chart data for learning progress over time
  const progressChartData = {
    labels: timeRange === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Lessons Completed',
        data: timeRange === 'week' 
          ? [12, 19, 15, 25, 22, 30, 28]
          : timeRange === 'month'
          ? [145, 189, 234, 278]
          : [420, 512, 634, 756, 823, 912, 987, 1089, 1234, 1345, 1456, 1567],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Practice Sessions',
        data: timeRange === 'week' 
          ? [8, 15, 12, 20, 18, 25, 22]
          : timeRange === 'month'
          ? [98, 134, 189, 234]
          : [320, 412, 534, 656, 723, 812, 887, 989, 1034, 1145, 1256, 1367],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Lesson category distribution
  const categoryChartData = {
    labels: ['Basics', 'Words', 'Sentences', 'Contractions', 'Advanced'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Practice mode popularity
  const practiceModeData = {
    labels: ['Lightning Reader', 'Precision Master', 'Pattern Detective', 'Braille Architect', 'Memory Champion'],
    datasets: [{
      label: 'Sessions',
      data: [456, 389, 312, 278, 234],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  };

  // Skill radar chart
  const skillRadarData = {
    labels: ['Letter Recognition', 'Word Reading', 'Speed', 'Accuracy', 'Contractions', 'Sentence Reading'],
    datasets: [{
      label: 'Average User Skills',
      data: [85, 78, 65, 87, 55, 72],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  };

  // Accessibility feature usage
  const accessibilityStats = [
    { feature: 'Screen Reader Support', usage: 78, icon: Accessibility },
    { feature: 'Audio Narration', usage: 92, icon: Activity },
    { feature: 'Keyboard Navigation', usage: 65, icon: Brain },
    { feature: 'High Contrast Mode', usage: 34, icon: Star },
    { feature: 'Hardware (Arduino)', usage: 23, icon: Zap }
  ];

  // Global impact stats
  const globalStats = [
    { region: 'North America', users: 523, percentage: 42 },
    { region: 'Europe', users: 312, percentage: 25 },
    { region: 'Asia', users: 234, percentage: 19 },
    { region: 'South America', users: 98, percentage: 8 },
    { region: 'Other', users: 80, percentage: 6 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner — Data Grid Theme */}
      <section className="relative bg-gradient-to-tr from-indigo-800 via-blue-700 to-blue-600 text-white py-16 overflow-hidden">
        {/* Grid lines pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
        </div>
        {/* Animated horizontal bars */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
          {[0,1,2,3,4].map(i => (
            <motion.div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent" style={{ top: `${20 + i * 15}%`, width: '60%' }}
              initial={{ x: '-60%' }} animate={{ x: '160%' }} transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.8 }} />
          ))}
        </div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Platform Analytics</span>
              </motion.div>
              <h1 className="text-4xl font-extrabold mb-3">Statistics & Impact</h1>
              <p className="text-lg text-blue-200 max-w-lg">
                Track the impact of BrailleLearn on braille literacy worldwide
              </p>
            </motion.div>
            {/* Mini stat highlights */}
            <motion.div className="flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {[{ val: '1.2K', label: 'Users' }, { val: '87%', label: 'Accuracy' }, { val: '8.9K', label: 'Lessons' }].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 text-center">
                  <div className="text-xl font-extrabold">{s.val}</div>
                  <div className="text-xs text-blue-200">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Time Range Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-300 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <TrendingUp className={`w-4 h-4 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  <span className="text-xs text-gray-400">vs last {timeRange}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Progress Over Time */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Learning Progress Over Time
              </h3>
              <div className="h-64">
                <Line 
                  data={progressChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>

            {/* Lesson Categories */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary-600" />
                Lesson Category Distribution
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={categoryChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>

            {/* Practice Mode Popularity */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                Practice Mode Popularity
              </h3>
              <div className="h-64">
                <Bar 
                  data={practiceModeData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>

            {/* Skill Radar */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-600" />
                Average Skill Profile
              </h3>
              <div className="h-64">
                <Radar 
                  data={skillRadarData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Accessibility & Global Impact */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Accessibility Feature Usage */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-primary-600" />
                Accessibility Feature Adoption
              </h3>
              <div className="space-y-4">
                {accessibilityStats.map((stat) => (
                  <div key={stat.feature}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{stat.feature}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stat.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.usage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Global Reach */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-600" />
                Global Reach
              </h3>
              <div className="space-y-4">
                {globalStats.map((stat) => (
                  <div key={stat.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{stat.region}</span>
                      <span className="text-sm text-gray-500 ml-2">({stat.users} users)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className="bg-primary-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-10 text-right">{stat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Summary */}
      <section className="py-12 bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Making a Difference</h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Every lesson completed brings us closer to a world where braille literacy is accessible to all
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold">285M+</div>
                <div className="text-primary-200">Visually impaired worldwide</div>
              </div>
              <div>
                <div className="text-4xl font-bold">&lt;10%</div>
                <div className="text-primary-200">Current braille literacy</div>
              </div>
              <div>
                <div className="text-4xl font-bold">1,247</div>
                <div className="text-primary-200">Active learners</div>
              </div>
              <div>
                <div className="text-4xl font-bold">8,934</div>
                <div className="text-primary-200">Lessons completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatisticsPage;
