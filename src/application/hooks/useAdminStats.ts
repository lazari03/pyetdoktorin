import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdminStatsLogic } from '@/application/useAdminStatsLogic';

export function useAdminStats(limit = 5) {
  return useAdminStatsLogic(limit);
}
