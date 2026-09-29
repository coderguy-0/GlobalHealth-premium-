import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PlatformRole, ROLE_NAMES } from '../../core/platformRoles';
import { AuthSubView, PublicUserAccount } from '../../types/auth';
import { NewsStaffSignupScreen } from '../news/NewsWorkspaceAccessScreens';

export function ProfessionalAuthForm({ role, mode, onMode, onSuccess }: {
  role: Exclude<PlatformRole, 'user'>; mode: AuthSubView;
  onMode: (mode: AuthSubView) => void;
  onSuccess: (user: PublicUserAccount, token: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [challenge, setChallenge] = useState('');
  const request = async (action: string, body: unknown) => {
    const response = await fetch(`/api/auth/portal/${role}/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || data.problems?.join(' ') || 'Unable to complete this request.');
    return data;
  };
  if (mode === 'signup' && role === 'news') {
    return <NewsStaffSignupScreen onBack={() => onMode('login')} />;
  }
  if (mode === 'signup' && (role === 'doctor' || role === 'hospital')) {
    return <div className="space-y-4"><ShieldCheck className="text-medical-600" /><h2 className="text-xl font-bold">Activate your {ROLE_NAMES[role]} account</h2><p className="text-sm text-slate-600">Professional access must be provisioned by your verified organization. Contact your organization administrator to verify your credentials and receive your account. Selecting a role does not grant access to an existing organization.</p><button className="font-bold text-medical-700" onClick={() => onMode('login')}>Already activated? Sign in</button></div>;
  }
  const recover = mode === 'forgot-password';
  const reset = mode === 'reset-password';
  const signup = mode === 'signup';
  const title = challenge ? 'Verify your sign-in' : recover ? 'Recover password' : reset ? 'Set a new password' : signup ? 'Apply for pharmacy access' : `Sign in as ${ROLE_NAMES[role]}`;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const identifier = String(fields.identifier || '').trim();
      const action = challenge ? 'mfa' : recover ? 'recover' : reset ? 'reset' : signup ? 'signup' : 'login';
      const data = await request(action, {
        ...fields, identifier, email: identifier, usernameOrEmail: identifier,
        challengeId: challenge,
      });
      if (data.stage === 'mfa') { setChallenge(data.challengeId); setMessage('Enter the verification code sent to your registered contact.'); return; }
      if (recover || signup || reset) {
        setMessage(signup ? 'Application received. Sign-in is available only after license approval.' : reset ? 'Password updated. You can now sign in.' : 'If an eligible account exists, reset instructions will be sent to its registered contact.');
        return;
      }
      if (!data.token) throw new Error('The server did not issue a session.');
      // Validate identity and role before adopting the token or mounting data.
      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${data.token}` } });
      const session = await response.json();
      if (!response.ok || session.portalRole !== role) throw new Error('The session is not authorized for this role.');
      onSuccess(session.user, data.token);
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  };
  const input = (name: string, label: string, type = 'text', minLength?: number) => <label className="block text-sm font-semibold text-slate-700">{label}<input name={name} type={type} required minLength={minLength} autoComplete={name === 'password' ? signup ? 'new-password' : 'current-password' : name === 'identifier' ? 'username' : 'off'} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-medical-500" /></label>;
  return <form onSubmit={submit} className="space-y-5">
    <div><h2 className="text-2xl font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm text-slate-500">One GlobalHealth session. Your authorized workspace only.</p></div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-medical-50 p-3 text-sm text-medical-800">{message}</p>}
    <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
      {challenge ? input('code', 'Verification code') : reset ? <>{input('resetToken', 'Reset token from your recovery message')}{role === 'news' && input('code', 'Recovery code')}{input('newPassword', 'New password', 'password', 8)}</> : <>
        {input('identifier', signup || role === 'news' || role === 'pharmacy' ? 'Official email' : 'Email or username', signup ? 'email' : 'text')}
        {!recover && input('password', 'Password', 'password', signup ? 8 : undefined)}
        {signup && <>{input('pharmacyName', 'Pharmacy legal name', 'text', 3)}{input('licenseNumber', 'License number', 'text', 4)}{input('contactName', 'Contact name')}{input('phone', 'Phone number', 'tel')}</>}
      </>}
      <button className="w-full rounded-xl bg-medical-700 px-4 py-3 font-bold text-white hover:bg-medical-800" type="submit">{busy ? 'Please wait…' : challenge ? 'Verify and enter portal' : recover ? 'Request recovery' : reset ? 'Update password' : signup ? 'Submit for verification' : 'Sign in'}</button>
    </fieldset>
    {recover && <button type="button" className="text-sm font-semibold text-medical-700" onClick={() => onMode('reset-password')}>Already have a reset token?</button>}
    {(reset || challenge) && <button type="button" className="text-sm font-semibold text-medical-700" onClick={() => { setChallenge(''); onMode('login'); }}>Back to sign in</button>}
  </form>;
}
