import { forwardRef } from 'react';
import './textinput.scss';

type TextInputPropsType = {
  id?: string;
  inputType?: 'default' | 'underline';
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style?: React.CSSProperties;
  minLength?: number;
  maxLength?: number;
  autoFocus?: boolean;
  isDisabled?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, TextInputPropsType>(
  (
    {
      id,
      inputType = 'default',
      type = 'text',
      value,
      onChange,
      placeholder,
      style,
      minLength,
      maxLength,
      autoFocus,
      isDisabled,
    },
    ref,
  ) => {
    return (
      <input
        id={id}
        ref={ref}
        type={type}
        className={`text-input font-body-large ${inputType}`}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        style={style}
        minLength={minLength || undefined}
        maxLength={maxLength || undefined}
        autoFocus={autoFocus}
        disabled={isDisabled}
      />
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
