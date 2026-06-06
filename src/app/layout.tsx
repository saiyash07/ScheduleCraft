import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScheduleCraft | Constraint Solver Class Planner',
  description: 'An interactive full-stack app that calculates conflict-free class schedules based on dynamic student constraints.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
