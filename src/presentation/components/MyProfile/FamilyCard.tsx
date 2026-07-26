'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamily } from '@/presentation/hooks/useFamily';
import type { FamilyMemberStatus } from '@/application/ports/IFamilyService';

function statusPill(status: FamilyMemberStatus, t: (k: string) => string) {
  if (status === 'confirmed') return { label: t('familyStatusConfirmed') || 'Confirmed', cls: 'bg-green-50 text-green-700' };
  if (status === 'declined') return { label: t('familyStatusDeclined') || 'Declined', cls: 'bg-red-50 text-red-700' };
  return { label: t('familyStatusInvited') || 'Invite pending', cls: 'bg-amber-50 text-amber-700' };
}

const RELATIONSHIPS = ['child', 'spouse', 'parent', 'sibling', 'other'];

export function FamilyCard() {
  const { t } = useTranslation();
  const { members, invites, loading, submitting, submitError, addMember, inviteExistingUser, respondToInvite, removeMember } =
    useFamily();
  const [addMode, setAddMode] = useState<null | 'account' | 'invite'>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [relationship, setRelationship] = useState('child');
  const [email, setEmail] = useState('');

  const resetForm = () => {
    setAddMode(null);
    setName('');
    setSurname('');
    setEmail('');
    setRelationship('child');
  };

  const handleAddUnlinked = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await addMember({ name: name.trim(), surname: surname.trim() || undefined, relationship });
    if (ok) resetForm();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = await inviteExistingUser(email.trim(), relationship);
    if (ok) resetForm();
  };

  return (
    <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{t('familySectionTitle') || 'Family'}</p>
        <button
          type="button"
          onClick={() => setAddMode(addMode ? null : 'account')}
          className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
          data-analytics="profile.family.toggle_add"
        >
          {addMode ? t('cancel') || 'Cancel' : t('familyAddMember') || '+ Add member'}
        </button>
      </div>

      {invites.length > 0 && (
        <div className="space-y-2 rounded-xl border border-purple-100 bg-purple-50 p-3">
          <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wide">
            {t('familyPendingInvitesToYou') || 'Invitations for you'}
          </p>
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="text-gray-800">
                {t('familyInviteFrom', { name: invite.name }) || `${invite.name} wants to add you as "${invite.relationship}"`}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => respondToInvite(invite.id, true)}
                  className="text-green-700 font-semibold hover:underline"
                >
                  {t('accept') || 'Accept'}
                </button>
                <button
                  type="button"
                  onClick={() => respondToInvite(invite.id, false)}
                  className="text-gray-500 font-semibold hover:underline"
                >
                  {t('decline') || 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addMode && (
        <div className="space-y-2 rounded-xl border border-gray-200 p-3">
          <div className="flex gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setAddMode('account')}
              className={`rounded-full px-3 py-1 ${addMode === 'account' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {t('familyNoAccount') || 'No account'}
            </button>
            <button
              type="button"
              onClick={() => setAddMode('invite')}
              className={`rounded-full px-3 py-1 ${addMode === 'invite' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {t('familyInviteExisting') || 'Invite existing user'}
            </button>
          </div>

          {submitError ? (
            <p className="text-[11px] text-red-600">
              {t('familyAddFailed') || 'Something went wrong. Please try again.'}
            </p>
          ) : null}

          {addMode === 'account' ? (
            <form onSubmit={handleAddUnlinked} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12.5px]"
                  placeholder={t('firstName') || 'First name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12.5px]"
                  placeholder={t('lastName') || 'Last name'}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>
              <RelationshipSelect value={relationship} onChange={setRelationship} t={t} />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-purple-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? t('sending') || 'Adding…' : t('familyAdd') || 'Add family member'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleInvite} className="space-y-2">
              <input
                type="email"
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12.5px]"
                placeholder={t('emailAddress') || 'Email address'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <RelationshipSelect value={relationship} onChange={setRelationship} t={t} />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-purple-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? t('sending') || 'Sending…' : t('familyInvite') || 'Send invite'}
              </button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
      ) : members.length === 0 ? (
        <p className="text-xs text-gray-600">{t('familyNoMembers') || 'No family members yet.'}</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const pill = statusPill(member.status, t);
            return (
              <div key={member.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-gray-800 truncate">
                    {[member.name, member.surname].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-[10.5px] text-gray-500 capitalize">{member.relationship}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${pill.cls}`}>
                    {pill.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-[11px] text-gray-400 hover:text-red-600"
                    aria-label={t('remove') || 'Remove'}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RelationshipSelect({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  t: (k: string) => string;
}) {
  return (
    <select
      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12.5px] bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {RELATIONSHIPS.map((r) => (
        <option key={r} value={r}>
          {t(`familyRelationship_${r}`) || r}
        </option>
      ))}
    </select>
  );
}
