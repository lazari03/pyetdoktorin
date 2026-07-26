import { useState } from 'react';
import useSWR from 'swr';
import { useDI } from '@/context/DIContext';
import type { AddFamilyMemberInput } from '@/application/ports/IFamilyService';

export function useFamily() {
  const {
    listFamilyMembersUseCase,
    listFamilyInvitesUseCase,
    addFamilyMemberUseCase,
    inviteFamilyMemberUseCase,
    respondToFamilyInviteUseCase,
    removeFamilyMemberUseCase,
  } = useDI();
  const { data: members, isLoading: membersLoading, mutate: mutateMembers } = useSWR(
    'family-members',
    () => listFamilyMembersUseCase.execute(),
  );
  const { data: invites, isLoading: invitesLoading, mutate: mutateInvites } = useSWR(
    'family-invites',
    () => listFamilyInvitesUseCase.execute(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const addMember = async (input: AddFamilyMemberInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addFamilyMemberUseCase.execute(input);
      await mutateMembers();
      return true;
    } catch (error) {
      setSubmitError(error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const inviteExistingUser = async (email: string, relationship: string) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await inviteFamilyMemberUseCase.execute(email, relationship);
      await mutateMembers();
      return true;
    } catch (error) {
      setSubmitError(error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const respondToInvite = async (id: string, accept: boolean) => {
    await respondToFamilyInviteUseCase.execute(id, accept);
    await Promise.all([mutateInvites(), mutateMembers()]);
  };

  const removeMember = async (id: string) => {
    await removeFamilyMemberUseCase.execute(id);
    await mutateMembers();
  };

  return {
    members: members ?? [],
    invites: invites ?? [],
    loading: membersLoading || invitesLoading,
    submitting,
    submitError,
    addMember,
    inviteExistingUser,
    respondToInvite,
    removeMember,
  };
}
