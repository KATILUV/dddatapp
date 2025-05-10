/**
 * Custom text input component with styling consistent with the app theme
 */
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

/**
 * Styled text input field
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Function called when text changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.secureTextEntry - Whether to hide text (for passwords)
 * @param {string} props.label - Label text to display above input
 * @param {string} props.error - Error message to display
 * @param {Object} props.style - Additional styles for container
 * @param {Object} props.inputStyle - Additional styles for text input
 * @returns {React.ReactElement} - Rendered component
 */
const InputField = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  label,
  error,
  style,
  inputStyle,
  ...restProps
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          error && styles.inputContainerError
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.colors.accent.primary}
          {...restProps}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={toggleShowPassword}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    height: theme.heights.input,
    paddingHorizontal: theme.spacing.md,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: theme.colors.accent.primary,
    backgroundColor: 'rgba(168, 148, 255, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.accent.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainerError: {
    borderColor: theme.colors.error.default,
  },
  input: {
    flex: 1,
    ...theme.typography.styles.bodyRegular,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
    height: '100%',
  },
  visibilityToggle: {
    padding: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error.default,
    marginTop: theme.spacing.xs,
  },
});

export default InputField;