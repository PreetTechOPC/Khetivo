import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  sendPasswordRecovery,
} from '../services/appwrite';

interface AuthScreenProps {
  onLoginSuccess: (
    user: { name: string; email: string; phone?: string; id?: string },
    isNewSignUp?: boolean
  ) => void;
  onBack?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onBack,
  initialMode = 'signin',
}) => {
  const { showAlert, showError, showSuccess, showWarning } = useAlert();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authLoading, setAuthLoading] = useState<'google' | 'submit' | null>(null);
  const loading = authLoading !== null;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email, Gmail or Farmer ID
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password modal state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email, Gmail or Farmer ID is required';
    } else if (mode === 'signup' && identifier.includes('@') && !/\S+@\S+\.\S+/.test(identifier)) {
      newErrors.identifier = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (phoneNumber.replace(/\D/g, '').length < 10) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setAuthLoading('submit');

    // If identifier looks like an email address, authenticate through Appwrite
    const isEmail = identifier.includes('@');
    if (isEmail) {
      try {
        if (mode === 'signin') {
          const user = await loginWithEmail(identifier.trim(), password);
          setAuthLoading(null);
          onLoginSuccess({
            name: user.name,
            email: user.email,
            phone: user.phone || '+91 98140-54321',
            id: user.id,
          });
          return;
        } else {
          const user = await registerWithEmail(
            identifier.trim(),
            password,
            fullName.trim(),
            phoneNumber.trim() ? `+91 ${phoneNumber.trim()}` : undefined
          );
          setAuthLoading(null);
          showAlert({
            title: 'Account Created!',
            message: `Welcome to Khetivo, ${user.name}! Please review our farmer subscription plans to activate your holdings.`,
            type: 'success',
            buttons: [
              {
                text: 'View Plans',
                style: 'default',
                onPress: () => {
                  onLoginSuccess(
                    {
                      name: user.name,
                      email: user.email,
                      phone: user.phone || '+91 98140-54321',
                      id: user.id,
                    },
                    true
                  );
                },
              },
            ],
          });
          return;
        }
      } catch (err: any) {
        setAuthLoading(null);
        const errorMsg = err?.message || 'Authentication failed';
        console.warn('Appwrite email auth warning:', errorMsg);
        showError(mode === 'signin' ? 'Sign In Failed' : 'Registration Failed', errorMsg);
        return;
      }
    }

    // Farmer ID or Local account login (e.g. KV-1042)
    setAuthLoading(null);
    const displayName = fullName.trim() || (identifier.includes('@') ? identifier.split('@')[0] : 'Mohan Lal');
    const isSignup = mode === 'signup';
    onLoginSuccess(
      {
        name: displayName,
        email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@khetivo.farm`,
        phone: phoneNumber ? `+91 ${phoneNumber}` : '+91 98140-54321',
        id: identifier.startsWith('KV-') ? identifier : 'KV-FARM-1042',
      },
      isSignup
    );
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading('google');
      const user = await loginWithGoogle();
      setAuthLoading(null);

      if (!user) {
        // User cancelled the auth browser session
        return;
      }

      showAlert({
        title: 'Google Sign In Successful',
        message: `Welcome to Khetivo, ${user.name}! Signed in via Appwrite with ${user.email}.`,
        type: 'success',
        buttons: [
          {
            text: 'Continue to Dashboard',
            style: 'default',
            onPress: () => {
              onLoginSuccess({
                name: user.name,
                email: user.email,
                phone: user.phone || '+91 98765-43210',
                id: user.id,
              });
            },
          },
        ],
      });
    } catch (error: any) {
      setAuthLoading(null);
      console.error('Appwrite Google Sign-In Error:', error);
      showError(
        'Google Authentication',
        error?.message || 'Unable to complete Google sign-in with Appwrite. Please verify your connection and try again.'
      );
    }
  };

  const handleForgotPassword = () => {
    setForgotEmail(identifier.includes('@') ? identifier : '');
    setForgotSuccess(false);
    setForgotModalVisible(true);
  };

  const handleSendResetEmail = async () => {
    const emailToReset = forgotEmail.trim();
    if (!emailToReset || !/\S+@\S+\.\S+/.test(emailToReset)) {
      showWarning('Invalid Email', 'Please enter a valid email address to receive password reset instructions.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendPasswordRecovery(emailToReset);
      setForgotLoading(false);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotLoading(false);
      const msg = err?.message || 'Could not send reset email. Please try again.';
      showError('Reset Request', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}

          <Image
            source={require('../../assets/logo-khetivo-cropped.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card & Segmented Control */}
          <View style={styles.headerCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="sprout" size={26} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>
              {mode === 'signin' ? 'Welcome Back, Kisan!' : 'Create Your Farm Account'}
            </Text>
            <Text style={styles.headerSub}>
              {mode === 'signin'
                ? 'Sign in to access your farm telemetry, weather advisories & ledger'
                : 'Join thousands of progressive growers with precision farm intelligence'}
            </Text>

            {/* Mode Segmented Tab Switcher */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'signin' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('signin');
                  setErrors({});
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'signup' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('signup');
                  setErrors({});
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FORM FIELDS (Gmail, Email, ID & Password) */}
          <View style={styles.formCard}>
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Farmer Full Name</Text>
                <View style={[styles.inputContainer, errors.fullName && styles.inputContainerError]}>
                  <Ionicons name="person-outline" size={18} color="#55685D" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Jaswinder Singh"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>
            )}

            {/* Mobile Number (Sign Up only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number (for Kisan SMS & OTP)</Text>
                <View style={[styles.inputContainer, errors.phoneNumber && styles.inputContainerError]}>
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryBadgeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={phoneNumber}
                    onChangeText={(val) => {
                      setPhoneNumber(val.replace(/\D/g, ''));
                      if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                    }}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>
            )}

            {/* Gmail / Email / Farmer ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {mode === 'signin' ? 'Gmail, Email or Farmer ID' : 'Gmail / Email Address'}
              </Text>
              <View style={[styles.inputContainer, errors.identifier && styles.inputContainerError]}>
                <Ionicons name="mail-outline" size={18} color="#55685D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={identifier}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder={
                    mode === 'signin' ? 'e.g. mohan.lal@gmail.com or KV-1042' : 'e.g. farmer@gmail.com'
                  }
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.identifier && <Text style={styles.errorText}>{errors.identifier}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {mode === 'signin' ? 'Password' : 'Create Password (min. 6 characters)'}
              </Text>
              <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                <Ionicons name="lock-closed-outline" size={18} color="#55685D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#55685D" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="Re-enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={19}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {/* Remember Me & Forgot Password Row (Sign In) */}
            {mode === 'signin' && (
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={rememberMe ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={rememberMe ? colors.primary : '#9CA3AF'}
                  />
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Terms notice (Sign Up) */}
            {mode === 'signup' && (
              <View style={styles.termsRow}>
                <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                <Text style={styles.termsText}>
                  By creating an account, you agree to Khetivo’s Agricultural Terms & Privacy Policy.
                </Text>
              </View>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {authLoading === 'submit' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {mode === 'signin' ? 'Sign In to Farm Dashboard' : 'Create Free Farm Account'}
                  </Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with Google</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* GOOGLE SIGN IN BUTTON */}
          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.submitBtnDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {authLoading === 'google' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <Path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <Path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <Path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </Svg>
                <Text style={styles.googleBtnText}>
                  {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </Text>
              </>
            )}
          </TouchableOpacity>


          {/* Bottom Switcher Footer */}
          <View style={styles.footerWrap}>
            <Text style={styles.footerPrompt}>
              {mode === 'signin' ? "Don't have an account yet?" : 'Already registered with Khetivo?'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrors({});
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>
                {mode === 'signin' ? 'Create an Account' : 'Sign In Here'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Banner */}
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={13} color={colors.primary} />
            <Text style={styles.securityText}>
              256-bit Encrypted Kisan Data Security • Certified PAU University Standards
            </Text>
          </View>
        </ScrollView>

        {/* FORGOT PASSWORD MODAL */}
        <Modal
          visible={forgotModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setForgotModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderIconCircle}>
                  <Ionicons name="key-outline" size={22} color={colors.primary} />
                </View>
                <TouchableOpacity
                  onPress={() => setForgotModalVisible(false)}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>Reset Your Password</Text>
              <Text style={styles.modalSub}>
                Enter the email address registered with your Khetivo farm account. We’ll send you a secure password reset link.
              </Text>

              {forgotSuccess ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.successTitle}>Recovery Email Sent!</Text>
                  <Text style={styles.successSub}>
                    Please check your inbox ({forgotEmail}) for instructions to reset your password.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => setForgotModalVisible(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalPrimaryBtnText}>Back to Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Registered Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={18} color="#55685D" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="farmer@khetivo.farm"
                        placeholderTextColor="#9CA3AF"
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, forgotLoading && styles.submitBtnDisabled]}
                    onPress={handleSendResetEmail}
                    disabled={forgotLoading}
                    activeOpacity={0.85}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.modalPrimaryBtnText}>Send Reset Link</Text>
                        <Feather name="send" size={15} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setForgotModalVisible(false)}
                    style={styles.modalCancelBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    height: 32,
    width: 120,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E7F3EB',
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },

  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7F3EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C6E2D0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
    width: '100%',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  inputContainerError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 8,
  },
  countryBadge: {
    paddingRight: 8,
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  countryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 1,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#E7F3EB',
    padding: 10,
    borderRadius: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: colors.primary,
    lineHeight: 15,
    fontWeight: '500',
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 6,
  },
  footerPrompt: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },

  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalForm: {
    gap: 14,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  successSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
});

