import React from 'react';
import './divider.scss';

type DividerPropsType = {
  style?: React.CSSProperties;
};

const Divider = ({ style }: DividerPropsType) => {
  return <div className="divider" style={style}></div>;
};

export default Divider;
