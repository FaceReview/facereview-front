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
  maxSelection = 3,
}: CategoryListPropType): ReactElement => {
  const categoryByName = CATEGORY_ITEMS.reduce(
    (acc, item) => {
      acc[item.id] = `${item.emoji} ${item.label}`;
      return acc;
    },
    {} as Record<CategoryType, string>,
  );

  const categories = CATEGORY_ITEMS.map((item) => item.id);

  const handleCategoryClick = (category: CategoryType) => {
    if (selected.includes(category)) {
      const popedCategoryList = selected.filter((item) => item !== category);
      onChange(popedCategoryList);
      return;
    }
    if (selected.length < maxSelection) {
      const pushedCategoryList = [...selected, category];
      onChange(pushedCategoryList);
    }
  };

  return (
    <div className="categories-container">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-item ${
            selected.includes(category) ? 'selected' : null
          }`}
          onClick={() => handleCategoryClick(category)}>
          <p className="font-label-medium">{categoryByName[category]}</p>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
