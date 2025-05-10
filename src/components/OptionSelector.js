/**
 * Option selector component for choosing from a list of options
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassmorphicCard from './GlassmorphicCard';
import theme from '../theme';

/**
 * Selectable option card with icon, title, and description
 * @param {Object} props - Component props
 * @param {string} props.title - Option title
 * @param {string} props.description - Option description
 * @param {string} props.icon - Icon name from Ionicons
 * @param {boolean} props.selected - Whether this option is selected
 * @param {Function} props.onSelect - Callback function when option is selected
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
const OptionSelector = ({
  title,
  description,
  icon,
  selected = false,
  onSelect,
  style,
}) => {
  return (
    <GlassmorphicCard
      onPress={onSelect}
      style={[styles.container, style]}
      isActive={selected}
      intensity={selected ? 'high' : 'medium'}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
          <Ionicons
            name={icon}
            size={24}
            color={selected ? theme.colors.text.inverse : theme.colors.accent.primary}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.selectedTitle]}>
            {title}
          </Text>
          <Text style={styles.description}>
            {description}
          </Text>
        </View>
        
        {selected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={theme.colors.accent.primary}
            />
          </View>
        )}
      </View>
    </GlassmorphicCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: theme.spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 148, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  selectedIconContainer: {
    backgroundColor: theme.colors.accent.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.styles.bodyLarge,
    fontFamily: theme.typography.fonts.primary.medium,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  selectedTitle: {
    color: theme.colors.accent.primary,
  },
  description: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
  checkmarkContainer: {
    marginLeft: theme.spacing.sm,
  },
});

export default OptionSelector;