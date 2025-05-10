/**
 * Visualization component for data connections and insights
 */
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Dimensions,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  G, 
  Circle, 
  Path, 
  Line, 
  Defs, 
  RadialGradient, 
  Stop 
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

// Get screen dimensions
const { width: WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = WIDTH * 0.65;

/**
 * Component to visualize data connections between sources and insights
 * @param {Object} props - Component props
 * @param {Array} props.dataSources - Array of connected data sources
 * @param {Array} props.insights - Array of generated insights
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const DataConnectionVisualizer = ({ dataSources = [], insights = [], style }) => {
  // Animation values for nodes
  const [opacityAnim] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(0));
  
  // Coordinates for the center node
  const centerX = CIRCLE_SIZE / 2;
  const centerY = CIRCLE_SIZE / 2;
  const radius = CIRCLE_SIZE * 0.32;
  
  // Process connection data
  const processedSources = dataSources.slice(0, 5).map((source, index) => {
    // Calculate position on circle for the source
    const angle = (index * (2 * Math.PI / Math.max(5, dataSources.length))) - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Determine source icon based on its type
    let icon;
    switch (source.sourceType) {
      case 'google':
        icon = 'logo-google';
        break;
      case 'twitter':
        icon = 'logo-twitter';
        break;
      case 'spotify':
        icon = 'musical-notes';
        break;
      case 'instagram':
        icon = 'logo-instagram';
        break;
      default:
        icon = 'cloud-outline';
    }
    
    return {
      ...source,
      x,
      y,
      icon,
    };
  });
  
  // Process insight data
  const processedInsights = insights.slice(0, 3).map((insight, index) => {
    // Calculate position on circle for the insight
    const insightsCount = Math.min(insights.length, 3);
    const angle = (index * (Math.PI / Math.max(3, insightsCount)) + Math.PI / 4);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    // Determine insight icon based on its type
    let icon;
    switch (insight.type) {
      case 'behavioral':
        icon = 'footsteps-outline';
        break;
      case 'creative':
        icon = 'bulb-outline';
        break;
      case 'emotional':
        icon = 'heart-outline';
        break;
      default:
        icon = 'analytics-outline';
    }
    
    return {
      ...insight,
      x,
      y,
      icon,
    };
  });
  
  // Start animations on mount
  React.useEffect(() => {
    // Fade in animation
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Interpolate pulse animation for glow effect
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { opacity: opacityAnim }
      ]}
    >
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
        {/* Definitions for gradients */}
        <Defs>
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={theme.colors.accent.primary} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={theme.colors.accent.primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        {/* Background glow */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.9}
          fill="url(#centerGlow)"
          opacity={glowOpacity}
        />
        
        {/* Connection lines for data sources */}
        {processedSources.map((source, index) => (
          <Line
            key={`source-line-${index}`}
            x1={centerX}
            y1={centerY}
            x2={source.x}
            y2={source.y}
            stroke={theme.colors.accent.primary}
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeDasharray="5,5"
          />
        ))}
        
        {/* Connection lines for insights */}
        {processedInsights.map((insight, index) => (
          <Line
            key={`insight-line-${index}`}
            x1={centerX}
            y1={centerY}
            x2={insight.x}
            y2={insight.y}
            stroke={theme.colors.accent.secondary}
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        ))}
        
        {/* Center node representing the user/app */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.2}
          fill="rgba(168, 148, 255, 0.3)"
          stroke={theme.colors.accent.primary}
          strokeWidth="2"
        />
      </Svg>
      
      {/* Render data source nodes */}
      {processedSources.map((source, index) => (
        <View
          key={`source-node-${index}`}
          style={[
            styles.node,
            styles.sourceNode,
            {
              left: source.x - 20,
              top: source.y - 20,
            }
          ]}
        >
          <Ionicons name={source.icon} size={20} color={theme.colors.text.primary} />
        </View>
      ))}
      
      {/* Render insight nodes */}
      {processedInsights.map((insight, index) => (
        <View
          key={`insight-node-${index}`}
          style={[
            styles.node,
            styles.insightNode,
            {
              left: insight.x - 20,
              top: insight.y - 20,
            }
          ]}
        >
          <Ionicons name={insight.icon} size={20} color={theme.colors.text.primary} />
        </View>
      ))}
      
      {/* Center icon */}
      <View style={styles.centerIcon}>
        <Ionicons name="person" size={24} color={theme.colors.text.primary} />
      </View>
      
      {/* Data status text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>
          {dataSources.length > 0 
            ? `${dataSources.length} Sources Connected` 
            : 'No Data Sources Connected'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {insights.length > 0 
            ? `${insights.length} Insights Generated` 
            : 'Connect data to generate insights'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  sourceNode: {
    backgroundColor: 'rgba(52, 52, 75, 0.8)',
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
  },
  insightNode: {
    backgroundColor: 'rgba(52, 52, 75, 0.8)',
    borderWidth: 2,
    borderColor: theme.colors.accent.secondary,
  },
  centerIcon: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.14,
    height: CIRCLE_SIZE * 0.14,
    borderRadius: CIRCLE_SIZE * 0.07,
    backgroundColor: 'rgba(52, 52, 75, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    left: '50%',
    top: '50%',
    marginLeft: -CIRCLE_SIZE * 0.07,
    marginTop: -CIRCLE_SIZE * 0.07,
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  statusContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  statusTitle: {
    ...theme.typography.styles.subtitle,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statusSubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
});

export default DataConnectionVisualizer;