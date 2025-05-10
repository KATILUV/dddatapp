/**
 * InsightGenerator component for generating insights from user data using templates
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import GlassmorphicCard from './GlassmorphicCard';
import Button from './Button';
import TemplateSelector from './TemplateSelector';
import templateManager from '../templates/templateManager';
import { TEMPLATE_TYPES } from '../templates/templateSchema';
import { api } from '../services/api';

/**
 * InsightGenerator component
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data to use for generating insights
 * @param {Function} props.onInsightGenerated - Callback when insight is generated
 * @param {Function} props.onError - Callback when error occurs
 * @param {Object} props.style - Additional style for the component
 * @returns {React.ReactElement} - Rendered component
 */
export default function InsightGenerator({
  userData,
  onInsightGenerated,
  onError,
  style,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState(null);
  const [error, setError] = useState(null);
  const [mockData, setMockData] = useState({});

  // Initialize templates
  useEffect(() => {
    const init = async () => {
      await templateManager.initialize();
      const activeTemplate = templateManager.getActiveTemplate(TEMPLATE_TYPES.INSIGHT);
      if (activeTemplate) {
        setSelectedTemplate(activeTemplate);
      }
    };
    
    init();
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setGeneratedInsight(null);
    setError(null);
    
    // Initialize mock data fields based on template requirements
    if (template && template.template.requiredDataFields) {
      const newMockData = { ...mockData };
      template.template.requiredDataFields.forEach(field => {
        if (!newMockData[field]) {
          newMockData[field] = getSampleDataForField(field);
        }
      });
      setMockData(newMockData);
    }
  };

  // Generate insight with the selected template
  const handleGenerateInsight = async () => {
    if (!selectedTemplate) {
      setError('Please select a template first.');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Combine real user data with mock data for missing fields
      const dataToUse = { ...mockData, ...userData };
      
      // Check if all required fields are present
      const missingFields = selectedTemplate.template.requiredDataFields.filter(
        field => !dataToUse[field]
      );
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required data fields: ${missingFields.join(', ')}`);
      }
      
      // Generate the insight by calling our API
      const response = await api.post('/generate-insight', {
        systemPrompt: selectedTemplate.template.systemPrompt,
        userPrompt: applyDataToTemplate(selectedTemplate.template.promptTemplate, dataToUse),
        format: selectedTemplate.template.outputFormat || 'markdown'
      });
      
      // Set the generated insight
      setGeneratedInsight(response.data);
      
      // Callback
      if (onInsightGenerated) {
        onInsightGenerated(response.data.insight);
      }
    } catch (err) {
      console.error('Error generating insight:', err);
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Failed to generate insight: ${errorMessage}`);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply data to template, replacing placeholders
  const applyDataToTemplate = (template, data) => {
    let result = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (result.includes(placeholder)) {
        result = result.replace(
          new RegExp(placeholder, 'g'),
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      }
    });
    
    return result;
  };

  // Get sample data for a field (for development purposes)
  const getSampleDataForField = (field) => {
    // This would normally be replaced with user's actual data from their data sources
    const sampleData = {
      activities: "Morning: 30 minute run, Work from 9am-5pm, Evening: reading for 1 hour\nAfternoon: meeting with team, coffee break, focused coding session\nEvening: dinner with family, watched a documentary",
      mood: "Morning: energetic and positive\nAfternoon: focused but slightly tired\nEvening: relaxed and content",
      energyLevel: "Morning: 8/10\nAfternoon: 6/10\nEvening: 4/10",
      sleep: "7.5 hours, went to bed at 11pm, woke up once during the night, woke up at 6:30am",
      notes: "Felt accomplished with work tasks. Need to manage afternoon energy dip better.",
      exercise: "Morning run (30 minutes, 5km)\nQuick home workout (10 pushups, 20 squats, 30s plank) before dinner",
      nutrition: "Breakfast: Oatmeal with fruit and coffee\nLunch: Salad with grilled chicken\nDinner: Salmon with vegetables\nSnacks: Yogurt, nuts, apple",
      vitals: "Resting heart rate: 65bpm\nBlood pressure: 120/80\nWeight: 155 lbs",
      symptoms: "Slight headache in the afternoon, possibly from staring at screen too long",
      samples: "Recent blog posts about technology and nature\nPhotography focusing on urban landscapes\nShort story about future technology",
      medium: "Writing (blog, fiction), Photography",
      timePeriod: "Last 3 months",
      tasksCompleted: "Email organization (30 mins)\nProject planning (1.5 hours)\nCode review (1 hour)\nDocumentation update (45 mins)\nTeam meeting (1 hour)",
      workSessions: "9am-11am: Deep work session\n11:30am-12:30pm: Emails and planning\n2pm-4pm: Collaborative work\n4:30pm-5:30pm: Deep work session",
      focusScores: "Morning: 9/10\nAfternoon: 6/10\nLate afternoon: 7/10",
      environment: "Morning: home office, quiet\nAfternoon: open office, some distractions\nLate afternoon: coffee shop, moderate noise",
      goals: "Complete project planning\nFinish documentation update\nPrepare for tomorrow's presentation",
      communications: "15 work emails sent\n5 personal messages\n2 video calls (45 mins total)\n1 in-person meeting (1 hour)",
      socialEvents: "Coffee with colleague (30 mins)\nTeam lunch (1 hour)\nBrief hallway conversations (15 mins total)",
      relationshipNotes: "Good collaboration with design team\nHelped new team member get oriented\nQuick catch-up with old friend via text",
      energyLevels: "After team meeting: energized (7/10)\nAfter long video call: drained (3/10)\nAfter coffee with colleague: refreshed (8/10)"
    };
    
    return sampleData[field] || `Sample data for ${field}`;
  };

  // Render the generated insight
  const renderGeneratedInsight = () => {
    if (!generatedInsight) return null;
    
    return (
      <GlassmorphicCard style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightTitle}>{generatedInsight.insight.title}</Text>
          <Text style={styles.insightTimestamp}>
            {new Date(generatedInsight.insight.timestamp).toLocaleString()}
          </Text>
        </View>
        
        <ScrollView style={styles.insightContent}>
          <Text style={styles.insightText}>
            {generatedInsight.result}
          </Text>
        </ScrollView>
        
        <View style={styles.insightFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setGeneratedInsight(null)}
          >
            <Ionicons name="refresh-outline" size={20} color="#a388ff" />
            <Text style={styles.actionButtonText}>Generate New</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // In a real app, this would save to the user's saved insights
              if (onInsightGenerated) {
                onInsightGenerated(generatedInsight.insight, true);
              }
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#a388ff" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </GlassmorphicCard>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Generate New Insight</Text>
      
      {/* Template selector */}
      <TemplateSelector
        type={TEMPLATE_TYPES.INSIGHT}
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={selectedTemplate?.id}
        style={styles.templateSelector}
      />
      
      {/* Generate button */}
      {!generatedInsight && (
        <Button
          title={isGenerating ? "Generating..." : "Generate Insight"}
          onPress={handleGenerateInsight}
          disabled={isGenerating || !selectedTemplate}
          variant="primary"
          isLoading={isGenerating}
          iconLeft={isGenerating ? null : "sparkles-outline"}
          style={styles.generateButton}
        />
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Generated insight */}
      {renderGeneratedInsight()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  templateSelector: {
    marginBottom: 20,
  },
  generateButton: {
    marginVertical: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 10,
    fontSize: 14,
  },
  insightCard: {
    padding: 20,
    marginTop: 20,
  },
  insightHeader: {
    marginBottom: 15,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  insightTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  insightContent: {
    maxHeight: 300,
    marginBottom: 15,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    color: '#a388ff',
    marginLeft: 5,
    fontSize: 14,
  },
});