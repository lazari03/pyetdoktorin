"use client";
import React from 'react';
import CenteredLoader from '@/presentation/components/CenteredLoader/CenteredLoader';
import { useTranslation } from 'react-i18next';
import '@i18n';

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export type RowAction<T> = {
  label: string;
  onClick: (row: T) => void;
  disabled?: boolean;
  className?: string;
};

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: RowAction<T>[];
  loading?: boolean;
  emptyText?: string;
  maxRows?: number;
  sort?: (a: T, b: T) => number;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (nextPage: number) => void;
  scrollToTopOnPageChange?: boolean;
}

export function GenericTable<T extends { id?: string | number }>(props: GenericTableProps<T>) {
  const { t } = useTranslation();
  const {
    data,
    columns,
    actions = [],
    loading = false,
    emptyText = undefined,
    maxRows,
    sort,
    page,
    pageSize = 20,
    total,
    onPageChange,
    scrollToTopOnPageChange = true,
  } = props;

  // ...existing code (rest of the component)
}
