import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline = false,
  maxLength,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  error,
  icon,
  style,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!value);
  
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null);
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    setShowPlaceholder(!(isFocused || value));
  }, [isFocused, value, animatedValue]);
  
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(168, 148, 255, 0.2)', 'rgba(168, 148, 255, 0.6)'],
  });
  
  const labelSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.typography.sizes.body, theme.typography.sizes.caption],
  });
  
  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [multiline ? 16 : 12, -10],
  });
  
  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.text.secondary, theme.colors.accent.primary],
  });
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  const renderCounter = () => {
    if (!maxLength) return null;
    
    return (
      <Text style={styles.counter}>
        {value ? value.length : 0}/{maxLength}
      </Text>
    );
  };
  
  return (
    <TouchableWithoutFeedback onPress={focusInput}>
      <View style={[styles.container, style]}>
        <Animated.View 
          style={[
            styles.inputContainer, 
            { borderColor: error ? theme.colors.ui.error : borderColor }
          ]}
        >
          <LinearGradient
            colors={['rgba(35, 35, 60, 0.5)', 'rgba(20, 20, 40, 0.3)']}
            style={styles.gradient}
          />
          
          <BlurView intensity={5} style={StyleSheet.absoluteFill}>
            <View style={StyleSheet.absoluteFill} />
          </BlurView>
          
          <Animated.Text 
            style={[
              styles.label, 
              { 
                top: labelTop, 
                fontSize: labelSize,
                color: error ? theme.colors.ui.error : labelColor,
              }
            ]}
          >
            {label}
          </Animated.Text>
          
          <View style={styles.inputWrapper}>
            {icon && <View style={styles.icon}>{icon}</View>}
            
            <TextInput
              ref={inputRef}
              style={[
                styles.input, 
                multiline && styles.multilineInput,
                icon && styles.inputWithIcon
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder={showPlaceholder ? placeholder : ''}
              placeholderTextColor={theme.colors.text.muted}
              secureTextEntry={secureTextEntry}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              maxLength={maxLength}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              autoFocus={autoFocus}
              selectionColor={theme.colors.accent.primary}
              blurOnSubmit={!multiline}
              textAlignVertical={multiline ? 'top' : 'center'}
            />
            
            {renderCounter()}
          </View>
        </Animated.View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.l,
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.s,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 60,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.borderRadius.medium,
  },
  label: {
    position: 'absolute',
    left: theme.spacing.m,
    fontFamily: theme.typography.fonts.mono.medium,
    color: theme.colors.text.secondary,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fonts.serif.regular,
    paddingVertical: Platform.OS === 'android' ? 8 : 12,
    height: Platform.OS === 'android' ? 48 : 'auto',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.s,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.s,
  },
  icon: {
    marginRight: theme.spacing.s,
  },
  counter: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing.s,
  },
  errorText: {
    color: theme.colors.ui.error,
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.fonts.mono.regular,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.s,
  },
});

export default InputField;
