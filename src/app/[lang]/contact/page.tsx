import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, pick } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import ContactForm from '@/components/ContactForm';
import { Rise, Rule } from '@/components/Reveal';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.contact } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const c = pick('contact', lang);
  const f = pick('footer', lang);
  const s = c.section3;
  const offices = [1, 2, 3, 4].map((n) => ({ name: s[`address${n}`] as string, address: s[`address${n + 4}`] as string }));
  const l = c.section4;
  return (
    <>
      <PageHero title={c.section1.title} lede={String(f.add2).trim()} />
      <section className="section field-paper">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display d-2 uppercase">{ui.offices}</h2>
            <Rule className="mt-8" />
            <ol>
              {offices.map((o, i) => (
                <Rise as="li" key={i} delay={i * 0.06} className="border-b border-line py-6">
                  <h3 className="text-lg font-semibold">{o.name}</h3>
                  <p className="mt-1 max-w-[44ch] text-ink/80">{o.address}</p>
                </Rise>
              ))}
            </ol>
            <p className="mt-8 grid gap-2 text-lg">
              <a className="ulink w-fit" href="tel:+918000335555">
                (+91) 80003 35555
              </a>
              <a className="ulink w-fit" href={`mailto:${f.email}`}>
                {f.email}
              </a>
              <a className="ulink w-fit" href={`mailto:${f.email2}`}>
                {f.email2}
              </a>
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="display d-2 uppercase">{ui.contactCta}</h2>
            <div className="mt-8">
              <ContactForm
                to={f.email}
                labels={{
                  first: l.titleFirstName,
                  last: l.titleLastName,
                  email: l.titleEamil,
                  phone: l.titlePhone,
                  city: l.titleCityName,
                  reason: l.titleReason,
                  message: l.titleMessage,
                  submit: l.button,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
