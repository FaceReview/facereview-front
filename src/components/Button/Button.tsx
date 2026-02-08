import plusIcon from 'assets/img/plusIcon.png';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import './button.scss';

type ButtonVariant =
  | 'cta-full'
  | 'cta-fit'
  | 'cta-fit-secondary'
  | 'small'
  | 'small-outline'
  | 'extra-small'
  | 'with-keyboard'
  | 'cta-fixed'
  | 'cta-fixed-secondary'
  | 'add';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant: ButtonVariant;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  restProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, variant, className, style, disabled, ...restProps }, ref) => {
    const fontOfType: Record<ButtonVariant, string> = {
      'cta-full': 'font-label-large',
      'cta-fit': 'font-label-large',
      'cta-fit-secondary': 'font-label-large',
      small: 'font-label-medium',
      'small-outline': 'font-label-medium',
      'extra-small': 'font-label-small',
      'with-keyboard': 'font-label-large',
      'cta-fixed': 'font-label-large',
      'cta-fixed-secondary': 'font-label-large',
      add: '',
    };

    const renderContent = () => {
      if (variant === 'add') {
        return <img className="button-add-img" src={plusIcon} alt="Add" />;
      }
      return label;
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`button ${variant} ${fontOfType[variant]} ${
          disabled ? 'disabled' : ''
        } ${className || ''}`}
        style={style}
        {...restProps}>
        <div className="dim"></div>
        {renderContent()}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
