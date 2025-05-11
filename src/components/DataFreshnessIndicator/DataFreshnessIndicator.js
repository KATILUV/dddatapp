/**
 * Data Freshness Indicator component
 * Visual indicator showing how fresh/stale the data is
 */
import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

/**
 * Component that displays the freshness of data
 * @param {Object} props
 * @param {Date|number|string} props.lastUpdated - When the data was last updated
 * @param {string} props.size - Size of the indicator ('small', 'medium', 'large')
 * @param {string} props.label - Custom label to display
 * @param {function} props.onRefresh - Callback when refresh button is pressed
 * @param {boolean} props.loading - Whether refresh is in progress
 * @param {Object} props.style - Additional styles
 */
const DataFreshnessIndicator = ({ 
  lastUpdated,
  size = 'medium',
  label,
  onRefresh,
  loading = false,
  style
}) => {
  // Convert lastUpdated to Date object if it's not already
  const lastUpdatedDate = useMemo(() => {
    if (!lastUpdated) return null;
    
    return lastUpdated instanceof Date 
      ? lastUpdated 
      : new Date(lastUpdated);
  }, [lastUpdated]);
  
  // Calculate how stale the data is
  const { freshnessLevel, timeText } = useMemo(() => {
    if (!lastUpdatedDate || isNaN(lastUpdatedDate.getTime())) {
      return { 
        freshnessLevel: 'unknown',
        timeText: 'Unknown'
      };
    }
    
    const now = new Date();
    const diffMs = now - lastUpdatedDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Determine freshness level
    let freshnessLevel = 'fresh';
    let timeText = '';
    
    if (diffMins < 5) {
      freshnessLevel = 'fresh';
      timeText = 'Just now';
    } else if (diffMins < 60) {
      freshnessLevel = 'fresh';
      timeText = `${diffMins}m ago`;
    } else if (diffHours < 3) {
      freshnessLevel = 'fresh';
      timeText = `${diffHours}h ago`;
    } else if (diffHours < 24) {
      freshnessLevel = 'moderate';
      timeText = `${diffHours}h ago`;
    } else if (diffDays < 3) {
      freshnessLevel = 'moderate';
      timeText = `${diffDays}d ago`;
    } else if (diffDays < 7) {
      freshnessLevel = 'stale';
      timeText = `${diffDays}d ago`;
    } else {
      freshnessLevel = 'stale';
      timeText = `${diffDays}d ago`;
    }
    
    return { freshnessLevel, timeText };
  }, [lastUpdatedDate]);
  
  // Get color based on freshness
  const getColor = () => {
    switch (freshnessLevel) {
      case 'fresh':
        return theme.colors.success.main;
      case 'moderate':
        return theme.colors.warning.main;
      case 'stale':
        return theme.colors.error.main;
      default:
        return theme.colors.text.tertiary;
    }
  };
  
  // Get icon based on freshness
  const getIcon = () => {
    switch (freshnessLevel) {
      case 'fresh':
        return 'checkmark-circle';
      case 'moderate':
        return 'time';
      case 'stale':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };
  
  // Get dot size based on component size
  const getDotSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 10;
      case 'large':
        return 12;
      default:
        return 10;
    }
  };
  
  // Get text style based on component size
  const getTextStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'medium':
        return styles.textMedium;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Colored dot or icon indicating freshness */}
      <View style={[
        styles.dot, 
        { 
          width: getDotSize(), 
          height: getDotSize(),
          backgroundColor: getColor() 
        }
      ]} />
      
      {/* Time text */}
      <Text style={[
        styles.text,
        getTextStyle(),
        { color: getColor() }
      ]}>
        {label || `Updated ${timeText}`}
      </Text>
      
      {/* Refresh button if provided */}
      {onRefresh && (
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading}
        >
          <Ionicons 
            name={loading ? 'reload' : 'refresh'} 
            size={size === 'small' ? 14 : 16} 
            color={theme.colors.text.secondary}
            style={[
              styles.refreshIcon,
              loading && styles.rotating
            ]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
    marginRight: 6,
  },
  text: {
    fontFamily: theme.typography.fonts.primary.regular,
  },
  textSmall: {
    ...theme.typography.styles.caption,
  },
  textMedium: {
    ...theme.typography.styles.body2,
  },
  textLarge: {
    ...theme.typography.styles.body1,
  },
  refreshButton: {
    marginLeft: 6,
    padding: 2,
  },
  refreshIcon: {
    opacity: 0.8,
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
});

export default DataFreshnessIndicator;