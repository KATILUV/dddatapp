/**
 * Creative themes visualization component
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import theme from '../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Component to visualize creative themes in user content
 * @param {Object} props - Component props
 * @param {Array} props.themes - Array of theme objects with name, frequency, examples
 * @param {Array} props.keywords - Array of keyword objects with word, count
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const CreativeThemesChart = ({ 
  themes = [],
  keywords = [],
  style 
}) => {
  // Set default data if none provided
  const defaultThemes = [
    { name: 'Technology', frequency: 0.8, examples: ['AI', 'Coding', 'Mobile'] },
    { name: 'Travel', frequency: 0.6, examples: ['Adventure', 'Nature', 'Culture'] },
    { name: 'Personal Growth', frequency: 0.4, examples: ['Learning', 'Mindfulness', 'Goals'] },
    { name: 'Creativity', frequency: 0.3, examples: ['Design', 'Art', 'Writing'] },
  ];
  
  const defaultKeywords = [
    { word: 'AI', count: 24 },
    { word: 'Design', count: 18 },
    { word: 'Travel', count: 15 },
    { word: 'Coding', count: 12 },
    { word: 'Reading', count: 10 },
    { word: 'Nature', count: 8 },
    { word: 'Mindfulness', count: 7 },
    { word: 'Photography', count: 5 },
  ];
  
  // Use provided data or defaults
  const themeData = themes.length > 0 ? themes : defaultThemes;
  const keywordData = keywords.length > 0 ? keywords : defaultKeywords;
  
  // Sort themes by frequency
  const sortedThemes = [...themeData].sort((a, b) => b.frequency - a.frequency);
  
  // Sort keywords by count
  const sortedKeywords = [...keywordData].sort((a, b) => b.count - a.count).slice(0, 8);
  
  // Chart dimensions
  const chartWidth = screenWidth - (theme.spacing.lg * 2) - 40;
  const barHeight = 30;
  const barPadding = 10;
  const padding = { top: 10, right: 0, bottom: 10, left: 70 };
  
  // Get max keyword count for scaling
  const maxKeywordCount = sortedKeywords.length > 0 
    ? Math.max(...sortedKeywords.map(k => k.count))
    : 1;
  
  // Random pastel color generator for keywords
  const pastelColor = (seed) => {
    const hue = (seed * 137.5) % 360;
    return `hsl(${hue}, 70%, 75%)`;
  };
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Creative Themes</Text>
      
      {/* Themes Frequency Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme Frequency</Text>
        <Svg width={chartWidth} height={(barHeight + barPadding) * sortedThemes.length + padding.top + padding.bottom}>
          {sortedThemes.map((theme, index) => {
            const barWidth = (chartWidth - padding.left) * theme.frequency;
            const y = padding.top + index * (barHeight + barPadding);
            
            return (
              <React.Fragment key={theme.name}>
                {/* Theme name */}
                <SvgText
                  x={5}
                  y={y + barHeight / 2 + 5}
                  fill={theme.colors.text.primary}
                  fontSize="12"
                >
                  {theme.name}
                </SvgText>
                
                {/* Bar background */}
                <Rect
                  x={padding.left}
                  y={y}
                  width={chartWidth - padding.left}
                  height={barHeight}
                  fill="rgba(255, 255, 255, 0.05)"
                  rx={4}
                />
                
                {/* Bar for theme frequency */}
                <Rect
                  x={padding.left}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`rgba(168, 148, 255, ${0.3 + theme.frequency * 0.7})`}
                  rx={4}
                />
                
                {/* Percentage text */}
                <SvgText
                  x={padding.left + barWidth - 30}
                  y={y + barHeight / 2 + 5}
                  fill={theme.colors.text.primary}
                  fontSize="12"
                >
                  {Math.round(theme.frequency * 100)}%
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      
      {/* Theme Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Examples</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortedThemes.map((theme) => (
            <View key={theme.name} style={styles.exampleCard}>
              <Text style={styles.exampleTheme}>{theme.name}</Text>
              <View style={styles.exampleList}>
                {theme.examples.map((example, i) => (
                  <Text key={i} style={styles.exampleItem}>• {example}</Text>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Keywords Cloud */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Keywords</Text>
        <View style={styles.keywordCloud}>
          {sortedKeywords.map((keyword, index) => {
            // Calculate size based on count relative to max
            const relativeSize = (keyword.count / maxKeywordCount) * 0.6 + 0.4;
            const fontSize = 12 + (relativeSize * 10);
            
            return (
              <View
                key={keyword.word}
                style={[
                  styles.keywordBadge,
                  { backgroundColor: `${pastelColor(index)}20` },
                ]}
              >
                <Text 
                  style={[
                    styles.keywordText,
                    { fontSize, color: pastelColor(index) }
                  ]}
                >
                  {keyword.word}
                </Text>
              </View>
            );
          })}
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
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.tertiary,
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  exampleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 160,
  },
  exampleTheme: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  exampleList: {
    marginTop: theme.spacing.xs,
  },
  exampleItem: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  keywordCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },
  keywordBadge: {
    borderRadius: 16,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    margin: theme.spacing.xs,
  },
  keywordText: {
    ...theme.typography.styles.bodySmall,
  },
});

export default CreativeThemesChart;