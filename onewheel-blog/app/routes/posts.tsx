import { Outlet } from "@remix-run/react";

export default function PostRoute() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="text-red-500">
      Oh no! Something went wrong!
      <pre>{error.message}</pre>
    </div>
  );
}
