import { Card } from '../../../components/ui/card';

export default function AuthCardWrapper({ children, className = '', ...other }) {
  return (
    <Card
      className={`m-2.5 w-full max-w-[400px] p-6 lg:max-w-[475px] sm:p-8 xl:p-12 ${className}`}
      {...other}
    >
      {children}
    </Card>
  );
}
