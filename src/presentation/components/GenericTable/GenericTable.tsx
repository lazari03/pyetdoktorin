"use client";
import React from 'react';
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
    
  } = props;

  // Optionally sort and limit rows
  let rows = data;
  if (sort) rows = [...rows].sort(sort);
  if (typeof maxRows === 'number') rows = rows.slice(0, maxRows);

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={col.className || 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}>
                {col.header}
              </th>
            ))}
            {actions.length > 0 && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-400">{t('loading')}</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8 text-gray-400">{emptyText || t('noRecordsFound')}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className={col.className || 'px-4 py-2'}>
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-2 space-x-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={action.className || 'bg-orange-500 text-white px-3 py-1 rounded-full'}
                        onClick={() => action.onClick(row)}
                        disabled={action.disabled}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination controls (if needed) */}
      {typeof total === 'number' && total > pageSize && onPageChange && (
        <div className="flex justify-end mt-4 space-x-2">
          {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${page === i ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => onPageChange(i)}
              disabled={page === i}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
