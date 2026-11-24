import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CustomAlertModal,
  CustomAlertOptions,
  AlertType,
  AlertButton,
} from '../components/CustomAlertModal';

interface AlertContextType {
  showAlert: (options: CustomAlertOptions) => void;
  showWarning: (title: string, message: string, onConfirm?: () => void, confirmText?: string) => void;
  showDeleteConfirm: (title: string, message: string, onConfirm: () => void, deleteText?: string) => void;
  showSuccess: (title: string, message: string, onOk?: () => void) => void;
  showError: (title: string, message: string, onOk?: () => void) => void;
  showInfo: (title: string, message: string, onOk?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertOptions, setAlertOptions] = useState<CustomAlertOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (options: CustomAlertOptions) => {
    setAlertOptions(options);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    if (alertOptions?.onDismiss) {
      alertOptions.onDismiss();
    }
  };

  const showWarning = (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'Proceed'
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: onConfirm
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: confirmText, style: 'default', onPress: onConfirm },
          ]
        : [{ text: 'OK', style: 'default' }],
    });
  };

  const showDeleteConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    deleteText = 'Delete'
  ) => {
    showAlert({
      title,
      message,
      type: 'danger',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: deleteText, style: 'destructive', onPress: onConfirm },
      ],
    });
  };

  const showSuccess = (title: string, message: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'Got it', style: 'default', onPress: onOk }],
    });
  };

  const showError = (title: string, message: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'danger',
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  };

  const showInfo = (title: string, message: string, onOk?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showWarning,
        showDeleteConfirm,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {children}
      <CustomAlertModal
        visible={visible}
        options={alertOptions}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
