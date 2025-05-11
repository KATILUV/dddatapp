/**
 * Custom hook for accessing and managing insights
 * Handles offline-first logic and synchronization
 */
import { useState, useEffect, useCallback } from 'react';
import { useOffline } from '../contexts/OfflineContext';

/**
 * Hook for fetching and managing insights
 * @param {Object} options - Configuration options
 * @param {string} options.category - Filter by category
 * @param {string} options.type - Filter by type
 * @param {boolean} options.starredOnly - Get only starred insights
 * @param {boolean} options.includeArchived - Include archived insights
 * @returns {Object} - Insights and management functions
 */
export default function useInsights({ 
  category = null, 
  type = null, 
  starredOnly = false,
  includeArchived = false
} = {}) {
  // State
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Get offline context
  const { 
    isOnline, 
    saveInsights, 
    getInsights, 
    queueOfflineAction, 
    syncNow 
  } = useOffline();
  
  /**
   * Fetch insights from API or local storage
   */
  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedInsights = [];
      
      if (isOnline) {
        // Fetch from API based on filters
        let endpoint = '/api/insights';
        
        if (category) {
          endpoint = `/api/insights/category/${category}`;
        } else if (type) {
          endpoint = `/api/insights/type/${type}`;
        } else if (starredOnly) {
          endpoint = '/api/insights/starred';
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        fetchedInsights = await response.json();
        
        // Update local storage
        await saveInsights(fetchedInsights);
      } else {
        // Fetch from local storage
        const storedInsights = await getInsights();
        
        if (!storedInsights) {
          throw new Error('No insights available offline');
        }
        
        // Apply filters client-side
        fetchedInsights = storedInsights.filter(insight => {
          // Apply category filter
          if (category && insight.category !== category) {
            return false;
          }
          
          // Apply type filter
          if (type && insight.type !== type) {
            return false;
          }
          
          // Apply starred filter
          if (starredOnly && !insight.starred) {
            return false;
          }
          
          // Apply archived filter
          if (!includeArchived && insight.archived) {
            return false;
          }
          
          return true;
        });
      }
      
      setInsights(fetchedInsights);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [category, type, starredOnly, includeArchived, isOnline]);
  
  // Fetch insights on mount and when filters change
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);
  
  /**
   * Star/unstar an insight
   * @param {number} id - Insight ID
   * @param {boolean} starred - Star status
   */
  const starInsight = useCallback(async (id, starred) => {
    try {
      // Optimistically update UI
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === id 
            ? { ...insight, starred } 
            : insight
        )
      );
      
      if (isOnline) {
        // Send to API
        const response = await fetch(`/api/insights/${id}/star`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ starred }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Update local storage
        const storedInsights = await getInsights();
        if (storedInsights) {
          await saveInsights(
            storedInsights.map(insight => 
              insight.id === id 
                ? { ...insight, starred } 
                : insight
            )
          );
        }
      } else {
        // Queue offline action
        await queueOfflineAction({
          type: 'STAR_INSIGHT',
          data: { id, starred },
        });
        
        // Update local storage
        const storedInsights = await getInsights();
        if (storedInsights) {
          await saveInsights(
            storedInsights.map(insight => 
              insight.id === id 
                ? { ...insight, starred } 
                : insight
            )
          );
        }
      }
    } catch (error) {
      console.error('Error starring insight:', error);
      
      // Revert optimistic update
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === id 
            ? { ...insight, starred: !starred } 
            : insight
        )
      );
      
      setError(error.message);
    }
  }, [isOnline]);
  
  /**
   * Archive/unarchive an insight
   * @param {number} id - Insight ID
   * @param {boolean} archived - Archive status
   */
  const archiveInsight = useCallback(async (id, archived) => {
    try {
      // Optimistically update UI
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === id 
            ? { ...insight, archived } 
            : insight
        )
      );
      
      if (isOnline) {
        // Send to API
        const response = await fetch(`/api/insights/${id}/archive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ archived }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Update local storage
        const storedInsights = await getInsights();
        if (storedInsights) {
          await saveInsights(
            storedInsights.map(insight => 
              insight.id === id 
                ? { ...insight, archived } 
                : insight
            )
          );
        }
      } else {
        // Queue offline action
        await queueOfflineAction({
          type: 'ARCHIVE_INSIGHT',
          data: { id, archived },
        });
        
        // Update local storage
        const storedInsights = await getInsights();
        if (storedInsights) {
          await saveInsights(
            storedInsights.map(insight => 
              insight.id === id 
                ? { ...insight, archived } 
                : insight
            )
          );
        }
      }
    } catch (error) {
      console.error('Error archiving insight:', error);
      
      // Revert optimistic update
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === id 
            ? { ...insight, archived: !archived } 
            : insight
        )
      );
      
      setError(error.message);
    }
  }, [isOnline]);
  
  /**
   * Track insight export
   * @param {number} id - Insight ID
   * @param {string} destination - Export destination
   */
  const exportInsight = useCallback(async (id, destination) => {
    try {
      if (isOnline) {
        // Send to API
        const response = await fetch(`/api/insights/${id}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ destination }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
      } else {
        // Queue offline action
        await queueOfflineAction({
          type: 'EXPORT_INSIGHT',
          data: { id, destination },
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error exporting insight:', error);
      setError(error.message);
      return false;
    }
  }, [isOnline]);
  
  /**
   * Get a specific insight by ID
   * @param {number} id - Insight ID
   * @returns {Promise<Object|null>} - Insight or null if not found
   */
  const getInsightById = useCallback(async (id) => {
    try {
      if (isOnline) {
        // Fetch from API
        const response = await fetch(`/api/insights/${id}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // Check if insight is already in state
        const foundInsight = insights.find(insight => insight.id === id);
        if (foundInsight) return foundInsight;
        
        // Fetch from local storage
        const storedInsights = await getInsights();
        if (!storedInsights) return null;
        
        return storedInsights.find(insight => insight.id === id) || null;
      }
    } catch (error) {
      console.error('Error getting insight by ID:', error);
      setError(error.message);
      return null;
    }
  }, [isOnline, insights]);
  
  /**
   * Force refresh insights
   */
  const refreshInsights = useCallback(async () => {
    // If we're offline, try to sync first
    if (!isOnline) {
      await syncNow();
    }
    
    await fetchInsights();
  }, [isOnline, fetchInsights, syncNow]);
  
  return {
    insights,
    isLoading,
    error,
    lastFetched,
    refreshInsights,
    starInsight,
    archiveInsight,
    exportInsight,
    getInsightById,
  };
}