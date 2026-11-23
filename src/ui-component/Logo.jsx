import lbiLogo from '../assets/lbi-logo.png';

export default function Logo() {
  return (
    <img
      src={lbiLogo}
      alt="LBI FIB UI"
      style={{ display: 'block', width: 'auto', height: 48, maxWidth: '100%', objectFit: 'contain' }}
    />
  );
}
