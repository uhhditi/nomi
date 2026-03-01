import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getChores, createChore, toggleChoreCompleted, type Chore as BackendChore } from '../services/choreService';
import { AuthContext } from '../context/AuthContext';
import { listGroupsForUser } from '../services/groupsService';

type Chore = {
  choreId: number;
  title: string;
  description: string;
  dueTime: string;
  dueDate: Date;
  completed: boolean;
};

type RootStackParamList = {
  ChoreTracker: undefined;
  Dashboard: undefined;
  RoommateDashboard: undefined;
};

// Convert backend chore to frontend format
const convertBackendChore = (backendChore: any): Chore => {
  // Handle both snake_case (from raw DB) and camelCase (from service)
  const choreId = backendChore.choreId || backendChore.chore_id;
  const dueDateValue = backendChore.dueDate || backendChore.due_date;
  const dueDate = typeof dueDateValue === 'string' 
    ? new Date(dueDateValue) 
    : dueDateValue;
  
  return {
    choreId: choreId,
    title: backendChore.title,
    description: backendChore.description || '',
    dueTime: dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    dueDate: dueDate,
    completed: backendChore.completed,
  };
};

export default function ChoreTrackerScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreDueTime, setNewChoreDueTime] = useState(new Date());
  const [newChoreDate, setNewChoreDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const refRBSheet = useRef<any>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChoreTracker'>>();
  const auth = useContext(AuthContext);
  
  if (!auth) {
    throw new Error("AuthContext is undefined. Make sure you're inside an AuthProvider.");
  }

  const { user } = auth;

  // Fetch user's groups and set the first one, then load chores
  useEffect(() => {
    const initializeGroup = async () => {
      try {
        if (!user?.id) {
          Alert.alert('Error', 'Please log in to view chores.');
          return;
        }

        // Get user's groups
        const groups = await listGroupsForUser(user.id);
        if (groups.length === 0) {
          Alert.alert('No Group', 'You need to be in a group to view chores. Please create or join a group first.');
          setLoading(false);
          return;
        }

        // Use the first group
        const firstGroupId = groups[0].id;
        setGroupId(firstGroupId);
        await loadChores(firstGroupId);
      } catch (error) {
        console.error('Error initializing group:', error);
        Alert.alert('Error', 'Failed to load group information.');
        setLoading(false);
      }
    };

    initializeGroup();
  }, [user]);

  const loadChores = async (group: number) => {
    try {
      setLoading(true);
      const backendChores = await getChores(group);
      const convertedChores = backendChores.map(convertBackendChore);
      setChores(convertedChores);
    } catch (error) {
      console.error('Error loading chores:', error);
      Alert.alert('Error', 'Failed to load chores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current week dates
  const getWeekDates = () => {
    const today = selectedDate;
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDates = getWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatDateRange = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
  };

  const formatDay = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setNewChoreDate(date);
  };

  const handleAddChore = async () => {
    if (!newChoreTitle) {
      Alert.alert('Validation Error', 'Please fill in the chore title.');
      return;
    }

    if (!groupId) {
      Alert.alert('Error', 'No group selected.');
      return;
    }

    try {
      const dueDateTime = new Date(newChoreDate);
      dueDateTime.setHours(newChoreDueTime.getHours());
      dueDateTime.setMinutes(newChoreDueTime.getMinutes());

      const backendChore = await createChore({
        groupId: groupId,
        title: newChoreTitle,
        description: newChoreDescription || undefined,
        dueDate: dueDateTime,
        completed: false,
      });

      const convertedChore = convertBackendChore(backendChore);
      setChores([...chores, convertedChore]);
      setNewChoreTitle('');
      setNewChoreDescription('');
      refRBSheet.current?.close();
    } catch (error) {
      console.error('Error creating chore:', error);
      Alert.alert('Error', 'Failed to create chore. Please try again.');
    }
  };

  const handleToggleChoreStatus = async (choreId: number) => {
    if (!groupId) {
      Alert.alert('Error', 'No group selected.');
      return;
    }

    try {
      const backendChore = await toggleChoreCompleted(choreId, groupId);
      const convertedChore = convertBackendChore(backendChore);
      setChores(chores.map(chore => 
        chore.choreId === choreId ? convertedChore : chore
      ));
    } catch (error) {
      console.error('Error toggling chore status:', error);
      Alert.alert('Error', 'Failed to update chore status. Please try again.');
    }
  };

  const getChoresForDate = (date: Date) => {
    return chores.filter(chore => {
      const choreDate = new Date(chore.dueDate);
      return choreDate.getDate() === date.getDate() &&
             choreDate.getMonth() === date.getMonth() &&
             choreDate.getFullYear() === date.getFullYear();
    });
  };

  const todayChores = getChoresForDate(selectedDate);

  // Calculate week progress
  const weekChores = chores.filter(chore => {
    const choreDate = new Date(chore.dueDate);
    return choreDate >= weekStart && choreDate <= weekEnd;
  });
  const completedCount = weekChores.filter(c => c.completed).length;
  const overdueCount = weekChores.filter(c => {
    const now = new Date();
    return !c.completed && new Date(c.dueDate) < now;
  }).length;
  const completionRate = weekChores.length > 0 ? Math.round((completedCount / weekChores.length) * 100) : 0;

  const getStatusColor = (chore: Chore) => {
    if (chore.completed) return '#4CAF50';
    const now = new Date();
    if (new Date(chore.dueDate) < now) return '#F44336';
    return '#E0E0E0';
  };

  const getStatusText = (chore: Chore) => {
    if (chore.completed) return 'Completed';
    const now = new Date();
    const dueDateTime = new Date(chore.dueDate);
    if (dueDateTime < now) return 'Overdue';
    return `Due ${chore.dueTime}`;
  };

  const getChoreIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('kitchen') || lowerTitle.includes('dishes')) return '🧹';
    if (lowerTitle.includes('trash')) return '🗑️';
    if (lowerTitle.includes('bathroom') || lowerTitle.includes('toilet')) return '🚿';
    return '🧹';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3F3F96" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading chores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('RoommateDashboard' as never)}>
          <Ionicons name="arrow-back" size={20} color="#14141A" />
          <Text style={styles.headerTitle}>Chore Tracker</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={() => navigateWeek('prev')}>
            <Text style={styles.chevron}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.weekRange}>{formatDateRange()}</Text>
          <TouchableOpacity onPress={() => navigateWeek('next')}>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {weekDates.map((date, index) => {
            const isSelectedDay = isSelected(date);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayButton, isSelectedDay && styles.dayButtonSelected]}
                onPress={() => handleDaySelect(date)}
              >
                <Text style={[styles.dayText, isSelectedDay && styles.dayTextSelected]}>
                  {formatDay(date)}
                </Text>
                <Text style={[styles.dayDate, isSelectedDay && styles.dayDateSelected]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Chore Button */}
        <TouchableOpacity
          style={styles.addChoreButton}
          onPress={() => refRBSheet.current?.open()}
        >
          <Text style={styles.addChoreButtonText}>+ Add Chore</Text>
        </TouchableOpacity>

        {/* Today's Chores */}
        <Text style={styles.sectionTitle}>Today's Chores</Text>
        {todayChores.length === 0 ? (
          <Text key="empty-chores" style={styles.emptyText}>No chores for today</Text>
        ) : (
          todayChores.map((chore) => (
            <TouchableOpacity
              key={chore.choreId}
              style={[styles.choreCard, { borderColor: getStatusColor(chore) }]}
              onPress={() => handleToggleChoreStatus(chore.choreId)}
            >
              <View style={styles.choreLeft}>
                <Text style={styles.choreIcon}>{getChoreIcon(chore.title)}</Text>
                <View style={styles.choreInfo}>
                  <Text style={styles.choreTitle}>{chore.title}</Text>
                  <Text style={styles.choreDescription}>{chore.description}</Text>
                </View>
              </View>
              <View style={styles.choreRight}>
                <Text style={[styles.statusText, { color: getStatusColor(chore) }]}>
                  {getStatusText(chore)}
                </Text>
                <View style={[styles.statusCircle, { borderColor: getStatusColor(chore) }]}>
                  {chore.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* This Week's Progress */}
        <Text style={styles.sectionTitle}>This Week's Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Completion Rate</Text>
            <Text style={styles.progressPercentage}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${completionRate}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumberGreen}>{completedCount}</Text>
              <Text style={styles.statLabel}>completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumberRed}>{overdueCount}</Text>
              <Text style={styles.statLabel}>overdue</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Chore Modal */}
      <RBSheet
        ref={refRBSheet}
        useNativeDriver={false}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
          container: {
            height: 600,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          },
        }}
        customModalProps={{
          animationType: 'slide',
          statusBarTranslucent: true,
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Chore</Text>
          
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            placeholder="Enter chore title"
            value={newChoreTitle}
            onChangeText={setNewChoreTitle}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            placeholder="Enter description"
            value={newChoreDescription}
            onChangeText={setNewChoreDescription}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{newChoreDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newChoreDate}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setNewChoreDate(date);
              }}
            />
          )}

          <Text style={styles.inputLabel}>Due Time</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text>{newChoreDueTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={newChoreDueTime}
              mode="time"
              onChange={(event, time) => {
                setShowTimePicker(false);
                if (time) setNewChoreDueTime(time);
              }}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleAddChore}>
            <Text style={styles.saveButtonText}>Save Chore</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </View>
  );
}

const DASHBOARD_PURPLE = '#3F3F96';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#14141A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chevron: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dayButtonSelected: {
    backgroundColor: DASHBOARD_PURPLE,
  },
  dayText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  dayTextSelected: {
    color: DASHBOARD_PURPLE,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
  },
  dayDateSelected: {
    color: DASHBOARD_PURPLE,
    fontWeight: '600',
  },
  addChoreButton: {
    backgroundColor: DASHBOARD_PURPLE,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  addChoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginVertical: 20,
  },
  choreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  choreLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  choreIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  choreDescription: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  choreAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  assigneeText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
  },
  choreRight: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 100,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Inter',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumberGreen: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'Inter',
  },
  statNumberRed: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F44336',
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
    marginTop: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Inter',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#000000',
  },
  roommateSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roommateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  roommateButtonSelected: {
    backgroundColor: DASHBOARD_PURPLE,
    borderColor: DASHBOARD_PURPLE,
  },
  roommateButtonText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter',
  },
  roommateButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateTimeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  saveButton: {
    backgroundColor: DASHBOARD_PURPLE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

