import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const EngagementChart = ({ data, title, type = 'line' }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(30, 64, 175)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(30, 64, 175)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229, 231, 235)" />
              <XAxis 
                dataKey="date" 
                stroke="rgb(107, 114, 128)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgb(107, 114, 128)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="rgb(30, 64, 175)" 
                fillOpacity={1} 
                fill="url(#colorEngagement)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229, 231, 235)" />
              <XAxis 
                dataKey="date" 
                stroke="rgb(107, 114, 128)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgb(107, 114, 128)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="rgb(30, 64, 175)" 
                strokeWidth={3}
                dot={{ fill: 'rgb(30, 64, 175)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'rgb(30, 64, 175)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="rgb(99, 102, 241)" 
                strokeWidth={2}
                dot={{ fill: 'rgb(99, 102, 241)', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngagementChart;