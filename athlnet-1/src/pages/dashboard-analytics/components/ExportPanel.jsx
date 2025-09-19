import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportPanel = ({ onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDateRange, setSelectedDateRange] = useState('last-30-days');
  const [selectedMetrics, setSelectedMetrics] = useState(['engagement', 'reach', 'connections']);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: 'pdf', name: 'PDF Report', icon: 'FileText', description: 'Formatted report with charts' },
    { id: 'csv', name: 'CSV Data', icon: 'Download', description: 'Raw data for analysis' },
    { id: 'excel', name: 'Excel Workbook', icon: 'FileSpreadsheet', description: 'Structured data with sheets' },
    { id: 'json', name: 'JSON Export', icon: 'Code', description: 'Developer-friendly format' }
  ];

  const dateRanges = [
    { id: 'last-7-days', name: 'Last 7 days' },
    { id: 'last-30-days', name: 'Last 30 days' },
    { id: 'last-90-days', name: 'Last 90 days' },
    { id: 'last-year', name: 'Last year' },
    { id: 'all-time', name: 'All time' }
  ];

  const availableMetrics = [
    { id: 'engagement', name: 'Engagement Metrics', icon: 'Heart' },
    { id: 'reach', name: 'Reach & Impressions', icon: 'Eye' },
    { id: 'connections', name: 'Network Growth', icon: 'Users' },
    { id: 'content', name: 'Content Performance', icon: 'BarChart3' },
    { id: 'demographics', name: 'Audience Demographics', icon: 'PieChart' },
    { id: 'goals', name: 'Goal Progress', icon: 'Target' }
  ];

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev?.includes(metricId) 
        ? prev?.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    const exportData = {
      format: selectedFormat,
      dateRange: selectedDateRange,
      metrics: selectedMetrics,
      timestamp: new Date()?.toISOString()
    };

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onExport) {
        onExport(exportData);
      }
      
      // Show success message or trigger download
      console.log('Export completed:', exportData);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Download" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Analytics</h3>
          <p className="text-sm text-muted-foreground">Download your data for external analysis</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Export Format</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exportFormats?.map((format) => (
              <button
                key={format?.id}
                onClick={() => setSelectedFormat(format?.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedFormat === format?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={format?.icon} size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{format?.name}</p>
                    <p className="text-xs text-muted-foreground">{format?.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Date Range</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {dateRanges?.map((range) => (
              <button
                key={range?.id}
                onClick={() => setSelectedDateRange(range?.id)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDateRange === range?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {range?.name}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Selection */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Include Metrics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableMetrics?.map((metric) => (
              <button
                key={metric?.id}
                onClick={() => handleMetricToggle(metric?.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedMetrics?.includes(metric?.id)
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedMetrics?.includes(metric?.id)
                      ? 'border-primary bg-primary' :'border-muted-foreground'
                  }`}>
                    {selectedMetrics?.includes(metric?.id) && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>
                  <Icon name={metric?.icon} size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{metric?.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Export Summary</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Format: <span className="text-foreground font-medium">{exportFormats?.find(f => f?.id === selectedFormat)?.name}</span></p>
            <p>Date Range: <span className="text-foreground font-medium">{dateRanges?.find(r => r?.id === selectedDateRange)?.name}</span></p>
            <p>Metrics: <span className="text-foreground font-medium">{selectedMetrics?.length} selected</span></p>
            <p>Estimated Size: <span className="text-foreground font-medium">~2.5 MB</span></p>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          loading={isExporting}
          disabled={selectedMetrics?.length === 0}
          iconName="Download"
          iconPosition="left"
          className="w-full"
        >
          {isExporting ? 'Preparing Export...' : 'Export Analytics'}
        </Button>

        {/* Recent Exports */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recent Exports</h4>
          <div className="space-y-2">
            {[
              { name: 'Analytics_Report_Dec_2024.pdf', date: '2 hours ago', size: '2.1 MB' },
              { name: 'Engagement_Data_Nov_2024.csv', date: '1 day ago', size: '856 KB' },
              { name: 'Network_Growth_Q4_2024.xlsx', date: '3 days ago', size: '1.4 MB' }
            ]?.map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="FileText" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{export_?.name}</p>
                    <p className="text-xs text-muted-foreground">{export_?.date} • {export_?.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" iconName="Download">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;