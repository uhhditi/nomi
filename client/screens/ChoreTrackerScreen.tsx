import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useRef } from 'react';

type Chore = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueTime: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
};

type RootStackParamList = {
  ChoreTracker: undefined;
  Dashboard: undefined;
};

const MOCK_ROOMMATES = ['roommate 1', 'roommate 2', 'roommate 3', 'roommate 4'];

// Initial mock data for demonstration
const getInitialMockChores = (): Chore[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Create mock chores
  const chore1: Chore = {
    id: '1',
    title: 'Clean Kitchen',
    description: 'dishes, counter, sink',
    assignedTo: 'roommate 1',
    dueTime: '6:00 PM',
    dueDate: (() => {
      const date = new Date(today);
      date.setHours(18, 0, 0, 0);
      return date;
    })(),
    status: 'pending',
  };

  const chore2: Chore = {
    id: '2',
    title: 'Take Out Trash',
    description: 'kitchen and bathroom bins',
    assignedTo: 'roommate 2',
    dueTime: '10:00 AM',
    dueDate: (() => {
      const date = new Date(today);
      date.setHours(10, 0, 0, 0);
      if (date < new Date()) {
        date.setDate(date.getDate() - 1); // Make it yesterday so it shows as completed
      }
      return date;
    })(),
    status: 'completed',
  };

  const chore3: Chore = {
    id: '3',
    title: 'Clean Bathroom',
    description: 'toilet, shower, mirror',
    assignedTo: 'roommate 4',
    dueTime: '2:00 PM',
    dueDate: (() => {
      const date = new Date(yesterday);
      date.setHours(14, 0, 0, 0);
      return date;
    })(),
    status: 'overdue',
  };

  return [chore1, chore2, chore3];
};

export default function ChoreTrackerScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chores, setChores] = useState<Chore[]>(getInitialMockChores());
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreDescription, setNewChoreDescription] = useState('');
  const [newChoreDueTime, setNewChoreDueTime] = useState(new Date());
  const [newChoreAssignedTo, setNewChoreAssignedTo] = useState('');
  const [newChoreDate, setNewChoreDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const refRBSheet = useRef<any>(null);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChoreTracker'>>();

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

  const handleAddChore = () => {
    if (!newChoreTitle || !newChoreAssignedTo) return;

    const dueDateTime = new Date(newChoreDate);
    dueDateTime.setHours(newChoreDueTime.getHours());
    dueDateTime.setMinutes(newChoreDueTime.getMinutes());

    const now = new Date();
    let status: 'pending' | 'completed' | 'overdue' = 'pending';
    if (dueDateTime < now) {
      status = 'overdue';
    }

    const newChore: Chore = {
      id: Date.now().toString(),
      title: newChoreTitle,
      description: newChoreDescription,
      assignedTo: newChoreAssignedTo,
      dueTime: newChoreDueTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      dueDate: dueDateTime,
      status,
    };

    setChores([...chores, newChore]);
    setNewChoreTitle('');
    setNewChoreDescription('');
    setNewChoreAssignedTo('');
    refRBSheet.current?.close();
  };

  const toggleChoreStatus = (choreId: string) => {
    setChores(chores.map(chore => {
      if (chore.id === choreId) {
        const newStatus = chore.status === 'completed' ? 'pending' : 'completed';
        return { ...chore, status: newStatus };
      }
      return chore;
    }));
  };

  const getChoresForDate = (date: Date) => {
    return chores.filter(chore => {
      const choreDate = new Date(chore.dueDate);
      return choreDate.getDate() === date.getDate() &&
             choreDate.getMonth() === date.getMonth() &&
             choreDate.getFullYear() === date.getFullYear();
    }).map(chore => {
      // Update status if overdue
      const now = new Date();
      if (chore.status !== 'completed' && new Date(chore.dueDate) < now) {
        return { ...chore, status: 'overdue' as const };
      }
      return chore;
    });
  };

  const todayChores = getChoresForDate(selectedDate);

  // Calculate week progress
  const weekChores = chores.filter(chore => {
    const choreDate = new Date(chore.dueDate);
    return choreDate >= weekStart && choreDate <= weekEnd;
  });
  const completedCount = weekChores.filter(c => c.status === 'completed').length;
  const overdueCount = weekChores.filter(c => c.status === 'overdue').length;
  const completionRate = weekChores.length > 0 ? Math.round((completedCount / weekChores.length) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'overdue': return '#F44336';
      default: return '#E0E0E0';
    }
  };

  const getStatusText = (chore: Chore) => {
    const now = new Date();
    if (chore.status === 'completed') return 'Completed';
    const dueDateTime = new Date(chore.dueDate);
    if (chore.status === 'overdue' || dueDateTime < now) return 'Overdue';
    return `Due ${chore.dueTime}`;
  };

  const getChoreIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('kitchen') || lowerTitle.includes('dishes')) return '🧹';
    if (lowerTitle.includes('trash')) return '🗑️';
    if (lowerTitle.includes('bathroom') || lowerTitle.includes('toilet')) return '🚿';
    return '🧹';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Chore Tracker</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>☰</Text>
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
          <Text style={styles.emptyText}>No chores for today</Text>
        ) : (
          todayChores.map((chore) => (
            <TouchableOpacity
              key={chore.id}
              style={[styles.choreCard, { borderColor: getStatusColor(chore.status) }]}
              onPress={() => toggleChoreStatus(chore.id)}
            >
              <View style={styles.choreLeft}>
                <Text style={styles.choreIcon}>{getChoreIcon(chore.title)}</Text>
                <View style={styles.choreInfo}>
                  <Text style={styles.choreTitle}>{chore.title}</Text>
                  <Text style={styles.choreDescription}>{chore.description}</Text>
                  <View style={styles.choreAssignee}>
                    <Text style={styles.personIcon}>👤</Text>
                    <Text style={styles.assigneeText}>{chore.assignedTo}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.choreRight}>
                <Text style={[styles.statusText, { color: getStatusColor(chore.status) }]}>
                  {getStatusText(chore)}
                </Text>
                <View style={[styles.statusCircle, { borderColor: getStatusColor(chore.status) }]}>
                  {chore.status === 'completed' && (
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

          <Text style={styles.inputLabel}>Assign To</Text>
          <View style={styles.roommateSelector}>
            {MOCK_ROOMMATES.map((roommate) => (
              <TouchableOpacity
                key={roommate}
                style={[
                  styles.roommateButton,
                  newChoreAssignedTo === roommate && styles.roommateButtonSelected,
                ]}
                onPress={() => setNewChoreAssignedTo(roommate)}
              >
                <Text
                  style={[
                    styles.roommateButtonText,
                    newChoreAssignedTo === roommate && styles.roommateButtonTextSelected,
                  ]}
                >
                  {roommate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C9C9EE',
    fontFamily: 'Inter',
  },
  menuIcon: {
    fontSize: 24,
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    backgroundColor: '#C9C9EE',
  },
  dayText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  dayTextSelected: {
    color: '#7D60A3',
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
  },
  dayDateSelected: {
    color: '#7D60A3',
    fontWeight: '600',
  },
  addChoreButton: {
    backgroundColor: '#C9C9EE',
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
    backgroundColor: '#C9C9EE',
    borderColor: '#C9C9EE',
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
    backgroundColor: '#C9C9EE',
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

