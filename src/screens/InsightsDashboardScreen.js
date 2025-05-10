/**
 * Insights Dashboard Screen
 * Main screen for viewing, creating, and managing insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import GradientBackground from '../components/GradientBackground';
import GlassmorphicCard from '../components/GlassmorphicCard';
import Button from '../components/Button';
import InsightGenerator from '../components/InsightGenerator';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * Format relative time
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
  }
  if (diffHour > 0) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  }
  if (diffMin > 0) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }
  return 'Just now';
};

/**
 * InsightsDashboardScreen component
 * @returns {React.ReactElement} - Rendered component
 */
export default function InsightsDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratorVisible, setIsGeneratorVisible] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
  
  // Fetch insights from API
  const fetchInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/api/insights');
      setInsights(response.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial data loading
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);
  
  // Handle refresh
  const handleRefresh = () => {
    fetchInsights();
  };
  
  // Show insight detail
  const handleShowInsight = (insight) => {
    setSelectedInsight(insight);
    setIsInsightModalVisible(true);
  };
  
  // Handle new insight generated
  const handleInsightGenerated = (insight, shouldSave = false) => {
    // Add the new insight to the list
    setInsights(prevInsights => [insight, ...prevInsights]);
    
    // Close the generator
    if (shouldSave) {
      setIsGeneratorVisible(false);
    }
  };
  
  // Get data source name
  const getSourceName = (sourceId) => {
    const sources = {
      'journal': 'Journal',
      'health': 'Health Metrics',
      'social': 'Social Media',
      'ai-template': 'AI Analysis',
      'multi-source': 'Multiple Sources'
    };
    
    return sources[sourceId] || 'Unknown Source';
  };
  
  // Get icon for insight type
  const getInsightTypeIcon = (type) => {
    const icons = {
      'pattern': 'ios-analytics-outline',
      'correlation': 'ios-git-compare-outline',
      'generated': 'ios-sparkles-outline',
      'complex': 'ios-grid-outline'
    };
    
    return icons[type] || 'ios-document-text-outline';
  };
  
  // Render an insight card
  const renderInsightCard = (insight) => {
    return (
      <TouchableOpacity
        key={insight.id}
        onPress={() => handleShowInsight(insight)}
        style={styles.insightCardContainer}
      >
        <GlassmorphicCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightSource}>
              <Ionicons 
                name={getInsightTypeIcon(insight.type)} 
                size={16} 
                color="rgba(255, 255, 255, 0.8)" 
              />
              <Text style={styles.sourceText}>
                {getSourceName(insight.source)}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {getRelativeTime(insight.timestamp)}
            </Text>
          </View>
          
          <Text style={styles.insightTitle}>{insight.title}</Text>
          
          <Text 
            style={styles.insightPreview}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {insight.content}
          </Text>
          
          <View style={styles.insightFooter}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Ionicons name="chevron-forward" size={16} color="#a388ff" />
          </View>
        </GlassmorphicCard>
      </TouchableOpacity>
    );
  };
  
  // Render insight detail modal
  const renderInsightModal = () => {
    if (!selectedInsight) return null;
    
    return (
      <Modal
        visible={isInsightModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsInsightModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 15, 60, 0.9)', 'rgba(10, 5, 30, 0.95)']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setIsInsightModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.insightSource}>
                <Ionicons 
                  name={getInsightTypeIcon(selectedInsight.type)} 
                  size={18} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
                <Text style={styles.sourceText}>
                  {getSourceName(selectedInsight.source)}
                </Text>
              </View>
              
              <Text style={styles.modalTitle}>{selectedInsight.title}</Text>
              
              <Text style={styles.insightDate}>
                {new Date(selectedInsight.timestamp).toLocaleString()}
              </Text>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.insightContent}>
                {selectedInsight.content}
              </Text>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.footerButton}>
                <Ionicons name="share-outline" size={20} color="#a388ff" />
                <Text style={styles.footerButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.footerButton}>
                <Ionicons name="document-text-outline" size={20} color="#a388ff" />
                <Text style={styles.footerButtonText}>Export</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.footerButton}>
                <Ionicons name="bookmark-outline" size={20} color="#a388ff" />
                <Text style={styles.footerButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </Modal>
    );
  };
  
  // Render the insight generator modal
  const renderInsightGenerator = () => {
    return (
      <Modal
        visible={isGeneratorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsGeneratorVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(30, 15, 60, 0.9)', 'rgba(10, 5, 30, 0.95)']}
            style={styles.generatorModalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Insight</Text>
              <TouchableOpacity 
                onPress={() => setIsGeneratorVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <InsightGenerator
                userData={{}}  // This would contain real user data from sources
                onInsightGenerated={handleInsightGenerated}
                onError={(err) => console.error(err)}
              />
            </ScrollView>
          </LinearGradient>
        </BlurView>
      </Modal>
    );
  };
  
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>
              Personalized understanding of your data
            </Text>
          </View>
          
          <Button
            title="New Insight"
            variant="primary"
            size="small"
            iconLeft="add"
            onPress={() => setIsGeneratorVisible(true)}
          />
        </View>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#a388ff"
              colors={["#a388ff"]}
            />
          }
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="Retry"
                variant="outline"
                size="small"
                onPress={handleRefresh}
                style={styles.retryButton}
              />
            </View>
          ) : insights.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bulb-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>
                No insights yet. Connect your data sources and generate your first insight.
              </Text>
              <Button
                title="Generate New Insight"
                variant="primary"
                iconLeft="sparkles-outline"
                onPress={() => setIsGeneratorVisible(true)}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View style={styles.insightsGrid}>
              {insights.map(insight => renderInsightCard(insight))}
            </View>
          )}
        </ScrollView>
        
        {renderInsightModal()}
        {renderInsightGenerator()}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCardContainer: {
    width: '100%',
    marginBottom: 15,
  },
  insightCard: {
    padding: 15,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightSource: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 5,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  insightPreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 10,
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: '#a388ff',
    marginRight: 5,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  generatorModalContent: {
    width: '100%',
    height: '100%',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  insightDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  modalBody: {
    padding: 20,
  },
  insightContent: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  footerButtonText: {
    color: '#a388ff',
    marginLeft: 5,
    fontSize: 14,
  },
});