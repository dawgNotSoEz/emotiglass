import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TextInput,
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { RootStackParamList, MoodEntry } from '../types';
import { getMoodEntry, updateMoodEntry } from '../services/storage';
import { Card } from '../components/ui/Card';
import { DrawingThumbnail } from '../components/ui/DrawingThumbnail';
import { useToast } from '../components/ui/Toast';

type EntryDetailsRouteProp = RouteProp<RootStackParamList, 'EntryDetails'>;
type EntryDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'EntryDetails'>;

// Common emoji sets for different emotions
const EMOTION_EMOJIS: Record<string, string[]> = {
  joy: ['😊', '😄', '🥳', '😁', '😃', '🤗', '🌟', '✨'],
  sadness: ['😢', '😭', '😔', '😞', '😥', '💧', '🌧️', '💔'],
  anger: ['😠', '😡', '🤬', '💢', '👿', '🔥', '⚡', '💥'],
  fear: ['😨', '😰', '😱', '🙀', '😳', '🌪️', '⚡', '❄️'],
  surprise: ['😲', '😮', '😯', '😦', '😧', '🎉', '🎊', '💫'],
  disgust: ['🤢', '🤮', '😖', '😫', '🤨', '👎', '🦠', '⚠️'],
  contentment: ['😌', '😏', '😎', '🧘', '💆', '☀️', '🌈', '🌻'],
  neutral: ['😐', '😶', '😑', '🤔', '💭', '🌫️', '🧮', '📊'],
};

// Suggested tags
const SUGGESTED_TAGS = [
  'Morning', 'Afternoon', 'Evening', 'Night',
  'Work', 'Home', 'School', 'Exercise', 
  'Family', 'Friends', 'Solo', 'Nature',
  'Relaxing', 'Productive', 'Creative', 'Social'
];

export const EntryDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EntryDetailsNavigationProp>();
  const route = useRoute<EntryDetailsRouteProp>();
  const toast = useToast();
  
  const { entryId } = route.params;
  
  // States
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  // Load entry
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const moodEntry = await getMoodEntry(entryId);
        if (moodEntry) {
          setEntry(moodEntry);
          setTitle(moodEntry.title || '');
          setNotes(moodEntry.notes || '');
          setTags(moodEntry.tags || []);
          setSelectedEmoji(moodEntry.emojiSummary || '');
          setIsFavorite(moodEntry.isFavorite || false);
        } else {
          toast.showToast('Entry not found', 'error');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Failed to load entry:', error);
        toast.showToast('Failed to load entry', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadEntry();
  }, [entryId]);
  
  // Save changes
  const saveChanges = async () => {
    if (!entry) return;
    
    setSaving(true);
    
    try {
      const updatedEntry: MoodEntry = {
        ...entry,
        title,
        notes,
        tags,
        emojiSummary: selectedEmoji,
        isFavorite,
      };
      
      await updateMoodEntry(updatedEntry);
      toast.showToast('Entry updated', 'success');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast.showToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Add a tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    // Check if tag already exists
    if (tags.includes(tag.trim())) {
      toast.showToast('Tag already added', 'info');
      return;
    }
    
    setTags([...tags, tag.trim()]);
    setNewTag('');
  };
  
  // Remove a tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get emojis for current emotion
  const getEmojisForEmotion = (): string[] => {
    if (!entry) return [];
    
    return EMOTION_EMOJIS[entry.dominantEmotion] || EMOTION_EMOJIS.neutral;
  };
  
  // Save edited notes
  const saveNotes = () => {
    setIsEditingNotes(false);
    Alert.alert('Success', 'Notes updated successfully');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorText}>Entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Details</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? theme.colors.error : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Entry Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.emotionHeader}>
            <View style={[
              styles.emotionIndicator, 
              { backgroundColor: getEmotionColor(entry.dominantEmotion) }
            ]} />
            <View style={styles.emotionInfo}>
              <Text style={styles.emotionText}>
                {entry.dominantEmotion.toUpperCase()}
                {selectedEmoji ? ` ${selectedEmoji}` : ''}
              </Text>
              <Text style={styles.dateText}>{formatDate(entry.timestamp)}</Text>
            </View>
          </View>
          
          {/* Drawing thumbnail if available */}
          {entry.source === 'drawing' && entry.drawingData && (
            <View style={styles.drawingContainer}>
              <DrawingThumbnail 
                drawingData={entry.drawingData} 
                width={150} 
                height={150} 
              />
            </View>
          )}
          
          {/* Source indicator */}
          <View style={styles.sourceContainer}>
            <Ionicons 
              name={getSourceIcon(entry.source)} 
              size={16} 
              color={theme.colors.textLight} 
            />
            <Text style={styles.sourceText}>
              Created with {entry.source}
            </Text>
          </View>
        </Card>
        
        {/* Title Input */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Give your entry a title (e.g. 'Morning Reflection')"
            placeholderTextColor={theme.colors.textLight}
          />
        </Card>
        
        {/* Notes Input */}
        <Card style={styles.inputCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingNotes(!isEditingNotes)}
              style={styles.editButton}
            >
              <Ionicons 
                name={isEditingNotes ? "save" : "pencil"} 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          {isEditingNotes ? (
            <View style={styles.notesEditContainer}>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Add your notes here..."
                placeholderTextColor={theme.colors.textLight}
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveNotes}
              >
                <Text style={styles.saveButtonText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.notesText}>
              {notes || "No notes added"}
            </Text>
          )}
        </Card>
        
        {/* Emoji Selection */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>Emoji Summary</Text>
          <View style={styles.emojiGrid}>
            {getEmojisForEmotion().map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.selectedEmojiButton
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        
        {/* Tags Input */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>Tags</Text>
          
          {/* Current tags */}
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => removeTag(tag)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {tags.length === 0 && (
              <Text style={styles.noTagsText}>No tags added yet</Text>
            )}
          </View>
          
          {/* Add new tag */}
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.tagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag..."
              placeholderTextColor={theme.colors.textLight}
              onSubmitEditing={() => addTag(newTag)}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={() => addTag(newTag)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Suggested tags */}
          <Text style={styles.suggestedTagsLabel}>Suggested Tags:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestedTagsContainer}
          >
            {SUGGESTED_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.suggestedTagChip}
                onPress={() => addTag(tag)}
              >
                <Text style={styles.suggestedTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>
      </ScrollView>
      
      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Helper function to get a color for each emotion
const getEmotionColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: theme.colors.joy,
    sadness: theme.colors.sadness,
    anger: theme.colors.anger,
    fear: theme.colors.fear,
    surprise: theme.colors.surprise,
    disgust: theme.colors.disgust,
    contentment: theme.colors.contentment,
    neutral: theme.colors.neutral,
  };
  
  return emotionColors[emotion] || theme.colors.primary;
};

// Helper function to get icon for entry source
const getSourceIcon = (source: string): string => {
  const sourceIcons: Record<string, string> = {
    sliders: 'options',
    drawing: 'brush',
    voice: 'mic',
    face: 'camera',
  };
  
  return sourceIcons[source] || 'help-circle';
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  favoriteButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: theme.spacing.md,
  },
  emotionHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  emotionIndicator: {
    width: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  emotionInfo: {
    flex: 1,
  },
  emotionText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  drawingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  sourceText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  inputCard: {
    margin: theme.spacing.md,
    marginTop: 0,
  },
  inputLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    minHeight: 100,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing.xs,
    backgroundColor: theme.colors.lightGray,
  },
  selectedEmojiButton: {
    backgroundColor: theme.colors.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    marginRight: theme.spacing.xs,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTagsText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  addTagContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedTagsLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  suggestedTagsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  suggestedTagChip: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 16,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  suggestedTagText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIcon: {
    marginRight: theme.spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  notesText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.fontSizes.md,
  },
  notesEditContainer: {
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  },
}); 