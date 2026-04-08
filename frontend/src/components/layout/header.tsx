import { useLocation } from 'react-router';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/traces': 'Traces',
  '/metrics': 'Metrics',
  '/logs': 'Logs',
};

export function Header() {
  const location = useLocation();

  const basePath = '/' + location.pathname.split('/').filter(Boolean)[0];
  const title = routeTitles[basePath] ?? 'Lite Observer';

  return (
    <header className="flex h-14 items-center border-b border-border px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
