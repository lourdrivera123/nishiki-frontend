'use client';

import { MenuMeatballIcon } from '@/assets/images/icons';
import { Icon } from '@/components/ui';
import {
  AddButton,
  BadgeList,
  FilterButton,
  FoodList,
  FoodSort,
  SearchBar,
} from '@/features/foods/components';
import { IFoodView } from '@/features/foods/types/FoodTypes';
import {
  createContainerIdGroupIdMap,
  createContainerIdNameMap,
  createGroupIdNameMap,
  groupContainersByGroupId,
} from '@/features/foods/utils/containerMapping';
import { IContainer, IFood } from '@/types/definition';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const FoodsPage = ({ containers }: { containers: IContainer[] }) => {
  const searchParams = useSearchParams();
  const sort = searchParams?.get('sort') || '';
  const group = searchParams?.get('group') || '';
  const container = searchParams?.get('container') || '';
  const [displayedFoods, setDisplayedFoods] = useState<IFoodView[]>([]);
  const [query, setQuery] = useState<string>(searchParams?.get('query') || '');
  const [categoryList, setCategoryList] = useState<string[]>(
    searchParams?.get('category')?.split(',') || [],
  );
  const isFilterSet = !!group || !!container || !!query || Object.keys(categoryList).length > 0;

  const groupIdContainerIdsMap = groupContainersByGroupId(containers);
  const containerIdGroupIdMap = createContainerIdGroupIdMap(containers);
  const containerIdNameMap = createContainerIdNameMap(containers);
  const groupIdNameMap = createGroupIdNameMap(containers);

  useEffect(() => {
    const categoryList = searchParams?.get('category')?.split(',') || [];
    setCategoryList(categoryList);
    setQuery(searchParams?.get('query') || '');
    const filterByGroup = (row: IContainer) => group === '' || group === row.group.id;
    const filterByContainer = (row: IContainer) => container === '' || container === row.id;
    const filterByCategory = (food: IFoodView) => {
      if (!categoryList.length) return true;
      return categoryList.some((c) => food.category.includes(c));
    };
    const filterByName = (food: IFoodView) => food.name.toLowerCase().includes(query.toLowerCase());

    const filteredContainers = containers.filter(filterByGroup).filter(filterByContainer);
    const initialFoodsView: IFoodView[] = filteredContainers.flatMap((container: IContainer) =>
      container.foods.map((food: IFood) => ({
        ...food,
        containerId: container.id,
      })),
    );
    const filteredFoods = initialFoodsView.filter(filterByName).filter(filterByCategory);

    const sortFoods = (a: IFood, b: IFood) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          return a.expiry < b.expiry ? -1 : 1;
        default:
          return a.createdAt > b.createdAt ? -1 : 1; // default is createdAt desc order
      }
    };

    const sortedFoods = [...filteredFoods].sort(sortFoods);
    setDisplayedFoods(sortedFoods);
  }, [containers, query, sort, group, container, searchParams]);

  return (
    <div className="mt-6 mx-4 relative">
      <AddButton
        className="fixed bottom-[5.5rem] right-4"
        groupIdContainerIdsMap={groupIdContainerIdsMap}
        containerIdGroupIdMap={containerIdGroupIdMap}
        containerIdNameMap={containerIdNameMap}
        groupIdNameMap={groupIdNameMap}
      />
      <div className="relative">
        <SearchBar />
        <FilterButton
          isFilterSet={isFilterSet}
          groupIdContainerIdsMap={groupIdContainerIdsMap}
          containerIdGroupIdMap={containerIdGroupIdMap}
          containerIdNameMap={containerIdNameMap}
          groupIdNameMap={groupIdNameMap}
        />
      </div>
      <BadgeList
        groupName={groupIdNameMap[group]}
        containerName={containerIdNameMap[container]}
        categoryList={categoryList}
        setCategoryList={setCategoryList}
      />
      <div className="flex items-center justify-end">
        <FoodSort />
        <button className="h-12 w-12 flex justify-center items-center">
          <Icon icon={MenuMeatballIcon} size={4} />
        </button>
      </div>
      <FoodList
        foods={displayedFoods}
        groupIdContainerIdsMap={groupIdContainerIdsMap}
        containerIdGroupIdMap={containerIdGroupIdMap}
        containerIdNameMap={containerIdNameMap}
        groupIdNameMap={groupIdNameMap}
      />
    </div>
  );
};
