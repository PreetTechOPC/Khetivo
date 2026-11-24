import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type AlertType = 'warning' | 'danger' | 'success' | 'info';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface CustomAlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

interface CustomAlertModalProps {
  visible: boolean;
  options: CustomAlertOptions | null;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  options,
  onClose,
}) => {
  if (!options) return null;

  const { title, message, type = 'warning', buttons = [{ text: 'OK' }] } = options;

  const getIconConfig = () => {
    switch (type) {
      case 'danger':
        return {
          bg: '#FEE2E2',
          border: '#FECACA',
          iconColor: '#DC2626',
          icon: 'alert-circle' as const,
        };
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: '#FDE68A',
          iconColor: '#D97706',
          icon: 'warning' as const,
        };
      case 'success':
        return {
          bg: '#DCFCE7',
          border: '#BBF7D0',
          iconColor: '#16A34A',
          icon: 'checkmark-circle' as const,
        };
      case 'info':
      default:
        return {
          bg: '#E0F2FE',
          border: '#BAE6FD',
          iconColor: '#0284C7',
          icon: 'information-circle' as const,
        };
    }
  };

  const iconCfg = getIconConfig();

  const handleButtonPress = (btn: AlertButton) => {
    onClose();
    if (btn.onPress) {
      btn.onPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Icon */}
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: iconCfg.bg, borderColor: iconCfg.border },
                ]}
              >
                <Ionicons name={iconCfg.icon} size={28} color={iconCfg.iconColor} />
              </View>

              {/* Title & Description */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Buttons */}
              <View
                style={[
                  styles.buttonsContainer,
                  buttons.length > 2 && styles.buttonsColumn,
                ]}
              >
                {buttons.map((btn, idx) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  let btnStyle: any = styles.defaultBtn;
                  let textStyle: any = styles.defaultBtnText;

                  if (isCancel) {
                    btnStyle = styles.cancelBtn;
                    textStyle = styles.cancelBtnText;
                  } else if (isDestructive) {
                    btnStyle = styles.destructiveBtn;
                    textStyle = styles.destructiveBtnText;
                  } else if (type === 'danger') {
                    btnStyle = styles.destructiveBtn;
                    textStyle = styles.destructiveBtnText;
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.baseBtn,
                        btnStyle,
                        buttons.length === 2 && styles.flexBtn,
                      ]}
                      onPress={() => handleButtonPress(btn)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.baseBtnText, textStyle]}>{btn.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 26, 18, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5ECE7',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#26352D',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    color: '#55685D',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  buttonsColumn: {
    flexDirection: 'column',
    width: '100%',
  },
  baseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  baseBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  defaultBtn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultBtnText: {
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    color: '#4B5563',
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  destructiveBtnText: {
    color: '#FFFFFF',
  },
});
