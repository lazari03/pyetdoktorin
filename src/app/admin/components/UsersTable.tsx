"use client";
import { useAdminStore } from '@/store/adminStore';
import { useEffect, useMemo, useState } from 'react';
import { GenericTable, Column, RowAction } from '@/presentation/components/GenericTable/GenericTable';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { UserRole } from '@/domain/entities/UserRole';
import { useDI } from '@/context/DIContext';

type TableUser = {
  id: string;
  role: UserRole | string; // enum preferred, but allow string for legacy rows
  name?: string;
  surname?: string;
  email?: string;
  approvalStatus?: 'pending' | 'approved';
};

export function UsersTable() {
  const { t } = useTranslation();
  const { users, loadUsersPage, searchUsers, selectUser, loading, error, total, pageSize, searchQuery } = useAdminStore();
  const { getUsersPageUseCase, getAllUsersUseCase } = useDI();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  // Initialize search input from store to preserve last search after edits
  useEffect(() => { setSearch(searchQuery || ''); setDebounced((searchQuery || '').trim().toLowerCase()); }, [searchQuery]);
  useEffect(() => { if (!searchQuery) loadUsersPage(0, getUsersPageUseCase.execute.bind(getUsersPageUseCase)); }, [loadUsersPage, searchQuery, getUsersPageUseCase]);

  // Debounce search input
  useEffect(() => {
    const h = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(h);
  }, [search]);

  const columns: Column<TableUser>[] = useMemo(() => ([
    { key: 'name', header: t('name') },
    { key: 'surname', header: t('surname') },
    {
      key: 'role',
      header: t('role'),
      render: (u: TableUser) => (
        <div className="flex items-center gap-2">
          <span className="capitalize">{String(u.role)}</span>
          {String(u.role).toLowerCase() === 'doctor' && u.approvalStatus === 'pending' && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700">
              {t('pendingApproval')}
            </span>
          )}
        </div>
      ),
    },
  ]), [t]);

  const actions: RowAction<TableUser>[] = useMemo(() => ([
    {
      label: t('edit'),
      className: 'bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-purple-500 rounded-full',
      onClick: (u: TableUser) => selectUser(u.id),
    },
  ]), [selectUser, t]);


  // Trigger global search when debounced query length >= 4; otherwise load paginated page
  useEffect(() => {
    if (debounced && debounced.length >= 4) {
      searchUsers(
        debounced,
        getAllUsersUseCase.execute.bind(getAllUsersUseCase),
        getUsersPageUseCase.execute.bind(getUsersPageUseCase)
      );
      setPage(0);
    } else {
      loadUsersPage(0, getUsersPageUseCase.execute.bind(getUsersPageUseCase));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  if (error) return <div className="text-red-600">{error}</div>;

  // When page changes via pagination controls, request server-side page and scroll-to-top handled by GenericTable
  const handlePageChange = (p: number) => {
    setPage(p);
    loadUsersPage(p, getUsersPageUseCase.execute.bind(getUsersPageUseCase));
  };
  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder={t('search')}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-full text-sm"
        />
      </div>
      <GenericTable
        data={users}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyText={t('noRecordsFound')}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        total={total}
      />
    </div>
  );
}
