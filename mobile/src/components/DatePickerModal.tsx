import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (formattedDate: string) => void; // Returns "DD-MM-YYYY"
  initialDate?: string; // "DD-MM-YYYY" or "YYYY-MM-DD"
  title?: string;
  isExpiry?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  initialDate,
  title = 'Select Date',
  isExpiry = false,
}) => {
  // Parse initialDate
  const parseInitialDate = () => {
    if (!initialDate) return new Date(2026, 10, 12); // Default Nov 12, 2026
    const parts = initialDate.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        // DD-MM-YYYY
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    return new Date(2026, 10, 12);
  };

  const [selectedDate, setSelectedDate] = useState<Date>(parseInitialDate());
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  useEffect(() => {
    if (visible) {
      const d = parseInitialDate();
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [visible, initialDate]);

  // Format as DD-MM-YYYY
  const formatDateStr = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onSelectDate(formatDateStr(selectedDate));
    onClose();
  };

  // Quick preset offsets (in days)
  const applyPresetDays = (days: number) => {
    const base = new Date(2026, 10, 12); // Base Nov 12, 2026
    const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Days matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const daysCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysCells.push(i);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheetCard}>
          {/* Pull Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subTitle}>Selected: {formatDateStr(selectedDate)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#889B90" />
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => applyPresetDays(0)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetChipText}>Today</Text>
            </TouchableOpacity>
            {isExpiry ? (
              <>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => applyPresetDays(180)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>+6 Months</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => applyPresetDays(365)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>+1 Year</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => applyPresetDays(730)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>+2 Years</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => applyPresetDays(-7)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>-7 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => applyPresetDays(-30)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>-1 Month</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color="#26352D" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={18} color="#26352D" />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((w, idx) => (
              <Text key={idx} style={styles.weekDayText}>
                {w}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {daysCells.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Set Date ({formatDateStr(selectedDate)})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECE7',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26352D',
  },
  subTitle: {
    fontSize: 12,
    color: '#0C4B32',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0C4B32',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F4F8F4',
    borderWidth: 1,
    borderColor: '#DCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26352D',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F8F4',
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#889B90',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 4,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#0C4B32',
  },
  dayText: {
    fontSize: 13,
    color: '#26352D',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5ECE7',
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE6DE',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#55685D',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0C4B32',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

