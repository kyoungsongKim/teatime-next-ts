import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
// eslint-disable-next-line import/no-extraneous-dependencies
import { alpha as hexAlpha } from '@mui/system/colorManipulator';

import { varAlpha } from 'src/theme/styles';

type CustomTreeViewProps<T> = {
  data: T[] | Record<string, any>;
  groupBy?: keyof T;
  labelKey: keyof T;
  idKey: keyof T;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
};

const convertToTree = <T,>(
  data: T[] | Record<string, any>,
  groupBy?: keyof T
): Record<string, any> => {
  if (!groupBy || !Array.isArray(data)) {
    return typeof data === 'object' ? data : { 전체: data };
  }

  return data.reduce(
    (tree, item) => {
      const group = String(item[groupBy]) || '기타';
      if (!tree[group]) {
        tree[group] = [];
      }
      tree[group].push(item);
      return tree;
    },
    {} as Record<string, any>
  );
};

export function CustomTreeView<T>({
  data,
  groupBy,
  labelKey,
  idKey,
  selectedItems,
  setSelectedItems,
}: CustomTreeViewProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const treeData = Array.isArray(data) ? convertToTree(data, groupBy) : data;

  const extractAllIds = (tree: Record<string, any>): string[] =>
    Object.values(tree).flatMap((value) =>
      Array.isArray(value) ? value.map((item) => String(item[idKey])) : extractAllIds(value)
    );

  const allItems = extractAllIds(treeData);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleGroupSelect = (groupItems: string[]) => {
    const allSelected = groupItems.every((item) => selectedItems.includes(item));
    setSelectedItems(
      allSelected
        ? selectedItems.filter((id) => !groupItems.includes(id))
        : [...selectedItems, ...groupItems]
    );
  };

  const handleAllSelect = () => {
    const allSelected = allItems.every((item) => selectedItems.includes(item));
    setSelectedItems(allSelected ? [] : [...allItems]);
  };

  const isChecked = (id: string) => selectedItems.includes(id);
  const isIndeterminate = (groupItems: string[]) =>
    groupItems.some((item) => selectedItems.includes(item)) &&
    !groupItems.every((item) => selectedItems.includes(item));

  const renderTreeItems = (tree: Record<string, any>) =>
    Object.entries(tree).map(([key, value]) => {
      const isLeafNode = Array.isArray(value);
      const groupItems = isLeafNode
        ? value.map((item) => String(item[idKey]))
        : extractAllIds(value);

      return (
        <TreeItem
          key={key}
          itemId={key}
          label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                size="small"
                checked={groupItems.every((item) => selectedItems.includes(item))}
                indeterminate={isIndeterminate(groupItems)}
                onChange={() => handleGroupSelect(groupItems)}
                onClick={(e) => e.stopPropagation()}
              />
              {key}
            </div>
          }
        >
          {isLeafNode
            ? value.map((item) => (
                <TreeItem
                  key={String(item[idKey])}
                  itemId={String(item[idKey])}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        size="small"
                        checked={isChecked(String(item[idKey]))}
                        onChange={() => handleItemSelect(String(item[idKey]))}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {String(item[labelKey])}
                    </div>
                  }
                />
              ))
            : renderTreeItems(value)}
        </TreeItem>
      );
    });

  return (
    <Box
      sx={{
        maxHeight: '300px',
        overflow: 'auto',
        border: !isFocused
          ? (theme) => `solid 1px ${theme.vars.palette.divider}`
          : (theme) =>
              `solid 2px ${
                theme.palette.mode === 'dark'
                  ? hexAlpha(theme.palette.grey[200], 1)
                  : varAlpha(theme.vars.palette.grey['900Channel'], 1)
              }`,
        borderRadius: '8px',
        p: 1,
        transition: 'border-color 0.2s ease-in-out',
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
    >
      <SimpleTreeView sx={{ overflowX: 'hidden', minHeight: 240, width: 1 }}>
        <TreeItem
          itemId="all"
          label={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                size="small"
                checked={allItems.every((item) => selectedItems.includes(item))}
                indeterminate={isIndeterminate(allItems)}
                onChange={handleAllSelect}
                onClick={(e) => e.stopPropagation()}
              />
              전체
            </div>
          }
        >
          {renderTreeItems(treeData)}
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}
