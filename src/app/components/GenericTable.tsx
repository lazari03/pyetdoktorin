"use client";
import React from 'react';
import CenteredLoader from './CenteredLoader';
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
  /** Optional sort comparator; if omitted, data order is preserved */
  sort?: (a: T, b: T) => number;
  /** Pagination: current page index (0-based). If provided, table will paginate. */
  page?: number;
  /** Rows per page; defaults to 20 if pagination enabled. */
  pageSize?: number;
  /** Optional total rows if server-paginating; otherwise uses data.length. */
  total?: number;
  /** Called when page changes (0-based). */
  onPageChange?: (nextPage: number) => void;
  /** If true, scroll the window to top on page change (default: true). */
  scrollToTopOnPageChange?: boolean;
}

/**
 * A reusable table component styled like the dashboard Appointments table.
 * - Desktop: table layout with zebra stripes
 * - Mobile: simple card list preserving the same content order
 */
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

  if (loading) return <CenteredLoader />;

  const rows = (() => {
    const arr = [...data];
    if (sort) arr.sort(sort);
    if (typeof maxRows === 'number') return arr.slice(0, maxRows);
    // Client-side pagination if page is provided
    if (typeof page === 'number') {
      const start = page * pageSize;
      return arr.slice(start, start + pageSize);
    }
    return arr;
  })();

  const effectiveTotal = typeof total === 'number' ? total : data.length;
  const pageCount = typeof page === 'number' ? Math.max(1, Math.ceil(effectiveTotal / pageSize)) : 1;

  const handlePageChange = (nextPage: number) => {
    if (onPageChange) onPageChange(nextPage);
    if (scrollToTopOnPageChange && typeof window !== 'undefined') {
      // Smooth scroll to top so user sees the new page content from the beginning
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="overflow-x-auto mt-6 hidden md:block">
        <table className="table table-zebra w-full text-sm md:text-base">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={col.className}>{col.header}</th>
              ))}
              {actions.length > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={(row as T & { id?: string | number }).id ?? idx}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={col.className}>
                      {col.render ? col.render(row) : (row as T)[col.key as keyof T] as React.ReactNode}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td>
                      {actions.map((act, i) => (
                        <button
                          key={i}
                          className={
                            act.className ??
                            'bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full mr-2 disabled:opacity-50'
                          }
                          disabled={act.disabled}
                          onClick={() => act.onClick(row)}
                        >
                          {act.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center">
                  {emptyText ?? t('noRecordsFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="block md:hidden mt-6 space-y-4">
        {rows.length > 0 ? (
          rows.map((row, idx) => (
            <div key={(row as T & { id?: string | number }).id ?? idx} className="rounded-xl shadow bg-white p-4 flex flex-col gap-2">
              {/* Render each column as label:value on mobile */}
              {columns.map((col) => (
                <div key={String(col.key)} className="text-sm text-gray-700">
                  <span className="font-medium mr-1">{col.header}:</span>
                  <span>
                    {col.render ? col.render(row) : (row as T)[col.key as keyof T] as React.ReactNode}
                  </span>
                </div>
              ))}
              {actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {actions.map((act, i) => (
                    <button
                      key={i}
                      className={
                        act.className ??
                        'ml-auto bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded-full text-xs disabled:opacity-50'
                      }
                      disabled={act.disabled}
                      onClick={() => act.onClick(row)}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">{emptyText}</div>
        )}
      </div>

      {/* Pagination controls */}
      {typeof page === 'number' && pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t('pageOf', { page: page + 1, totalPages: pageCount })}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-full border border-purple-500 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => handlePageChange(Math.max(0, (page ?? 0) - 1))}
            >
              {t('previous')}
            </button>
            <button
              className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              disabled={page >= pageCount - 1}
              onClick={() => handlePageChange(Math.min(pageCount - 1, (page ?? 0) + 1))}
            >
              {t('nextPagination')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GenericTable;
