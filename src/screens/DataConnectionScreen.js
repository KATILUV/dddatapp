import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

import Header from '../components/Header';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import { storeData } from '../utils/storage';
import theme from '../theme';

const { width } = Dimensions.get('window');

const dataSourceOptions = [
  {
    id: 'google',
    name: 'Google Takeout',
    icon: 'chrome',
    description: 'Upload Google export data (activity, search, etc)',
    formats: ['.zip', '.json'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    description: 'Upload Instagram data export (photos, activity)',
    formats: ['.zip', '.json'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'video',
    description: 'Upload TikTok data archive (activity, profile)',
    formats: ['.zip', '.json'],
  },
  {
    id: 'apple_notes',
    name: 'Apple Notes',
    icon: 'file-text',
    description: 'Upload exported Apple Notes files',
    formats: ['.zip', '.txt', '.pdf'],
  },
  {
    id: 'journals',
    name: 'Journal Entries',
    icon: 'book',
    description: 'Upload text documents with journal entries',
    formats: ['.txt', '.md', '.pdf'],
  },
];

const DataConnectionScreen = ({ navigation }) => {
  const [connectedSources, setConnectedSources] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  
  useEffect(() => {
    // Start entrance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(
      300, 
      withTiming(1, { duration: 800 })
    );
    cardScale.value = withDelay(
      300,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    
    // Load previously connected sources
    const loadConnectedSources = async () => {
      try {
        const sources = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + 'connectedSources.json'
        );
        setConnectedSources(JSON.parse(sources));
      } catch (error) {
        // First time - no file exists yet
        console.log('No connected sources file found, creating new');
        await FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + 'connectedSources.json',
          JSON.stringify({})
        );
      }
    };
    
    loadConnectedSources();
  }, []);
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  
  const cardAnimation = (index) => {
    return useAnimatedStyle(() => {
      const delay = index * 100;
      
      return {
        opacity: withDelay(
          delay,
          withTiming(1, { duration: 500 })
        ),
        transform: [
          {
            translateY: withDelay(
              delay,
              withTiming(0, { 
                duration: 600, 
                easing: Easing.out(Easing.cubic) 
              })
            )
          },
          {
            scale: withDelay(
              delay,
              withTiming(1, { 
                duration: 500, 
                easing: Easing.out(Easing.cubic) 
              })
            )
          }
        ]
      };
    });
  };
  
  const handleSelectDataSource = (source) => {
    setSelectedSource(source);
    pickDocument(source);
  };
  
  const pickDocument = async (source) => {
    try {
      setUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        // Check file format
        const fileExtension = result.name.split('.').pop().toLowerCase();
        const isValidFormat = source.formats.includes(`.${fileExtension}`);
        
        if (!isValidFormat) {
          Alert.alert(
            'Invalid File Format',
            `Please upload one of the following formats: ${source.formats.join(', ')}`,
            [{ text: 'OK' }]
          );
          setUploading(false);
          return;
        }
        
        // Save file metadata to local storage
        const sourcesDirectory = FileSystem.documentDirectory + 'data_sources/';
        const sourceDirectory = sourcesDirectory + source.id + '/';
        
        // Ensure directories exist
        await FileSystem.makeDirectoryAsync(sourcesDirectory, { intermediates: true }).catch(() => {});
        await FileSystem.makeDirectoryAsync(sourceDirectory, { intermediates: true }).catch(() => {});
        
        // Save file metadata
        const now = new Date();
        const fileMetadata = {
          id: source.id,
          name: source.name,
          fileName: result.name,
          fileSize: result.size,
          fileUri: result.uri,
          dateConnected: now.toISOString(),
        };
        
        // Save metadata to file
        await FileSystem.writeAsStringAsync(
          sourceDirectory + 'metadata.json',
          JSON.stringify(fileMetadata)
        );
        
        // Update connected sources in memory and storage
        const updatedSources = {
          ...connectedSources,
          [source.id]: {
            ...fileMetadata,
            dateConnected: now.toISOString(),
          },
        };
        
        setConnectedSources(updatedSources);
        
        await FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + 'connectedSources.json',
          JSON.stringify(updatedSources)
        );
        
        // Store relevant data for the AI to process later
        await storeData(`sourceConnected_${source.id}`, {
          ...fileMetadata,
          dateConnected: now.toISOString(),
        });
        
        Alert.alert(
          'Connection Successful',
          `Successfully connected your ${source.name} data.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Connection Failed',
        'There was an error connecting your data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
      setSelectedSource(null);
    }
  };
  
  const renderSourceCard = (source, index) => {
    const isConnected = connectedSources[source.id];
    const isUploading = uploading && selectedSource?.id === source.id;
    
    return (
      <Animated.View 
        key={source.id} 
        style={[
          styles.sourceCardContainer,
          { opacity: 0, transform: [{ translateY: 20 }, { scale: 0.95 }] },
          cardAnimation(index)
        ]}
      >
        <GlassmorphicCard 
          variant={isConnected ? 'accent' : 'default'}
          hoverEffect={true}
          style={styles.sourceCard}
        >
          <TouchableOpacity
            style={styles.sourceContent}
            onPress={() => handleSelectDataSource(source)}
            disabled={isUploading}
          >
            <View style={styles.sourceHeader}>
              <View style={styles.sourceIconContainer}>
                <Feather 
                  name={source.icon} 
                  size={24} 
                  color={theme.colors.text.primary} 
                />
              </View>
              <View style={styles.sourceTextContainer}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceDescription}>{source.description}</Text>
              </View>
            </View>
            
            <View style={styles.sourceStatus}>
              {isUploading ? (
                <Text style={styles.uploadingText}>Uploading...</Text>
              ) : isConnected ? (
                <View style={styles.connectedIndicator}>
                  <Feather 
                    name="check-circle" 
                    size={16} 
                    color={theme.colors.accent.primary} 
                    style={styles.connectedIcon}
                  />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              ) : (
                <Button
                  title="Connect"
                  variant="outline"
                  size="small"
                  onPress={() => handleSelectDataSource(source)}
                />
              )}
            </View>
          </TouchableOpacity>
        </GlassmorphicCard>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={headerStyle}>
        <Header
          title="Connect Your Data"
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.title}>Select a data source</Text>
          <Text style={styles.description}>
            Connect your digital data to help Voa understand you better.
            Your data stays on your device - you're in control.
          </Text>
          
          <View style={styles.sourcesContainer}>
            {dataSourceOptions.map((source, index) => 
              renderSourceCard(source, index)
            )}
          </View>
          
          <View style={styles.privacyNoteContainer}>
            <Text style={styles.privacyNote}>
              Your data privacy is our priority. All data is processed locally on your device and never sent to external servers without your explicit consent.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fonts.serif.bold,
    fontSize: theme.typography.sizes.heading2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.s,
  },
  description: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeights.body,
  },
  sourcesContainer: {
    marginTop: theme.spacing.l,
  },
  sourceCardContainer: {
    marginBottom: theme.spacing.l,
  },
  sourceCard: {
    marginVertical: theme.spacing.xs,
  },
  sourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 148, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  sourceTextContainer: {
    flex: 1,
  },
  sourceName: {
    fontFamily: theme.typography.fonts.serif.medium,
    fontSize: theme.typography.sizes.heading4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sourceDescription: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.bodySmall,
  },
  sourceStatus: {
    marginLeft: theme.spacing.m,
  },
  uploadingText: {
    fontFamily: theme.typography.fonts.mono.medium,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.accent.primary,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedIcon: {
    marginRight: theme.spacing.xs,
  },
  connectedText: {
    fontFamily: theme.typography.fonts.mono.medium,
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.accent.primary,
  },
  privacyNoteContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(35, 35, 60, 0.4)',
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.accent.primary,
  },
  privacyNote: {
    fontFamily: theme.typography.fonts.serif.regular,
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.caption,
  },
});

export default DataConnectionScreen;
