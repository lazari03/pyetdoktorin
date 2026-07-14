"use client";

import { useTranslation } from "react-i18next";

export default function Pager({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  if (pageCount <= 1) return null;
  return (
    <div className="pager">
      <button
        type="button"
        className="pager-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t("previousPage") || "Previous page"}
      >
        ‹
      </button>
      <span className="pager-info">
        {page} / {pageCount}
      </span>
      <button
        type="button"
        className="pager-btn"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label={t("nextPage") || "Next page"}
      >
        ›
      </button>
    </div>
  );
}
