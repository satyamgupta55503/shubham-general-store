// Route group layout for auth pages (/admin/login, /admin/register)
// This layout intentionally does NOT include Sidebar, Header, or ProtectedRoute
// so unauthenticated users can access the login page freely.
export default function AuthLayout({ children }) {
  return <>{children}</>;
}
