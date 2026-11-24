import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { initialTasks, Task } from '../data/mockData';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { DatePickerModal } from '../components/DatePickerModal';
import { useAlert } from '../context/AlertContext';

const TASK_CATEGORIES = [
  'Fertilization & Nutrition',
  'Irrigation & Water Management',
  'Pest & Disease Spraying',
  'Harvesting & Post-Harvest',
  'Sowing & Seedbed Prep',
  'Machinery & Equipment Service',
  'Weeding & Inter-culture',
  'Soil Testing & Field Scouting',
];

const TASK_PRIORITIES = [
  'Medium Priority',
  'Low Priority',
  'High Priority',
  'Urgent Priority',
];

const TASK_FARMS = [
  'Khetivo Green Acres',
  'Malwa Golden Fields',
];

const TASK_STATUSES: ('To Do' | 'In Progress' | 'Completed')[] = [
  'To Do',
  'In Progress',
  'Completed',
];

interface TasksScreenProps {
  onBack: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ onBack }) => {
  const { showDeleteConfirm, showWarning, showSuccess } = useAlert();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'calendar'>('list');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(10); // November (0-indexed: 10 = Nov)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-27');

  // Modal State (Matches Web Create Farm Task modal & Image)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Fertilization & Nutrition');
  const [newPriority, setNewPriority] = useState('Medium Priority');
  const [newFarmName, setNewFarmName] = useState('Khetivo Green Acres');
  const [newDueDate, setNewDueDate] = useState('12-11-2026');
  const [newZone, setNewZone] = useState('Zone A (12 Acres)');
  const [newCrop, setNewCrop] = useState('PBW 826 Wheat');
  const [newAssignedTo, setNewAssignedTo] = useState('Harpreet Singh');
  const [newStatus, setNewStatus] = useState<'To Do' | 'In Progress' | 'Completed'>('To Do');
  const [newInstructions, setNewInstructions] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'category' | 'priority' | 'farm' | 'status' | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Counts
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'Completed' ? 'To Do' : 'Completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    showDeleteConfirm(
      'Delete Task',
      'Are you sure you want to delete this field task? This action cannot be undone.',
      () => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    );
  };

  // Create Task
  const handleCreateTask = () => {
    if (!newTitle.trim()) {
      showWarning('Required Field', 'Please enter a task title.');
      return;
    }
    const cleanPriority = newPriority.replace(' Priority', '') as 'Low' | 'Medium' | 'High' | 'Urgent';
    const created: Task = {
      id: `task-${Date.now()}`,
      farmId: newFarmName.includes('Malwa') ? 'farm-2' : 'farm-1',
      farmName: newFarmName,
      title: newTitle.trim(),
      category: newCategory,
      priority: cleanPriority,
      status: newStatus,
      dueDate: newDueDate,
      assignedTo: newAssignedTo.trim() || 'Harpreet Singh',
      zone: newZone.trim() || 'Zone A (12 Acres)',
      crop: newCrop.trim() || 'PBW 826 Wheat',
      instructions: newInstructions.trim(),
    };
    setTasks([created, ...tasks]);
    setIsCreateModalOpen(false);
    setOpenDropdown(null);
    setNewTitle('');
    setNewInstructions('');
    showSuccess('Task Created', 'Field operation successfully scheduled.');
  };

  // Compute Due Status Label & Color
  const getDueStatus = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) {
      return { label: 'Completed', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' };
    }
    // Calculate days from current date (2026-11-10)
    const baseDate = new Date(2026, 10, 10).getTime();
    const [y, m, d] = dueDate.split('-').map(Number);
    if (!y || !m || !d) {
      return { label: dueDate, color: '#55685D', bg: '#F4F8F4', border: '#E5ECE7' };
    }
    const dueTime = new Date(y, m - 1, d).getTime();
    const diffDays = Math.round((baseDate - dueTime) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        label: `Overdue by ${diffDays}d`,
        color: '#BE123C',
        bg: '#FFE4E6',
        border: '#FECDD3',
      };
    } else if (diffDays === 0) {
      return {
        label: 'Due Today',
        color: '#B45309',
        bg: '#FEF3C7',
        border: '#FDE68A',
      };
    } else {
      return {
        label: `Due in ${Math.abs(diffDays)}d`,
        color: '#15803D',
        bg: '#E7F3EB',
        border: '#C6E2D0',
      };
    }
  };

  // Filter Tasks
  const visibleTasks = tasks.filter((t) => {
    if (taskFilter === 'todo' && t.status !== 'To Do') return false;
    if (taskFilter === 'in_progress' && t.status !== 'In Progress') return false;
    if (taskFilter === 'completed' && t.status !== 'Completed') return false;

    if (farmFilter !== 'all' && !t.farmName.toLowerCase().includes(farmFilter.toLowerCase())) {
      return false;
    }

    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q) ||
        (t.crop && t.crop.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Tasks & Operations</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header: Title, Switcher & Create Task Button */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.mainTitle}>Tasks & Operations</Text>
            <Text style={styles.mainSub}>
              Field operations, fertilizer cycles & calendar • All registered holdings
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* View Switcher: List vs Calendar */}
            <View style={styles.switcher}>
              <TouchableOpacity
                style={[styles.switchBtn, taskViewMode === 'list' && styles.switchBtnActive]}
                onPress={() => setTaskViewMode('list')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="checkbox-marked-outline"
                  size={14}
                  color={taskViewMode === 'list' ? '#0C4B32' : '#55685D'}
                />
                <Text
                  style={[
                    styles.switchBtnText,
                    taskViewMode === 'list' && styles.switchBtnTextActive,
                  ]}
                >
                  List
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchBtn, taskViewMode === 'calendar' && styles.switchBtnActive]}
                onPress={() => setTaskViewMode('calendar')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={taskViewMode === 'calendar' ? '#0C4B32' : '#55685D'}
                />
                <Text
                  style={[
                    styles.switchBtnText,
                    taskViewMode === 'calendar' && styles.switchBtnTextActive,
                  ]}
                >
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Task Button */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setIsCreateModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4-Metric Strip (Click to Filter) */}
        <View style={styles.metricStrip}>
          <TouchableOpacity
            style={[
              styles.metricCard,
              taskFilter === 'all' && taskViewMode === 'list' && styles.metricCardActive,
            ]}
            onPress={() => {
              setTaskFilter('all');
              setTaskViewMode('list');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricCardLabel}>All Tasks</Text>
              {taskFilter === 'all' && taskViewMode === 'list' && <View style={styles.activeDot} />}
            </View>
            <Text style={[styles.metricCardVal, { color: '#0C4B32' }]}>{totalCount} Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              taskFilter === 'todo' && taskViewMode === 'list' && styles.metricCardActiveAmber,
            ]}
            onPress={() => {
              setTaskFilter('todo');
              setTaskViewMode('list');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#92400E' }]}>To Do</Text>
              {taskFilter === 'todo' && taskViewMode === 'list' && (
                <View style={[styles.activeDot, { backgroundColor: '#D97706' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#B45309' }]}>{todoCount} Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              taskFilter === 'in_progress' && taskViewMode === 'list' && styles.metricCardActiveBlue,
            ]}
            onPress={() => {
              setTaskFilter('in_progress');
              setTaskViewMode('list');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#1E40AF' }]}>In Progress</Text>
              {taskFilter === 'in_progress' && taskViewMode === 'list' && (
                <View style={[styles.activeDot, { backgroundColor: '#2563EB' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#1D4ED8' }]}>{inProgressCount} Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricCard,
              taskFilter === 'completed' && taskViewMode === 'list' && styles.metricCardActiveGreen,
            ]}
            onPress={() => {
              setTaskFilter('completed');
              setTaskViewMode('list');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.metricCardTop}>
              <Text style={[styles.metricCardLabel, { color: '#065F46' }]}>Completed</Text>
              {taskFilter === 'completed' && taskViewMode === 'list' && (
                <View style={[styles.activeDot, { backgroundColor: '#059669' }]} />
              )}
            </View>
            <Text style={[styles.metricCardVal, { color: '#047857' }]}>{completedCount} Done</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Toolbar: Segmented Tabs, Farm Selector, Search */}
        <View style={styles.filterToolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsRow}>
            {[
              { id: 'all', label: `All Tasks (${totalCount})` },
              { id: 'todo', label: `To Do (${todoCount})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ].map((tab) => {
              const active = taskFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setTaskFilter(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Farm selector & Search */}
          <View style={styles.toolbarBottom}>
            <View style={styles.farmSelectBox}>
              <Text style={styles.farmSelectText}>
                {farmFilter === 'all' ? 'All Farms' : farmFilter}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#55685D" />
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={14} color="#889B90" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks, crop, worker..."
                placeholderTextColor="#889B90"
                value={taskSearch}
                onChangeText={setTaskSearch}
              />
              {taskSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTaskSearch('')}>
                  <Ionicons name="close-circle" size={14} color="#889B90" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* View Mode: LIST vs CALENDAR */}
        {taskViewMode === 'calendar' ? (
          /* CALENDAR VIEW */
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonthTitle}>November 2026</Text>
              <TouchableOpacity
                onPress={() => setSelectedDate('2026-10-27')}
                style={styles.todayBtn}
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
            </View>

            {/* Days grid summary */}
            <View style={styles.calendarSummary}>
              <Text style={styles.calSubTitle}>Scheduled Operations for Selected Date</Text>
              <View style={styles.calDateBadge}>
                <Ionicons name="calendar" size={13} color="#0C4B32" />
                <Text style={styles.calDateBadgeText}>{selectedDate}</Text>
              </View>
            </View>

            {/* Tasks scheduled */}
            <View style={{ gap: 8 }}>
              {tasks
                .filter((t) => t.dueDate === selectedDate)
                .map((t) => (
                  <View key={t.id} style={styles.calTaskItem}>
                    <Text style={styles.calTaskTitle}>{t.title}</Text>
                    <Text style={styles.calTaskSub}>
                      {t.category} • {t.assignedTo}
                    </Text>
                  </View>
                ))}
              {tasks.filter((t) => t.dueDate === selectedDate).length === 0 && (
                <Text style={styles.calNoTasks}>No tasks scheduled for this day.</Text>
              )}
            </View>
          </View>
        ) : (
          /* LIST VIEW WITH CARDS */
          <View style={styles.taskListCard}>
            {visibleTasks.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="checkbox-blank-off-outline" size={36} color="#889B90" />
                <Text style={styles.emptyTitle}>No Tasks Found</Text>
                <Text style={styles.emptySub}>No operations match the selected filter or search.</Text>
              </View>
            ) : (
              <View style={styles.taskItemsWrap}>
                {visibleTasks.map((task, idx) => {
                  const isCompleted = task.status === 'Completed';
                  const isExpanded = expandedTaskId === task.id;
                  const due = getDueStatus(task.dueDate, isCompleted);

                  // Priority Pill Style
                  const prioStyle =
                    task.priority === 'Urgent'
                      ? { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }
                      : task.priority === 'High'
                      ? { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' }
                      : task.priority === 'Medium'
                      ? { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }
                      : { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };

                  // Status Pill Style
                  const statusStyle =
                    task.status === 'Completed'
                      ? { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' }
                      : task.status === 'In Progress'
                      ? { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' }
                      : { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };

                  return (
                    <View
                      key={task.id}
                      style={[
                        styles.taskRow,
                        idx !== visibleTasks.length - 1 && styles.taskRowBorder,
                      ]}
                    >
                      {/* Top Compact Row */}
                      <View style={styles.taskRowMain}>
                        {/* Checkbox */}
                        <TouchableOpacity
                          style={styles.checkboxTouch}
                          onPress={() => handleToggleStatus(task.id)}
                          activeOpacity={0.7}
                        >
                          {isCompleted ? (
                            <Ionicons name="checkmark-circle" size={22} color="#059669" />
                          ) : (
                            <View style={styles.checkboxEmpty} />
                          )}
                        </TouchableOpacity>

                        {/* Title and Badges */}
                        <View style={{ flex: 1, gap: 6 }}>
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedTaskId(isExpanded ? null : task.id)
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.taskRowTitle,
                                isCompleted && styles.taskRowTitleCompleted,
                              ]}
                            >
                              {task.title}
                            </Text>
                          </TouchableOpacity>

                          <View style={styles.badgesWrap}>
                            {/* Category */}
                            <View style={styles.categoryPill}>
                              <Text style={styles.categoryPillText}>{task.category}</Text>
                            </View>

                            {/* Priority */}
                            <View
                              style={[
                                styles.badgeBase,
                                {
                                  backgroundColor: prioStyle.bg,
                                  borderColor: prioStyle.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeTextBase,
                                  { color: prioStyle.text },
                                ]}
                              >
                                {task.priority}
                              </Text>
                            </View>

                            {/* Status */}
                            <View
                              style={[
                                styles.badgeBase,
                                {
                                  backgroundColor: statusStyle.bg,
                                  borderColor: statusStyle.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeTextBase,
                                  { color: statusStyle.text },
                                ]}
                              >
                                {task.status}
                              </Text>
                            </View>

                            {/* Farm */}
                            <View style={styles.farmPill}>
                              <Text style={styles.farmPillText}>{task.farmName}</Text>
                            </View>
                          </View>
                        </View>

                        {/* Actions (Trash & Chevron) */}
                        <View style={styles.taskRowEnd}>
                          <TouchableOpacity
                            onPress={() => handleDeleteTask(task.id)}
                            style={styles.trashBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedTaskId(isExpanded ? null : task.id)
                            }
                            style={styles.chevronBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color="#55685D"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Sub-row: Due Date Badge & Assigned Worker */}
                      <View style={styles.subRow}>
                        <View
                          style={[
                            styles.dueBadge,
                            {
                              backgroundColor: due.bg,
                              borderColor: due.border,
                            },
                          ]}
                        >
                          <Text style={[styles.dueBadgeText, { color: due.color }]}>
                            {due.label}
                          </Text>
                        </View>

                        <Text style={styles.workerText}>👤 {task.assignedTo}</Text>
                      </View>

                      {/* Expanded Details Panel (Matching Web Dashboard) */}
                      {isExpanded && (
                        <View style={styles.expandedPanel}>
                          <View style={styles.expandedGrid}>
                            <View style={styles.expandedItem}>
                              <Text style={styles.expLabel}>Due Status</Text>
                              <Text style={[styles.expVal, { color: due.color }]}>
                                {due.label}
                              </Text>
                            </View>
                            <View style={styles.expandedItem}>
                              <Text style={styles.expLabel}>Zone / Parcel</Text>
                              <Text style={styles.expVal}>{task.zone || 'All parcels'}</Text>
                            </View>
                            <View style={styles.expandedItem}>
                              <Text style={styles.expLabel}>Target Crop</Text>
                              <Text style={styles.expVal}>{task.crop || 'General'}</Text>
                            </View>
                            <View style={styles.expandedItem}>
                              <Text style={styles.expLabel}>Worker Assigned</Text>
                              <Text style={styles.expVal}>{task.assignedTo}</Text>
                            </View>
                          </View>

                          {task.instructions ? (
                            <View style={styles.instructionsBox}>
                              <Text style={styles.instructionsLabel}>Instructions</Text>
                              <Text style={styles.instructionsText}>
                                {task.instructions}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* CREATE FARM TASK MODAL (Slide-Up Bottom Sheet matching Image) */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpenDropdown(null);
          setIsCreateModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => {
              setOpenDropdown(null);
              setIsCreateModalOpen(false);
            }}
          />
          <View style={styles.modalCard}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Create Farm Task</Text>
                <Text style={styles.modalSub}>
                  Assign a field operation, spray, irrigation, or machinery schedule.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setOpenDropdown(null);
                  setIsCreateModalOpen(false);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#889B90" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Task Title * */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Apply Urea Top-Dressing in Zone A"
                  placeholderTextColor="#9CA3AF"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              {/* Row 1: Category * & Priority * */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'category' ? null : 'category')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {newCategory}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'category' && (
                    <View style={styles.dropdownList}>
                      {TASK_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.dropdownItem,
                            newCategory === cat && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setNewCategory(cat);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              newCategory === cat && styles.dropdownItemTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                          {newCategory === cat && (
                            <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Priority *</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'priority' ? null : 'priority')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {newPriority}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'priority' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'priority' && (
                    <View style={styles.dropdownList}>
                      {TASK_PRIORITIES.map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.dropdownItem,
                            newPriority === p && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setNewPriority(p);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              newPriority === p && styles.dropdownItemTextActive,
                            ]}
                          >
                            {p}
                          </Text>
                          {newPriority === p && (
                            <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Row 2: Assigned Farm * & Due Date * */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Assigned Farm *</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'farm' ? null : 'farm')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {newFarmName}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'farm' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'farm' && (
                    <View style={styles.dropdownList}>
                      {TASK_FARMS.map((farm) => (
                        <TouchableOpacity
                          key={farm}
                          style={[
                            styles.dropdownItem,
                            newFarmName === farm && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setNewFarmName(farm);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              newFarmName === farm && styles.dropdownItemTextActive,
                            ]}
                          >
                            {farm}
                          </Text>
                          {newFarmName === farm && (
                            <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Due Date *</Text>
                  <TouchableOpacity
                    style={styles.dateInputWrap}
                    onPress={() => setIsDatePickerOpen(true)}
                    activeOpacity={0.8}
                  >
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD-MM-YYYY"
                      placeholderTextColor="#9CA3AF"
                      value={newDueDate}
                      onChangeText={setNewDueDate}
                    />
                    <TouchableOpacity
                      onPress={() => setIsDatePickerOpen(true)}
                      style={{ padding: 4 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={17} color="#0C4B32" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 3: Field / Parcel Zone & Target Crop */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Field / Parcel Zone</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Zone A (12 Acres)"
                    placeholderTextColor="#9CA3AF"
                    value={newZone}
                    onChangeText={setNewZone}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Target Crop</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. PBW 826 Wheat"
                    placeholderTextColor="#9CA3AF"
                    value={newCrop}
                    onChangeText={setNewCrop}
                  />
                </View>
              </View>

              {/* Row 4: Assigned Worker / Operator & Initial Status */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Assigned Worker / Operator</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Harpreet Singh"
                    placeholderTextColor="#9CA3AF"
                    value={newAssignedTo}
                    onChangeText={setNewAssignedTo}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>Initial Status</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setOpenDropdown(openDropdown === 'status' ? null : 'status')
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectBtnText} numberOfLines={1}>
                      {newStatus}
                    </Text>
                    <Ionicons
                      name={openDropdown === 'status' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#55685D"
                    />
                  </TouchableOpacity>
                  {openDropdown === 'status' && (
                    <View style={styles.dropdownList}>
                      {TASK_STATUSES.map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.dropdownItem,
                            newStatus === st && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setNewStatus(st);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              newStatus === st && styles.dropdownItemTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                          {newStatus === st && (
                            <Ionicons name="checkmark-circle" size={14} color="#0C4B32" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Instructions & Field Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Instructions & Field Notes</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Apply 45kg/acre urea top dressing right after evening drip cycle..."
                  placeholderTextColor="#9CA3AF"
                  value={newInstructions}
                  onChangeText={setNewInstructions}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setOpenDropdown(null);
                  setIsCreateModalOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateTask}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Due Date Picker Modal */}
      <DatePickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Select Due Date"
        initialDate={newDueDate || '12-11-2026'}
        onSelectDate={(formattedDate) => {
          setNewDueDate(formattedDate);
          setIsDatePickerOpen(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#26352D' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // Header Block
  headerBlock: {
    gap: 12,
  },
  headerTitleWrap: {
    gap: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26352D',
  },
  mainSub: {
    fontSize: 12,
    color: '#55685D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 3,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  switchBtnTextActive: {
    color: '#0C4B32',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 4-Metric Strip
  metricStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  metricCardActive: {
    backgroundColor: '#E7F3EB',
    borderColor: '#0C4B32',
    borderWidth: 1.5,
  },
  metricCardActiveAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
    borderWidth: 1.5,
  },
  metricCardActiveBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  metricCardActiveGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0C4B32',
  },
  metricCardVal: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Filter Toolbar
  filterToolbar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 12,
    gap: 10,
  },
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 12,
    padding: 3,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#55685D',
  },
  filterPillTextActive: {
    color: '#0C4B32',
  },
  toolbarBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  farmSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#26352D',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: '#26352D',
    padding: 0,
  },

  // Task List Card
  taskListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    overflow: 'hidden',
  },
  taskItemsWrap: {
    // container
  },
  taskRow: {
    padding: 14,
    gap: 10,
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  taskRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxTouch: {
    paddingTop: 2,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#DCE6DE',
  },
  taskRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
    lineHeight: 18,
  },
  taskRowTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#889B90',
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    backgroundColor: '#E7F3EB',
    borderWidth: 1,
    borderColor: '#C6E2D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C4B32',
  },
  badgeBase: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTextBase: {
    fontSize: 10,
    fontWeight: '700',
  },
  farmPill: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  farmPillText: {
    fontSize: 10,
    color: '#55685D',
  },
  taskRowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trashBtn: {
    padding: 4,
  },
  chevronBtn: {
    padding: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  dueBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  workerText: {
    fontSize: 11,
    color: '#55685D',
    fontWeight: '500',
  },

  // Expanded Panel
  expandedPanel: {
    marginLeft: 30,
    marginTop: 6,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  expandedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  expandedItem: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 8,
    padding: 6,
  },
  expLabel: {
    fontSize: 9,
    color: '#889B90',
  },
  expVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
    marginTop: 2,
  },
  instructionsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 8,
    padding: 8,
    gap: 2,
  },
  instructionsLabel: {
    fontSize: 9,
    color: '#889B90',
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 11,
    color: '#55685D',
    lineHeight: 15,
  },

  // Calendar View
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    gap: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  calendarMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26352D',
  },
  todayBtn: {
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#26352D',
  },
  calendarSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26352D',
  },
  calDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F3EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  calDateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C4B32',
  },
  calTaskItem: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 10,
    padding: 10,
  },
  calTaskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26352D',
  },
  calTaskSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 2,
  },
  calNoTasks: {
    fontSize: 12,
    color: '#889B90',
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },

  // Empty
  emptyWrap: {
    padding: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  emptySub: {
    fontSize: 12,
    color: '#55685D',
  },

  // Modal (Slide-up Bottom Sheet)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    width: '100%',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26352D',
  },
  modalSub: {
    fontSize: 11,
    color: '#55685D',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 480,
  },
  modalBodyContent: {
    gap: 12,
    paddingVertical: 4,
  },
  formGroup: {
    gap: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#26352D',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectBtnText: {
    fontSize: 12,
    color: '#26352D',
    flex: 1,
  },
  dateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#26352D',
    minHeight: 65,
    textAlignVertical: 'top',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F8F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#E7F3EB',
  },
  dropdownItemText: {
    fontSize: 11,
    color: '#26352D',
    flex: 1,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#0C4B32',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
