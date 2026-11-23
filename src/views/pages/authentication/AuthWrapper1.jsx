export default function AuthWrapper1({ className = '', ...props }) {
  return <div className={`min-h-screen bg-slate-100 ${className}`} {...props} />;
}
