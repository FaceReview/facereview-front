import { ReactElement } from 'react';
import { CategoryType } from 'types/index';
import './categorylist.scss';
import { CATEGORY_ITEMS } from 'constants/index';

type CategoryListPropType = {
  selected: CategoryType[];
  onChange: (categories: CategoryType[]) => void;
  maxSelection?: number;
};

const CategoryList = ({
  selected,
  onChange,
  maxSelection,
}: CategoryListPropType): ReactElement => {
  const handleCategoryClick = (category: CategoryType) => {
    if (selected.includes(category)) {
      onChange(selected.filter((item) => item !== category));
      return;
    }
    if (maxSelection !== undefined) {
      if (maxSelection === 1) {
        onChange([category]);
        return;
      }
      if (selected.length >= maxSelection) return;
    }
    onChange([...selected, category]);
  };

  return (
    <div className="categories-container">
      {CATEGORY_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={selected.includes(item.id)}
          className={`category-item font-label-medium ${
            selected.includes(item.id) ? 'selected' : ''
          }`}
          onClick={() => handleCategoryClick(item.id)}>
          <p className="font-label-medium">{`${item.emoji} ${item.label}`}</p>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
