/**
 * Data chart visualization component
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../theme';

/**
 * Simple line chart visualization component
 * @param {Object} props - Component props
 * @param {Array} props.dataPoints - Array of data points between 0-1
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const DataChart = ({ dataPoints = [0.3, 0.6, 0.2, 0.8, 0.5], style }) => {
  // Generate points for the line
  const points = dataPoints.map((point, index) => {
    const segmentWidth = 100 / (dataPoints.length - 1);
    const xPercent = index * segmentWidth;
    const yPercent = 100 - point * 100;
    
    return {
      x: `${xPercent}%`,
      y: `${yPercent}%`,
    };
  });
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.chart}>
        {/* Line connecting the points */}
        <View style={styles.lineContainer}>
          {dataPoints.map((point, index) => {
            // Don't draw line for first point
            if (index === 0) return null;
            
            const prevPoint = points[index - 1];
            const currentPoint = points[index];
            
            // Calculate line length and angle
            const x1 = parseFloat(prevPoint.x);
            const y1 = parseFloat(prevPoint.y);
            const x2 = parseFloat(currentPoint.x);
            const y2 = parseFloat(currentPoint.y);
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            return (
              <View 
                key={`line-${index}`}
                style={[
                  styles.line,
                  {
                    width: `${length}%`,
                    left: prevPoint.x,
                    top: prevPoint.y,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left',
                  }
                ]}
              />
            );
          })}
        </View>
        
        {/* Data points */}
        {points.map((point, index) => (
          <View
            key={`point-${index}`}
            style={[
              styles.dataPoint,
              {
                left: point.x,
                top: point.y,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3,
    marginVertical: theme.spacing.md,
  },
  chart: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  lineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: theme.colors.accent.primary,
    opacity: 0.6,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent.primary,
    marginLeft: -4,
    marginTop: -4,
  },
});

export default DataChart;