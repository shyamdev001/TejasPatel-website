'use client';
import { useState } from 'react';
import { useLang } from './LangContext';
import { Arrow } from './Footer';
import Magnetic from './Magnetic';

type Labels = { first: string; last: string; email: string; phone: string; city: string; reason: string; message: string; submit: string };
type Field = 'first' | 'email' | 'message';

const FIELD =
  'peer w-full border-b border-ink/35 bg-transparent pb-3 pt-7 text-lg transition-colors duration-300 focus:border-ink aria-[invalid=true]:border-pin-ink';
const LABEL =
  'label pointer-events-none absolute left-0 top-7 origin-left text-ink/70 transition-transform duration-500 ease-(--ease-plough) peer-focus:-translate-y-6 peer-focus:scale-90 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-90 peer-aria-[invalid=true]:text-pin-ink';

const check = (d: Record<string, string>): Field[] => {
  const bad: Field[] = [];
  if (!d.first?.trim()) bad.push('first');
  if (!/^\S+@\S+\.\S+$/.test(d.email ?? '')) bad.push('email');
  if (!d.message?.trim()) bad.push('message');
  return bad;
};

/** No backend in this build: a valid form opens the visitor's mail app addressed to the office. */
export default function ContactForm({ labels, to }: { labels: Labels; to: string }) {
  const { ui } = useLang();
  const [bad, setBad] = useState<Field[]>([]);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errors = check(d);
    setBad(errors);
    setSent(false);
    if (errors.length) {
      e.currentTarget.querySelector<HTMLElement>(`#f-${errors[0]}`)?.focus();
      return;
    }
    const body = [`${labels.first}: ${d.first} ${d.last ?? ''}`, `${labels.email}: ${d.email}`, `${labels.phone}: ${d.phone ?? ''}`, `${labels.city}: ${d.city ?? ''}`, '', d.message].join('\n');
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(d.reason || labels.reason)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  // A field stops being marked the moment the visitor corrects it.
  const clear = (e: React.FormEvent<HTMLFormElement>) => {
    const name = (e.target as HTMLInputElement).name as Field;
    if (sent) setSent(false);
    if (bad.includes(name)) setBad(check(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>).filter((f) => bad.includes(f)));
  };

  const invalid = (name: string) => (bad.includes(name as Field) ? true : undefined);
  const field = (name: string, label: string, type = 'text', required = false, autoComplete?: string) => (
    <div className="relative">
      <input id={`f-${name}`} name={name} type={type} required={required} aria-invalid={invalid(name)} autoComplete={autoComplete} placeholder=" " className={FIELD} />
      <label htmlFor={`f-${name}`} className={LABEL}>
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
    </div>
  );

  return (
    <form noValidate onSubmit={submit} onInput={clear} className="form-fields grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {field('first', labels.first, 'text', true, 'given-name')}
      {field('last', labels.last, 'text', false, 'family-name')}
      {field('email', labels.email, 'email', true, 'email')}
      {field('phone', labels.phone, 'tel', false, 'tel')}
      {field('city', labels.city, 'text', false, 'address-level2')}
      {field('reason', labels.reason)}
      <div className="relative sm:col-span-2">
        <textarea id="f-message" name="message" required aria-invalid={invalid('message')} rows={4} placeholder=" " className={`${FIELD} resize-none`} />
        <label htmlFor="f-message" className={LABEL}>
          {labels.message}
          <span aria-hidden> *</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Magnetic>
          <button type="submit" className="btn label">
            {labels.submit}
            <Arrow />
          </button>
        </Magnetic>
        <p role="status" aria-live="polite" className={`max-w-[44ch] text-base ${bad.length ? 'text-pin-ink' : ''}`}>
          {bad.length ? ui.required : sent ? ui.mailOpen : ''}
        </p>
      </div>
    </form>
  );
}
