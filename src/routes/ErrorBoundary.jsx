import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

// ==============================|| ELEMENT ERROR - COMMON ||============================== //

export default function ErrorBoundary() {
  const error = useRouteError();
  let message = 'Under Maintenance';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) message = "Error 404 - This page doesn't exist!";
    if (error.status === 401) message = "Error 401 - You aren't authorized to see this";
    if (error.status === 503) message = 'Error 503 - Looks like our API is down';
    if (error.status === 418) message = 'Error 418 - Contact administrator';
  }

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}
