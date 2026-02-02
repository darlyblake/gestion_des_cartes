import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  variant?: 'default' | 'ghost' | 'outline' | 'filled'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'default' | 'error' | 'success' | 'warning'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  fullWidth?: boolean
  loading?: boolean
  clearable?: boolean
  showCounter?: boolean
  floatingLabel?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'default',
    size = 'md',
    status = 'default',
    leftIcon,
    rightIcon,
    label,
    helperText,
    fullWidth = false,
    disabled = false,
    required = false,
    loading = false,
    clearable = false,
    showCounter = false,
    floatingLabel = false,
    maxLength,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [isHovered, setIsHovered] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)
    const [internalValue, setInternalValue] = React.useState(props.value || props.defaultValue || '')

    React.useEffect(() => {
      setHasValue(!!props.value)
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value)
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleClear = () => {
      const event = { 
        target: { 
          value: '',
          name: props.name,
          id: props.id
        }
      } as React.ChangeEvent<HTMLInputElement>
      
      setInternalValue('')
      setHasValue(false)
      props.onChange?.(event)
    }

    // Styles constants
    const baseStyles = "relative flex items-center rounded-lg font-medium transition-all duration-200 outline-none"
    
    const sizeStyles = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-4 text-base",
      xl: "h-14 px-5 text-lg"
    }

    const variantStyles = {
      default: {
        base: "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm",
        hover: "hover:border-gray-400 dark:hover:border-gray-600",
        focus: "focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",
        disabled: "disabled:bg-gray-100 dark:disabled:bg-gray-800"
      },
      ghost: {
        base: "bg-transparent border-transparent",
        hover: "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        focus: "focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500 dark:focus:border-primary-400",
        disabled: "disabled:bg-transparent"
      },
      outline: {
        base: "bg-transparent border-2",
        hover: "hover:border-gray-400 dark:hover:border-gray-600",
        focus: "focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",
        disabled: "disabled:border-gray-200 dark:disabled:border-gray-700"
      },
      filled: {
        base: "bg-gray-100 dark:bg-gray-800 border-transparent",
        hover: "hover:bg-gray-200 dark:hover:bg-gray-700",
        focus: "focus:bg-white dark:focus:bg-gray-900 focus:border-primary-500 dark:focus:border-primary-400",
        disabled: "disabled:bg-gray-100 dark:disabled:bg-gray-800"
      }
    }

    const statusStyles = {
      default: {
        border: isFocused ? "border-primary-500 dark:border-primary-400" : "border-gray-300 dark:border-gray-700",
        text: "text-gray-900 dark:text-gray-100",
        placeholder: "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        icon: "text-gray-500 dark:text-gray-400",
        ring: "focus:ring-primary-500/20 dark:focus:ring-primary-400/20"
      },
      error: {
        border: isFocused ? "border-destructive-600 dark:border-destructive-500" : "border-destructive-500 dark:border-destructive-400",
        text: "text-destructive-700 dark:text-destructive-300",
        placeholder: "placeholder:text-destructive-400 dark:placeholder:text-destructive-500",
        icon: "text-destructive-500 dark:text-destructive-400",
        ring: "focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
      },
      success: {
        border: isFocused ? "border-success-600 dark:border-success-500" : "border-success-500 dark:border-success-400",
        text: "text-success-700 dark:text-success-300",
        placeholder: "placeholder:text-success-400 dark:placeholder:text-success-500",
        icon: "text-success-500 dark:text-success-400",
        ring: "focus:ring-success-500/20 dark:focus:ring-success-400/20"
      },
      warning: {
        border: isFocused ? "border-warning-600 dark:border-warning-500" : "border-warning-500 dark:border-warning-400",
        text: "text-warning-700 dark:text-warning-300",
        placeholder: "placeholder:text-warning-400 dark:placeholder:text-warning-500",
        icon: "text-warning-500 dark:text-warning-400",
        ring: "focus:ring-warning-500/20 dark:focus:ring-warning-400/20"
      }
    }

    const currentStatus = statusStyles[status]
    const currentVariant = variantStyles[variant]

    // Build input classes
    const inputClasses = cn(
      baseStyles,
      sizeStyles[size],
      currentVariant.base,
      !disabled && currentVariant.hover,
      !disabled && currentVariant.focus,
      disabled && currentVariant.disabled,
      currentStatus.border,
      currentStatus.text,
      currentStatus.placeholder,
      disabled && "opacity-50 cursor-not-allowed",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      (clearable && hasValue && !disabled) && "pr-12",
      loading && "pr-12",
      fullWidth && "w-full",
      "disabled:pointer-events-none",
      className
    )

    // Icon wrapper styles
    const iconWrapperClasses = cn(
      "absolute inset-y-0 flex items-center pointer-events-none",
      currentStatus.icon,
      size === 'sm' ? "text-base" : size === 'lg' ? "text-xl" : size === 'xl' ? "text-2xl" : "text-lg"
    )

    // Label styles
    const labelClasses = cn(
      "block text-sm font-medium mb-2 transition-colors duration-200",
      status === 'error' && "text-destructive-600 dark:text-destructive-400",
      status === 'success' && "text-success-600 dark:text-success-400",
      status === 'warning' && "text-warning-600 dark:text-warning-400",
      disabled && "opacity-50"
    )

    // Floating label styles
    const floatingLabelClasses = cn(
      "absolute left-3 pointer-events-none transition-all duration-200 transform origin-left",
      hasValue || isFocused 
        ? cn(
            "text-xs -translate-y-7 scale-90",
            size === 'sm' ? "-translate-y-6" : size === 'lg' ? "-translate-y-8" : size === 'xl' ? "-translate-y-9" : "-translate-y-7",
            status === 'error' && "text-destructive-600 dark:text-destructive-400",
            status === 'success' && "text-success-600 dark:text-success-400",
            status === 'warning' && "text-warning-600 dark:text-warning-400",
            "bg-white dark:bg-gray-900 px-1",
            variant === 'filled' && "bg-gray-100 dark:bg-gray-800"
          )
        : cn(
            "text-gray-500 dark:text-gray-400",
            size === 'sm' ? "text-sm" : size === 'lg' ? "text-base" : size === 'xl' ? "text-lg" : "text-sm"
          ),
      leftIcon && "left-10"
    )

    // Helper text styles
    const helperTextClasses = cn(
      "mt-2 text-xs transition-colors duration-200",
      status === 'error' && "text-destructive-600 dark:text-destructive-400",
      status === 'success' && "text-success-600 dark:text-success-400",
      status === 'warning' && "text-warning-600 dark:text-warning-400",
      status === 'default' && "text-gray-500 dark:text-gray-400",
      disabled && "opacity-50"
    )

    // Counter styles
    const counterClasses = cn(
      "flex justify-end mt-1 text-xs",
      maxLength && (String(internalValue).length > maxLength * 0.9) 
        ? "text-warning-600 dark:text-warning-400" 
        : "text-gray-500 dark:text-gray-400"
    )

    // Inline CSS styles
    const styles = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .input-clear-btn {
        background: none;
        border: none;
        padding: 2px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .input-clear-btn:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.1);
      }
      
      .dark .input-clear-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .input-loading-spinner {
        animation: spin 1s linear infinite;
      }
      
      .input-focus-ring {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .input-focus-ring.error {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
      
      .input-focus-ring.success {
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
      }
      
      .input-focus-ring.warning {
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
      }
      
      .input-disabled-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.5);
        border-radius: inherit;
        pointer-events: none;
      }
      
      .dark .input-disabled-overlay {
        background: rgba(0, 0, 0, 0.3);
      }
      
      .input-wrapper {
        position: relative;
        transition: all 0.2s ease;
      }
      
      .input-wrapper:hover .input-border-effect {
        opacity: 0.3;
      }
      
      .input-border-effect {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        background: linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%);
        background-size: 200% 200%;
      }
      
      .input-border-effect.error {
        background: linear-gradient(45deg, transparent 40%, rgba(239, 68, 68, 0.1) 50%, transparent 60%);
      }
      
      .input-border-effect.success {
        background: linear-gradient(45deg, transparent 40%, rgba(34, 197, 94, 0.1) 50%, transparent 60%);
      }
      
      .input-border-effect.warning {
        background: linear-gradient(45deg, transparent 40%, rgba(245, 158, 11, 0.1) 50%, transparent 60%);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .input-clear-btn,
        .input-border-effect,
        .input-wrapper {
          transition: none !important;
        }
        
        .input-loading-spinner {
          animation: none !important;
        }
      }
    `

    return (
      <>
        <div className={cn("space-y-1", fullWidth && "w-full")}>
          {label && !floatingLabel && (
            <label className={labelClasses}>
              {label}
              {required && <span className="ml-1 text-destructive-500">*</span>}
            </label>
          )}
          
          <div 
            className="input-wrapper"
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => !disabled && setIsHovered(false)}
          >
            {floatingLabel && label && (
              <label className={floatingLabelClasses}>
                {label}
                {required && <span className="ml-1 text-destructive-500">*</span>}
              </label>
            )}
            
            {/* Border effect */}
            {!disabled && isHovered && (
              <div className={cn("input-border-effect", status !== 'default' && status)} />
            )}
            
            {/* Left icon */}
            {leftIcon && (
              <div className={cn(iconWrapperClasses, "left-3")}>
                {leftIcon}
              </div>
            )}
            
            {/* Input element */}
            <input
              ref={ref}
              type={type}
              data-slot="input"
              className={cn(inputClasses, isFocused && "input-focus-ring")}
              disabled={disabled}
              required={required}
              value={props.value !== undefined ? props.value : internalValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength={maxLength}
              {...props}
              aria-invalid={status === 'error' ? 'true' : 'false'}
              aria-describedby={helperText ? `${props.id}-helper-text` : undefined}
            />
            
            {/* Right icon */}
            {rightIcon && !loading && !(clearable && hasValue) && (
              <div className={cn(iconWrapperClasses, "right-3")}>
                {rightIcon}
              </div>
            )}
            
            {/* Clear button */}
            {clearable && hasValue && !disabled && !loading && (
              <button
                type="button"
                className="absolute right-3 inset-y-0 flex items-center"
                onClick={handleClear}
                aria-label="Effacer le texte"
              >
                <div className="input-clear-btn">
                  <svg 
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Loading spinner */}
            {loading && (
              <div className="absolute right-3 inset-y-0 flex items-center">
                <svg 
                  className="input-loading-spinner w-4 h-4 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                  />
                </svg>
              </div>
            )}
            
            {/* Disabled overlay */}
            {disabled && (
              <div className="input-disabled-overlay" />
            )}
          </div>
          
          {/* Helper text */}
          {helperText && (
            <p 
              id={props.id ? `${props.id}-helper-text` : undefined}
              className={helperTextClasses}
              {...(status === 'error' ? { role: 'alert' } : {})}
            >
              {helperText}
            </p>
          )}
          
          {/* Character counter */}
          {showCounter && maxLength && (
            <div className={counterClasses}>
              <span>
                {String(internalValue).length} / {maxLength}
              </span>
            </div>
          )}
        </div>
      </>
    )
  }
)

Input.displayName = 'Input'

export { Input }