/**
 * Data Freshness Indicator component
 * Visual indicator showing how fresh/stale the data is
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DataFreshnessIndicator = ({ 
  freshness = 0, // 0-100
  lastSynced = null,
  compact = false,
  style = {}
}) => {
  // Calculate color based on freshness
  const indicatorColor = useMemo(() => {
    if (freshness > 80) return '#2ecc71'; // Green
    if (freshness > 50) return '#f1c40f'; // Yellow
    if (freshness > 20) return '#e67e22'; // Orange
    return '#e74c3c'; // Red
  }, [freshness]);
  
  // Format last synced date
  const formattedDate = useMemo(() => {
    if (!lastSynced) return 'Never synced';
    
    const date = new Date(lastSynced);
    const now = new Date();
    
    // Calculate time difference in minutes
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // If more than a week, show formatted date
    return date.toLocaleDateString();
  }, [lastSynced]);
  
  // Get status text
  const statusText = useMemo(() => {
    if (freshness > 80) return 'Up to date';
    if (freshness > 50) return 'Recent';
    if (freshness > 20) return 'Needs refresh';
    return 'Outdated';
  }, [freshness]);
  
  // Icon based on freshness
  const icon = useMemo(() => {
    if (freshness > 80) return 'checkmark-circle-outline';
    if (freshness > 50) return 'time-outline';
    if (freshness > 20) return 'refresh-circle-outline';
    return 'warning-outline';
  }, [freshness]);
  
  // Compact mode just shows a dot with a tooltip
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View 
          style={[
            styles.dot, 
            { backgroundColor: indicatorColor }
          ]} 
        />
        <Text style={styles.compactText}>{statusText}</Text>
      </View>
    );
  }
  
  // Full mode shows icon, status and last synced time
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={icon} 
          size={18} 
          color={indicatorColor} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  compactText: {
    fontSize: 12,
    color: '#666',
  }
});

export default DataFreshnessIndicator;