import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ContentAnalyticsTable = ({ posts }) => {
  const [sortField, setSortField] = useState('engagement');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPosts = [...posts]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000)?.toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000)?.toFixed(1)}K`;
    return num?.toString();
  };

  return (
    <div className="bg-card border border-border rounded-lg card-elevation-1">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Content Performance</h3>
        <p className="text-sm text-muted-foreground mt-1">Detailed analytics for your recent posts</p>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Content</th>
              <th 
                className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('reach')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reach</span>
                  <Icon name={getSortIcon('reach')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('engagement')}
              >
                <div className="flex items-center space-x-1">
                  <span>Engagement</span>
                  <Icon name={getSortIcon('engagement')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('shares')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shares</span>
                  <Icon name={getSortIcon('shares')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('engagementRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rate</span>
                  <Icon name={getSortIcon('engagementRate')} size={14} />
                </div>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts?.map((post, index) => (
              <tr key={post?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image 
                        src={post?.thumbnail} 
                        alt={post?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{post?.title}</p>
                      <p className="text-xs text-muted-foreground">{post?.type}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">{formatNumber(post?.reach)}</td>
                <td className="p-4 text-sm text-foreground">{formatNumber(post?.engagement)}</td>
                <td className="p-4 text-sm text-foreground">{formatNumber(post?.shares)}</td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${
                    post?.engagementRate >= 5 ? 'text-success' : 
                    post?.engagementRate >= 3 ? 'text-warning' : 'text-error'
                  }`}>
                    {post?.engagementRate}%
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{post?.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {sortedPosts?.map((post) => (
          <div key={post?.id} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image 
                  src={post?.thumbnail} 
                  alt={post?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{post?.title}</p>
                <p className="text-xs text-muted-foreground">{post?.type} • {post?.date}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Reach</p>
                <p className="text-sm font-medium text-foreground">{formatNumber(post?.reach)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-sm font-medium text-foreground">{formatNumber(post?.engagement)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shares</p>
                <p className="text-sm font-medium text-foreground">{formatNumber(post?.shares)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className={`text-sm font-medium ${
                  post?.engagementRate >= 5 ? 'text-success' : 
                  post?.engagementRate >= 3 ? 'text-warning' : 'text-error'
                }`}>
                  {post?.engagementRate}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentAnalyticsTable;