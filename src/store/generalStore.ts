import { UserRole } from '@/domain/entities/UserRole';
import { CheckProfileCompleteUseCase } from '../application/checkProfileCompleteUseCase';

export async function isProfileIncomplete(
  role: UserRole,
  userId: string,
  checkProfileCompleteUseCase: CheckProfileCompleteUseCase
): Promise<boolean> {
  return await checkProfileCompleteUseCase.execute(role, userId);
}
