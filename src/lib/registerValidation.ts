export interface RegisterValidationInput {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterValidationResult {
  isValid: boolean
  message: string | null
}

export const FULL_NAME_MAX_LENGTH = 80
export const USERNAME_MAX_LENGTH = 32
export const PASSWORD_MIN_LENGTH = 8

const usernamePattern = /^[a-zA-Z0-9._-]+$/
const hasLetterPattern = /[A-Za-z]/
const hasNumberPattern = /\d/
const hasSpecialCharacterPattern = /[^A-Za-z0-9]/

export function validateRegisterInput({
  fullName,
  username,
  email,
  password,
  confirmPassword,
}: RegisterValidationInput): RegisterValidationResult {
  const normalizedFullName = fullName.trim()
  const normalizedUsername = username.trim()
  const normalizedEmail = email.trim()

  if (!normalizedFullName || !normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
    return {
      isValid: false,
      message: 'Please fill in all fields.',
    }
  }

  if (normalizedFullName.length > FULL_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Full name must be ${FULL_NAME_MAX_LENGTH} characters or fewer.`,
    }
  }

  if (normalizedUsername.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`,
    }
  }

  if (!usernamePattern.test(normalizedUsername)) {
    return {
      isValid: false,
      message: 'Username can only include letters, numbers, periods, underscores, and hyphens.',
    }
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match.',
    }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    }
  }

  if (
    !hasLetterPattern.test(password) ||
    !hasNumberPattern.test(password) ||
    !hasSpecialCharacterPattern.test(password)
  ) {
    return {
      isValid: false,
      message: 'Password must include letters, numbers, and a special character.',
    }
  }

  return {
    isValid: true,
    message: null,
  }
}

export function getRegisterErrorMessage(message: string, identitiesCount?: number): string {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('already registered')) {
    return 'An account with this email already exists.'
  }

  if (normalizedMessage.includes('duplicate key')) {
    return 'An account with this email already exists.'
  }

  if (identitiesCount === 0) {
    return 'An account with this email already exists.'
  }

  return message
}
