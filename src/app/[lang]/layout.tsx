import type { Metadata, Viewport } from 'next';
import { Anek_Latin, Anek_Gujarati, Hind_Vadodara } from 'next/font/google';
import { redirect } from 'next/navigation';
import '../globals.css';
import { isLang, LANGS, pick } from '@/lib/content';
import { getUI } from '@/lib/ui';
import { LangProvider } from '@/components/LangContext';
import { TransitionProvider } from '@/components/Transition';
import SmoothScroll from '@/components/SmoothScroll';
import Preloader from '@/components/Preloader';
import Cursor from '@/components/Cursor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollTop from '@/components/ScrollTop';
import { WordBand } from '@/components/Sections';

const anek = Anek_Latin({ subsets: ['latin'], axes: ['wdth'], variable: '--font-anek', display: 'swap' });
// Not preloaded: the English pages only need a few Gujarati glyphs, and 440KB should not block them.
const anekGu = Anek_Gujarati({ subsets: ['gujarati'], axes: ['wdth'], variable: '--font-anek-gu', display: 'swap', preload: false });
const hind = Hind_Vadodara({ subsets: ['latin', 'gujarati'], weight: ['400', '500', '600'], variable: '--font-hind', display: 'swap' });

export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export const viewport: Viewport = { themeColor: '#f5f7f0' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const f = pick('footer', lang);
  return {
    title: { default: `${f.title} | ${getUI(lang).tagline}`, template: `%s | ${f.title}` },
    description: f.text,
    icons: { icon: '/logo.png' },
    metadataBase: new URL('https://www.tejashpatel.in'),
    openGraph: {
      type: 'website',
      siteName: f.title,
      title: `${f.title} | ${getUI(lang).tagline}`,
      description: f.text,
      locale: lang === 'gu' ? 'gu_IN' : 'en_IN',
      images: [{ url: '/static/media/kdcc-bank-project.df2b29172bafe4de4519.jpg' }],
    },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) redirect('/en');
  const ui = getUI(lang);
  const f = pick('footer', lang);
  const home = pick('home', lang);
  const contact = { phone: '(+91) 80003 35555', email: f.email, email2: f.email2, address: String(f.add2).trim() };
  const closing = `${home.section3.line1} ${home.section3.line2_1}${home.section3.line2_2}`.replace(/\s+/g, ' ').trim();

  return (
    <html lang={lang} className={`${anek.variable} ${anekGu.variable} ${hind.variable}`}>
      <body>
        <noscript>
          <style>{'.preloader{display:none}'}</style>
        </noscript>
        <LangProvider value={{ lang, ui }}>
          <TransitionProvider>
            <a href="#content" className="skip-link label">
              {ui.skip}
            </a>
            <SmoothScroll />
            <Preloader />
            <Cursor />
            <Header contact={contact} />
            <main id="content" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <aside aria-label={ui.tagline}>
              <WordBand words={[ui.tagline, ...ui.place.split(' · ')]} ground="field-leaf" />
            </aside>
            <ScrollTop label={ui.top} />
            <Footer
              closing={closing}
              name={f.title}
              position={f.text}
              labels={{ explore: f.explore, contact: f.contact, address: f.add, phone: f.phone, email: f.emailTitle }}
              contact={contact}
            />
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
