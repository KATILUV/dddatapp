/**
 * Emotional trend visualization component
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { G, Path, Svg, Circle, Line, Text as SvgText } from 'react-native-svg';
import theme from '../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Component to visualize emotional trends over time
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of emotional data points
 * @param {string} props.primaryEmotion - The primary emotion identified
 * @param {Object} props.distribution - Emotion distribution object
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const EmotionalTrendChart = ({ 
  data = [],
  primaryEmotion = 'neutral',
  distribution = {},
  style 
}) => {
  // Color mapping for emotions
  const emotionColors = {
    joy: '#FFD166', // gold
    sadness: '#118AB2', // blue
    anger: '#EF476F', // red
    fear: '#073B4C', // dark blue
    disgust: '#8338EC', // purple
    surprise: '#06D6A0', // teal
    neutral: '#AAAAAA', // gray
  };
  
  // Set default data if none provided
  const sampleData = [
    { date: '2023-04-01', emotion: 'neutral', intensity: 0.4 },
    { date: '2023-04-02', emotion: 'joy', intensity: 0.7 },
    { date: '2023-04-03', emotion: 'joy', intensity: 0.8 },
    { date: '2023-04-04', emotion: 'sadness', intensity: 0.5 },
    { date: '2023-04-05', emotion: 'anger', intensity: 0.6 },
    { date: '2023-04-06', emotion: 'neutral', intensity: 0.3 },
    { date: '2023-04-07', emotion: 'joy', intensity: 0.9 },
  ];
  
  const chartData = data.length > 0 ? data : sampleData;
  
  // Derived properties
  const chartWidth = screenWidth - (theme.spacing.lg * 2) - 40;
  const chartHeight = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;
  
  // Calculate path for line chart
  const generateLinePath = () => {
    if (chartData.length === 0) return '';
    
    const xStep = graphWidth / (chartData.length - 1);
    
    return chartData.reduce((path, point, index) => {
      const x = padding.left + (index * xStep);
      const y = padding.top + graphHeight - (point.intensity * graphHeight);
      
      return `${path} ${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }, '');
  };

  // Distribution bars
  const distributionData = distribution && Object.keys(distribution).length > 0 
    ? distribution 
    : {
        joy: 0.4,
        sadness: 0.2,
        anger: 0.1,
        neutral: 0.3
      };
  
  const distributionKeys = Object.keys(distributionData);
  const distributionBarWidth = graphWidth / distributionKeys.length;
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Emotional Trends</Text>
      
      <View style={styles.summaryRow}>
        <View style={styles.emotionBadge}>
          <View 
            style={[
              styles.emotionIndicator, 
              { backgroundColor: emotionColors[primaryEmotion.toLowerCase()] || emotionColors.neutral }
            ]} 
          />
          <Text style={styles.primaryEmotionText}>
            {primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1)}
          </Text>
        </View>
        <Text style={styles.summaryText}>Primary Emotion</Text>
      </View>
      
      {/* Line chart for emotional trend */}
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + graphHeight}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        
        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={padding.top + graphHeight}
          x2={padding.left + graphWidth}
          y2={padding.top + graphHeight}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        
        {/* Y-axis labels */}
        <SvgText
          x={5}
          y={padding.top + 5}
          fill={theme.colors.text.tertiary}
          fontSize="8"
        >
          High
        </SvgText>
        
        <SvgText
          x={5}
          y={padding.top + graphHeight}
          fill={theme.colors.text.tertiary}
          fontSize="8"
        >
          Low
        </SvgText>
        
        {/* Line for emotional intensity */}
        <Path
          d={generateLinePath()}
          fill="none"
          stroke={theme.colors.accent.primary}
          strokeWidth="2"
        />
        
        {/* Data points with emotion colors */}
        {chartData.map((point, index) => {
          const xStep = graphWidth / (chartData.length - 1);
          const x = padding.left + (index * xStep);
          const y = padding.top + graphHeight - (point.intensity * graphHeight);
          
          return (
            <G key={index}>
              <Circle
                cx={x}
                cy={y}
                r={4}
                fill={emotionColors[point.emotion] || emotionColors.neutral}
                stroke={theme.colors.background.primary}
                strokeWidth="1"
              />
            </G>
          );
        })}
      </Svg>
      
      {/* Distribution bars */}
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Emotion Distribution</Text>
        <View style={styles.distributionChart}>
          {distributionKeys.map((emotion, index) => (
            <View key={emotion} style={styles.distributionBarContainer}>
              <View 
                style={[
                  styles.distributionBar,
                  {
                    height: `${distributionData[emotion] * 100}%`,
                    backgroundColor: emotionColors[emotion] || emotionColors.neutral,
                    width: distributionBarWidth - 10,
                  }
                ]}
              />
              <Text style={styles.distributionLabel}>{emotion}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    width: '100%',
  },
  title: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  emotionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  primaryEmotionText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
  },
  summaryText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
  },
  distributionContainer: {
    marginTop: theme.spacing.md,
  },
  distributionTitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  distributionChart: {
    flexDirection: 'row',
    height: 100,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  distributionBarContainer: {
    alignItems: 'center',
  },
  distributionBar: {
    minHeight: 5,
  },
  distributionLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});

export default EmotionalTrendChart;