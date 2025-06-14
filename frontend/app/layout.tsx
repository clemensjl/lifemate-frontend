import './globals.css';
import { Montserrat } from 'next/font/google';
import { AuthProvider } from '@/components/AuthContext';
import Sidebar from '@/components/Sidebar';
import AccountButton from '@/components/AccountButton';
import OnlyClient from '@/components/OnlyClient';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata = {
  title: 'Lifemate AI',
  description: 'Dein smarter Lebensplaner mit KI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${montserrat.className} bg-zinc-900 text-white`}>
        <AuthProvider>
          <div className="relative flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
              <OnlyClient>{children}</OnlyClient>
            </main>
            <AccountButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
