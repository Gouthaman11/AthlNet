import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import KPICard from './components/KPICard';
import EngagementChart from './components/EngagementChart';
import ContentAnalyticsTable from './components/ContentAnalyticsTable';
import NetworkingInsights from './components/NetworkingInsights';
import GoalTracker from './components/GoalTracker';
import ExportPanel from './components/ExportPanel';

const DashboardAnalytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);

  // Mock KPI data
  const kpiData = [
    {
      title: "Profile Views",
      value: "12,847",
      change: "+23.5%",
      changeType: "positive",
      icon: "Eye",
      trend: 78
    },
    {
      title: "Connection Growth",
      value: "1,234",
      change: "+12.8%",
      changeType: "positive",
      icon: "Users",
      trend: 65
    },
    {
      title: "Post Engagement",
      value: "8.4%",
      change: "-2.1%",
      changeType: "negative",
      icon: "Heart",
      trend: 42
    },
    {
      title: "Achievement Score",
      value: "94",
      change: "+5.2%",
      changeType: "positive",
      icon: "Trophy",
      trend: 94
    }
  ];

  // Mock engagement chart data
  const engagementData = [
    { date: 'Dec 1', engagement: 1200, views: 3400 },
    { date: 'Dec 5', engagement: 1800, views: 4200 },
    { date: 'Dec 10', engagement: 1600, views: 3800 },
    { date: 'Dec 15', engagement: 2200, views: 5100 },
    { date: 'Dec 20', engagement: 2800, views: 6200 },
    { date: 'Dec 25', engagement: 2400, views: 5800 },
    { date: 'Dec 30', engagement: 3200, views: 7100 }
  ];

  // Mock content analytics data
  const contentData = [
    {
      id: 1,
      title: "Training Session Highlights",
      type: "Video",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      reach: 15420,
      engagement: 2340,
      shares: 156,
      engagementRate: 6.2,
      date: "Dec 28"
    },
    {
      id: 2,
      title: "Championship Victory Celebration",
      type: "Photo",
      thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400",
      reach: 28750,
      engagement: 4200,
      shares: 320,
      engagementRate: 8.9,
      date: "Dec 25"
    },
    {
      id: 3,
      title: "Pre-Game Motivation Speech",
      type: "Video",
      thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400",
      reach: 9840,
      engagement: 1560,
      shares: 89,
      engagementRate: 4.1,
      date: "Dec 22"
    },
    {
      id: 4,
      title: "Behind the Scenes Training",
      type: "Story",
      thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
      reach: 12300,
      engagement: 1890,
      shares: 124,
      engagementRate: 5.7,
      date: "Dec 20"
    },
    {
      id: 5,
      title: "Team Strategy Discussion",
      type: "Photo",
      thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
      reach: 7650,
      engagement: 980,
      shares: 45,
      engagementRate: 2.8,
      date: "Dec 18"
    }
  ];

  // Mock networking insights data
  const networkingData = {
    qualityScore: 85,
    newConnections: 47,
    mutualConnections: 12,
    collaborationRequests: 8,
    recommendations: [
      {
        title: "Engage with recent connections",
        description: "15 new connections haven't received a message from you yet"
      },
      {
        title: "Complete your profile",
        description: "Add your recent achievements to increase visibility by 30%"
      },
      {
        title: "Share more content",
        description: "Users who post 3x/week get 40% more profile views"
      }
    ],
    growthData: [
      { month: 'Jul', connections: 45 },
      { month: 'Aug', connections: 62 },
      { month: 'Sep', connections: 78 },
      { month: 'Oct', connections: 94 },
      { month: 'Nov', connections: 112 },
      { month: 'Dec', connections: 134 }
    ]
  };

  // Mock goals data
  const goalsData = [
    {
      id: 1,
      title: "Reach 10K Followers",
      category: "Social Growth",
      icon: "Users",
      current: 8750,
      target: 10000,
      progress: 87.5,
      status: "on-track",
      deadline: "2025-01-31",
      dailyAverage: 45,
      daysRemaining: 22,
      requiredDaily: 57,
      recentProgress: [
        { day: 'Mon', value: 42 },
        { day: 'Tue', value: 38 },
        { day: 'Wed', value: 55 },
        { day: 'Thu', value: 48 },
        { day: 'Fri', value: 62 },
        { day: 'Sat', value: 71 },
        { day: 'Sun', value: 45 }
      ]
    },
    {
      id: 2,
      title: "5% Engagement Rate",
      category: "Content Performance",
      icon: "Heart",
      current: 4.2,
      target: 5.0,
      progress: 84,
      status: "behind",
      deadline: "2025-02-15",
      dailyAverage: 4.1,
      daysRemaining: 37,
      requiredDaily: 4.8,
      recentProgress: [
        { day: 'Mon', value: 3.8 },
        { day: 'Tue', value: 4.1 },
        { day: 'Wed', value: 4.5 },
        { day: 'Thu', value: 4.0 },
        { day: 'Fri', value: 4.3 },
        { day: 'Sat', value: 4.7 },
        { day: 'Sun', value: 4.2 }
      ]
    },
    {
      id: 3,
      title: "50 New Connections",
      category: "Networking",
      icon: "UserPlus",
      current: 52,
      target: 50,
      progress: 104,
      status: "completed",
      deadline: "2024-12-31",
      dailyAverage: 2.1,
      daysRemaining: 0,
      requiredDaily: 0,
      recentProgress: [
        { day: 'Mon', value: 2 },
        { day: 'Tue', value: 3 },
        { day: 'Wed', value: 1 },
        { day: 'Thu', value: 2 },
        { day: 'Fri', value: 4 },
        { day: 'Sat', value: 2 },
        { day: 'Sun', value: 1 }
      ]
    }
  ];

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const handleExport = (exportData) => {
    console.log('Exporting analytics data:', exportData);
    // Handle export logic here
    setIsExportPanelOpen(false);
  };

  // Add this function to handle goal updates
  const handleUpdateGoal = (goalId, updates) => {
    console.log('Updating goal:', goalId, updates);
    // Handle goal update logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Track your performance and grow your athletic network
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                {timeRanges?.map((range) => (
                  <button
                    key={range?.id}
                    onClick={() => setSelectedTimeRange(range?.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      selectedTimeRange === range?.id
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range?.label}
                  </button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsExportPanelOpen(!isExportPanelOpen)}
                iconName="Download"
                iconPosition="left"
              >
                Export
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData?.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                change={kpi?.change}
                changeType={kpi?.changeType}
                icon={kpi?.icon}
                trend={kpi?.trend}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <EngagementChart
              data={engagementData}
              title="Engagement Over Time"
              type="area"
            />
            <EngagementChart
              data={engagementData}
              title="Views vs Engagement"
              type="line"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Content Analytics - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ContentAnalyticsTable posts={contentData} />
            </div>
            
            {/* Export Panel - Conditional */}
            {isExportPanelOpen ? (
              <ExportPanel onExport={handleExport} />
            ) : (
              <NetworkingInsights insights={networkingData} />
            )}
          </div>

          {/* Goal Tracker - Full Width */}
          <div className="mb-8">
            <GoalTracker goals={goalsData} onUpdateGoal={handleUpdateGoal} />
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audience Demographics */}
            <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-6">Audience Demographics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age 18-24</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '35%' }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age 25-34</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-secondary rounded-full h-2" style={{ width: '42%' }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">42%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Age 35+</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-accent rounded-full h-2" style={{ width: '23%' }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">23%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Content */}
            <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
              <h3 className="text-lg font-semibold text-foreground mb-6">Top Performing Content</h3>
              <div className="space-y-4">
                {contentData?.slice(0, 3)?.map((post, index) => (
                  <div key={post?.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post?.title}</p>
                      <p className="text-xs text-muted-foreground">{post?.engagementRate}% engagement</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{post?.engagement?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">interactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAnalytics;
