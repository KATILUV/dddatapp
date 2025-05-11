/**
 * Custom hook for managing insights with offline support
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useOffline } from '../contexts/OfflineContext';

const useInsights = () => {
  // State
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: null,
    category: null,
    starred: false,
    searchQuery: '',
    sort: 'newest'
  });
  
  // Offline context
  const { 
    fetchWithOfflineSupport, 
    performOfflineAction,
    isOnline
  } = useOffline();
  
  // Fetch insights with offline support
  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await fetchWithOfflineSupport('/api/insights', {}, 'insights');
      
      if (result && result.data) {
        setInsights(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      Alert.alert(
        'Error',
        'Failed to load insights. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithOfflineSupport]);
  
  // Initial fetch
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);
  
  // Apply filters and sorting when insights or filters change
  useEffect(() => {
    let filtered = [...insights];
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(insight => insight.type === filters.type);
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(insight => insight.category === filters.category);
    }
    
    // Apply starred filter
    if (filters.starred) {
      filtered = filtered.filter(insight => insight.isStarred);
    }
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(query) ||
        insight.summary.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'relevance':
        filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        break;
      case 'confidence':
        filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredInsights(filtered);
  }, [insights, filters]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      type: null,
      category: null,
      starred: false,
      searchQuery: '',
      sort: 'newest'
    });
  }, []);
  
  // Get categories and types from insights
  const getMetadata = useCallback(() => {
    const categories = new Set();
    const types = new Set();
    
    insights.forEach(insight => {
      if (insight.category) categories.add(insight.category);
      if (insight.type) types.add(insight.type);
    });
    
    return {
      categories: [...categories],
      types: [...types]
    };
  }, [insights]);
  
  // Star/unstar an insight
  const starInsight = useCallback(async (insightId, starred) => {
    try {
      // Optimistic update
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isStarred: starred } 
          : insight
      ));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'star',
        'insight',
        { id: insightId, starred }
      );
      
      if (!result.success) {
        // Revert optimistic update if failed
        setInsights(prev => prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, isStarred: !starred } 
            : insight
        ));
        
        Alert.alert(
          'Error',
          'Failed to update insight. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to star insight:', error);
      
      // Revert optimistic update
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isStarred: !starred } 
          : insight
      ));
      
      Alert.alert(
        'Error',
        'Failed to update insight. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction]);
  
  // Archive/unarchive an insight
  const archiveInsight = useCallback(async (insightId, archived) => {
    try {
      // Optimistic update
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isArchived: archived } 
          : insight
      ));
      
      // Perform the action with offline support
      const result = await performOfflineAction(
        'archive',
        'insight',
        { id: insightId, archived }
      );
      
      if (!result.success) {
        // Revert optimistic update if failed
        setInsights(prev => prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, isArchived: !archived } 
            : insight
        ));
        
        Alert.alert(
          'Error',
          'Failed to update insight. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to archive insight:', error);
      
      // Revert optimistic update
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, isArchived: !archived } 
          : insight
      ));
      
      Alert.alert(
        'Error',
        'Failed to update insight. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction]);
  
  // Export an insight
  const exportInsight = useCallback(async (insightId, destination) => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'Exporting insights requires an internet connection.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    try {
      const result = await performOfflineAction(
        'export',
        'insight',
        { id: insightId, destination }
      );
      
      if (!result.success) {
        Alert.alert(
          'Error',
          'Failed to export insight. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to export insight:', error);
      
      Alert.alert(
        'Error',
        'Failed to export insight. Please try again later.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [performOfflineAction, isOnline]);
  
  return {
    insights: filteredInsights,
    allInsights: insights,
    isLoading,
    filters,
    updateFilters,
    resetFilters,
    refreshInsights: fetchInsights,
    getMetadata,
    starInsight,
    archiveInsight,
    exportInsight
  };
};

export default useInsights;