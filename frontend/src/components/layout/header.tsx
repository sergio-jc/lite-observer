import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

export function Header() {
  const { pathname } = useLocation();
  const isTraceDetail = pathname.startsWith("/traces/");
  const traceId = isTraceDetail
    ? decodeURIComponent(pathname.replace("/traces/", ""))
    : null;

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-primary-foreground">LO</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Lite Observer
        </span>
      </div>

      <nav className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">/</span>
        <Link
          to="/traces"
          className={cn(
            "rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",
            pathname.startsWith("/traces") &&
              "bg-accent text-accent-foreground",
          )}
        >
          Traces
        </Link>

        {traceId && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="max-w-64 truncate font-mono text-xs text-muted-foreground">
              {traceId}
            </span>
          </>
        )}
      </nav>
    </header>
  );
}
