import { forwardRef } from 'react';
import './textinput.scss';

type TextInputPropsType = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'underline';
};

const TextInput = forwardRef<HTMLInputElement, TextInputPropsType>(
  ({ className, variant = 'default', ...restProps }, ref) => {
    return (
      <input
        ref={ref}
        className={`text-input font-body-large ${variant} ${className || ''}`}
        {...restProps}
      />
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
