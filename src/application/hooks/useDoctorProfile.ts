import { useState, useEffect, useMemo } from 'react';
import { useDoctorProfileLogic } from '@/application/useDoctorProfileLogic';

export const useDoctorProfile = (id: string) => {
  return useDoctorProfileLogic(id);
};
