import { Link } from 'react-router-dom';
import { DASHBOARD_PATH } from 'config';
import Logo from 'ui-component/Logo';

export default function LogoSection() {
  return (
    <Link
      to={DASHBOARD_PATH}
      aria-label="LBI FIB UI Dashboard"
      className="inline-flex max-w-full items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <Logo />
    </Link>
  );
}
