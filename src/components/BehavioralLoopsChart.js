/**
 * Behavioral loops visualization component
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { G, Path, Svg, Circle, Text as SvgText } from 'react-native-svg';
import theme from '../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Component to visualize behavioral loops and patterns
 * @param {Object} props - Component props
 * @param {Array} props.patterns - Array of behavioral pattern objects
 * @param {Array} props.loops - Array of behavioral loop objects
 * @param {Array} props.insights - Array of insight strings
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const BehavioralLoopsChart = ({ 
  patterns = [],
  loops = [],
  insights = [],
  style 
}) => {
  // Set default data if none provided
  const defaultPatterns = [
    { name: 'Morning Routine', frequency: 0.95, trigger: 'Alarm', response: 'Check phone' },
    { name: 'Work Focus', frequency: 0.75, trigger: 'Opening laptop', response: 'Start with email' },
    { name: 'Evening Unwinding', frequency: 0.6, trigger: 'After dinner', response: 'Social media' },
  ];
  
  const defaultLoops = [
    { 
      trigger: 'Notification', 
      action: 'Check phone', 
      reward: 'Dopamine from new content', 
      frequency: 'High (15-20x daily)' 
    },
    { 
      trigger: 'Boredom', 
      action: 'Open social media', 
      reward: 'Entertainment', 
      frequency: 'Medium (5-10x daily)' 
    },
    { 
      trigger: 'Stress', 
      action: 'News checking', 
      reward: 'Sense of control', 
      frequency: 'Low (2-3x daily)' 
    },
  ];
  
  const defaultInsights = [
    'Phone checking behavior is triggered by notifications 85% of the time',
    'Social media usage peaks in the evening hours between 8-10 PM',
    'Productivity apps are used most frequently in the morning',
  ];
  
  // Use provided data or defaults
  const patternData = patterns.length > 0 ? patterns : defaultPatterns;
  const loopData = loops.length > 0 ? loops : defaultLoops;
  const insightData = insights.length > 0 ? insights : defaultInsights;
  
  // Chart dimensions
  const chartWidth = screenWidth - (theme.spacing.lg * 2) - 40;
  
  // Function to generate circular loop paths for SVG
  const generateLoopPath = (index, total) => {
    const centerX = chartWidth / 2;
    const centerY = 150;
    const radius = 80;
    const startAngle = (index / total) * 2 * Math.PI;
    const endAngle = ((index + 1) / total) * 2 * Math.PI;
    
    // Calculate points on the circle
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    // Calculate control points for the arc (to make it curve outward)
    const controlX = centerX + radius * 1.5 * Math.cos((startAngle + endAngle) / 2);
    const controlY = centerY + radius * 1.5 * Math.sin((startAngle + endAngle) / 2);
    
    // Generate SVG path
    return `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
  };
  
  // Colors for different parts of the loop
  const loopColors = {
    trigger: theme.colors.warning.default, // gold
    action: theme.colors.accent.primary, // purple
    reward: theme.colors.success.default, // teal
  };
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Behavioral Patterns</Text>
      
      {/* Pattern Frequency Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HIGH-FREQUENCY PATTERNS</Text>
        
        {patternData.map((pattern, index) => (
          <View key={pattern.name} style={styles.patternItem}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternName}>{pattern.name}</Text>
              <View 
                style={[
                  styles.frequencyIndicator, 
                  { width: `${pattern.frequency * 100}%` }
                ]}
              />
            </View>
            
            <View style={styles.patternFlow}>
              <View style={styles.patternPart}>
                <Text style={styles.patternLabel}>Trigger</Text>
                <Text style={styles.patternValue}>{pattern.trigger}</Text>
              </View>
              
              <Text style={styles.patternArrow}>→</Text>
              
              <View style={styles.patternPart}>
                <Text style={styles.patternLabel}>Response</Text>
                <Text style={styles.patternValue}>{pattern.response}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      {/* Behavioral Loops Visualization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BEHAVIORAL LOOPS</Text>
        
        <Svg width={chartWidth} height={300}>
          {/* Center text */}
          <SvgText
            x={chartWidth / 2}
            y={150}
            fill={theme.colors.text.primary}
            fontSize="12"
            textAnchor="middle"
          >
            Habit
          </SvgText>
          <SvgText
            x={chartWidth / 2}
            y={165}
            fill={theme.colors.text.primary}
            fontSize="12"
            textAnchor="middle"
          >
            Loops
          </SvgText>
          
          {/* Loop paths */}
          {loopData.map((loop, index) => (
            <G key={index}>
              <Path
                d={generateLoopPath(index, loopData.length)}
                fill="none"
                stroke={loopColors.action}
                strokeWidth="2"
                strokeDasharray="5,3"
              />
              
              {/* Loop elements */}
              <G>
                {/* Calculate positions around the circle */}
                {(() => {
                  const centerX = chartWidth / 2;
                  const centerY = 150;
                  const radius = 120;
                  const angle = ((index + 0.5) / loopData.length) * 2 * Math.PI;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  
                  return (
                    <>
                      <Circle
                        cx={x}
                        cy={y}
                        r={30}
                        fill="rgba(255, 255, 255, 0.05)"
                        stroke={loopColors.trigger}
                        strokeWidth="1"
                      />
                      
                      <SvgText
                        x={x}
                        y={y - 5}
                        fill={theme.colors.text.primary}
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {loop.trigger}
                      </SvgText>
                      
                      <SvgText
                        x={x}
                        y={y + 10}
                        fill={loopColors.reward}
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {loop.reward}
                      </SvgText>
                      
                      <SvgText
                        x={x}
                        y={y + 25}
                        fill={theme.colors.text.tertiary}
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {loop.frequency}
                      </SvgText>
                    </>
                  );
                })()}
              </G>
            </G>
          ))}
        </Svg>
      </View>
      
      {/* Key Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KEY INSIGHTS</Text>
        
        {insightData.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightNumber}>{index + 1}</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
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
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.md,
  },
  patternItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  patternHeader: {
    marginBottom: theme.spacing.sm,
  },
  patternName: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  frequencyIndicator: {
    height: 4,
    backgroundColor: theme.colors.accent.primary,
    borderRadius: 2,
  },
  patternFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patternPart: {
    flex: 1,
  },
  patternLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  patternValue: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.secondary,
  },
  patternArrow: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.accent.primary,
    marginHorizontal: theme.spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  insightNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 148, 255, 0.2)',
    textAlign: 'center',
    lineHeight: 24,
    ...theme.typography.styles.caption,
    color: theme.colors.accent.primary,
    marginRight: theme.spacing.sm,
  },
  insightText: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    flex: 1,
  },
});

export default BehavioralLoopsChart;