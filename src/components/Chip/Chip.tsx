import React, { ReactElement } from "react";
import "./chip.scss";

import plusIcon from "assets/img/plusIcon.png";

type ChipPropsType = {
  type: "category-big" | "category-small";
  choose: "all" | "happy" | "surprise" | "angry" | "sad" | "plus";
  style?: React.CSSProperties;
  isSelected?: boolean;
  onClick: () => void;
};

const Chip = ({
  type,
  choose,
  style,
  isSelected,
  onClick,
}: ChipPropsType): ReactElement => {
  const fontOfType = {
    "category-big": "font-label-large",
    "category-small": "font-label-medium",
  };
  const labelOfChoose = {
    all: "전체",
    happy: "😄 즐거운",
    surprise: "🫢 놀라운",
    angry: "😠 화나는",
    sad: "😥 슬픈",
    plus: <img className="plus-icon" src={plusIcon} alt="plusIcon" />,
  };

  // Create a class string based on the type and emotion
  const chipClass = `chip ${type} ${choose} ${fontOfType[type]} ${
    isSelected ? "selected" : ""
  }`;

  return (
    <button className={chipClass} style={style} onClick={onClick}>
      {labelOfChoose[choose]}
    </button>
  );
};

export default Chip;
