/**
 * Data Source Connector component
 * UI for browsing and connecting to various data sources
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import GlassmorphicCard from './GlassmorphicCard';
import Button from './Button';
import dataSourceManager, { DATA_SOURCE_TYPES } from '../services/dataSources/dataSourceManager';

/**
 * DataSourceConnector component
 * @param {Object} props - Component props
 * @param {function} props.onSourceConnected - Callback when source is connected
 * @param {function} props.onSourceDisconnected - Callback when source is disconnected
 * @param {string} props.filterType - Filter sources by type
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
export default function DataSourceConnector({
  onSourceConnected,
  onSourceDisconnected,
  filterType,
  style,
}) {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize and load data sources
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await dataSourceManager.initialize();
        
        let availableSources;
        if (filterType) {
          availableSources = dataSourceManager.getSourcesByType(filterType);
        } else {
          // Get sources for current platform
          const platform = Platform.OS === 'web' ? 'web' : Platform.OS;
          availableSources = dataSourceManager.getAvailableSources(platform);
        }
        
        setSources(availableSources);
      } catch (err) {
        console.error('Failed to initialize data sources:', err);
        setError('Failed to load available data sources');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [filterType]);
  
  // Handle source selection for viewing details
  const handleSelectSource = (source) => {
    setSelectedSource(source);
    setIsDetailsModalVisible(true);
  };
  
  // Handle source connection
  const handleConnectSource = async (source) => {
    try {
      setIsConnecting(true);
      
      // Connect to the data source
      const connectedSource = await dataSourceManager.connectSource(source.id);
      
      // Update UI to show the source as connected
      setSources(currentSources => 
        currentSources.map(s => s.id === source.id ? { ...s, connected: true } : s)
      );
      
      // Close the modal
      setIsDetailsModalVisible(false);
      
      // Callback
      if (onSourceConnected) {
        onSourceConnected(connectedSource);
      }
      
      // Show success message
      Alert.alert(
        'Connection Successful',
        `Successfully connected to ${source.name}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error(`Failed to connect to ${source.name}:`, err);
      
      Alert.alert(
        'Connection Failed',
        `Failed to connect to ${source.name}: ${err.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle source disconnection
  const handleDisconnectSource = async (source) => {
    try {
      setIsConnecting(true);
      
      // Confirm before disconnecting
      Alert.alert(
        'Confirm Disconnection',
        `Are you sure you want to disconnect from ${source.name}? This will remove access to your data.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsConnecting(false)
          },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              // Disconnect from the data source
              await dataSourceManager.disconnectSource(source.id);
              
              // Update UI to show the source as disconnected
              setSources(currentSources => 
                currentSources.map(s => s.id === source.id ? { ...s, connected: false } : s)
              );
              
              // Close the modal
              setIsDetailsModalVisible(false);
              
              // Callback
              if (onSourceDisconnected) {
                onSourceDisconnected(source);
              }
              
              setIsConnecting(false);
              
              // Show success message
              Alert.alert(
                'Disconnection Successful',
                `Successfully disconnected from ${source.name}`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    } catch (err) {
      console.error(`Failed to disconnect from ${source.name}:`, err);
      
      Alert.alert(
        'Disconnection Failed',
        `Failed to disconnect from ${source.name}: ${err.message}`,
        [{ text: 'OK' }]
      );
      
      setIsConnecting(false);
    }
  };
  
  // Get color for source type
  const getSourceTypeColor = (type) => {
    const colors = {
      [DATA_SOURCE_TYPES.HEALTH]: '#FF2D55',
      [DATA_SOURCE_TYPES.FITNESS]: '#AF52DE',
      [DATA_SOURCE_TYPES.MUSIC]: '#1DB954',
      [DATA_SOURCE_TYPES.PRODUCTIVITY]: '#FF9500',
      [DATA_SOURCE_TYPES.SOCIAL]: '#30B0C7',
      [DATA_SOURCE_TYPES.LOCATION]: '#5856D6',
      [DATA_SOURCE_TYPES.FINANCE]: '#34C759',
      [DATA_SOURCE_TYPES.CUSTOM]: '#A1A1A1',
    };
    
    return colors[type] || '#7F7F7F';
  };
  
  // Get label for source type
  const getSourceTypeLabel = (type) => {
    const labels = {
      [DATA_SOURCE_TYPES.HEALTH]: 'Health',
      [DATA_SOURCE_TYPES.FITNESS]: 'Fitness',
      [DATA_SOURCE_TYPES.MUSIC]: 'Music',
      [DATA_SOURCE_TYPES.PRODUCTIVITY]: 'Productivity',
      [DATA_SOURCE_TYPES.SOCIAL]: 'Social',
      [DATA_SOURCE_TYPES.LOCATION]: 'Location',
      [DATA_SOURCE_TYPES.FINANCE]: 'Finance',
      [DATA_SOURCE_TYPES.CUSTOM]: 'Custom',
    };
    
    return labels[type] || 'Unknown';
  };
  
  // Render a data source card
  const renderSourceCard = ({ item }) => {
    const isConnected = dataSourceManager.isSourceConnected(item.id);
    
    return (
      <TouchableOpacity
        style={styles.sourceCardContainer}
        onPress={() => handleSelectSource(item)}
      >
        <GlassmorphicCard style={styles.sourceCard}>
          <View style={styles.sourceCardContent}>
            <View style={styles.sourceIcon}>
              <Ionicons
                name={item.icon || 'ios-cube-outline'}
                size={24}
                color={item.color || '#FFFFFF'}
              />
            </View>
            
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{item.name}</Text>
              
              <View style={styles.sourceTypeContainer}>
                <View 
                  style={[
                    styles.sourceType, 
                    { backgroundColor: getSourceTypeColor(item.type) }
                  ]}
                >
                  <Text style={styles.sourceTypeText}>
                    {getSourceTypeLabel(item.type)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.sourceDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            
            <View style={styles.connectionStatus}>
              {isConnected ? (
                <View style={styles.connectedStatus}>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              ) : (
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              )}
            </View>
          </View>
        </GlassmorphicCard>
      </TouchableOpacity>
    );
  };
  
  // Render the source details modal
  const renderDetailsModal = () => {
    if (!selectedSource) return null;
    
    const isConnected = dataSourceManager.isSourceConnected(selectedSource.id);
    
    return (
      <Modal
        visible={isDetailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDetailsModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 15, 60, 0.9)', 'rgba(10, 5, 30, 0.95)']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.modalTitleContainer}>
                <Ionicons
                  name={selectedSource.icon || 'ios-cube-outline'}
                  size={28}
                  color={selectedSource.color || '#FFFFFF'}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>{selectedSource.name}</Text>
              </View>
              
              <View 
                style={[
                  styles.sourceType, 
                  { 
                    backgroundColor: getSourceTypeColor(selectedSource.type),
                    marginBottom: 10
                  }
                ]}
              >
                <Text style={styles.sourceTypeText}>
                  {getSourceTypeLabel(selectedSource.type)}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{selectedSource.description}</Text>
              
              <Text style={styles.sectionTitle}>Data Types</Text>
              <View style={styles.dataTypesContainer}>
                {selectedSource.dataTypes.map((dataType, index) => (
                  <View key={index} style={styles.dataTypeChip}>
                    <Text style={styles.dataTypeText}>
                      {dataType.replace(/-/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
              
              {selectedSource.requiresOAuth && (
                <View style={styles.infoContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#A388FF" />
                  <Text style={styles.infoText}>
                    Requires authentication with {selectedSource.name}
                  </Text>
                </View>
              )}
              
              {isConnected && (
                <View style={styles.infoContainer}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#34C759" />
                  <Text style={styles.infoText}>
                    Connected and ready to use
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalFooter}>
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#A388FF" />
                  <Text style={styles.loadingText}>
                    {isConnected ? 'Disconnecting...' : 'Connecting...'}
                  </Text>
                </View>
              ) : (
                <Button
                  title={isConnected ? 'Disconnect' : 'Connect'}
                  variant={isConnected ? 'outline' : 'primary'}
                  size="medium"
                  onPress={() => 
                    isConnected 
                      ? handleDisconnectSource(selectedSource)
                      : handleConnectSource(selectedSource)
                  }
                  iconLeft={isConnected ? 'log-out-outline' : 'link-outline'}
                  style={styles.actionButton}
                />
              )}
              
              <Button
                title="Cancel"
                variant="text"
                size="medium"
                onPress={() => setIsDetailsModalVisible(false)}
                style={styles.cancelButton}
              />
            </View>
          </LinearGradient>
        </BlurView>
      </Modal>
    );
  };
  
  // Render content based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#A388FF" />
          <Text style={styles.loadingText}>Loading data sources...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={36} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            variant="outline"
            size="small"
            onPress={() => {
              setIsLoading(true);
              dataSourceManager.initialize().finally(() => setIsLoading(false));
            }}
            style={styles.retryButton}
          />
        </View>
      );
    }
    
    if (sources.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Ionicons name="cube-outline" size={36} color="#A388FF" />
          <Text style={styles.emptyText}>
            {filterType
              ? `No ${getSourceTypeLabel(filterType)} data sources available`
              : 'No data sources available for your platform'}
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={sources}
        renderItem={renderSourceCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.sourcesList}
      />
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Content */}
      {renderContent()}
      
      {/* Details Modal */}
      {renderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
  },
  sourcesList: {
    padding: 15,
  },
  sourceCardContainer: {
    marginBottom: 15,
    width: '100%',
  },
  sourceCard: {
    padding: 0,
    overflow: 'hidden',
  },
  sourceCardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  sourceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sourceInfo: {
    flex: 1,
    marginRight: 10,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  sourceTypeContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  sourceType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  sourceTypeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sourceDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  connectionStatus: {
    justifyContent: 'center',
    padding: 5,
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    color: '#34C759',
    fontSize: 12,
    marginLeft: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 15,
  },
  dataTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dataTypeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  dataTypeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});