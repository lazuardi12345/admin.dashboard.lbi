import { RouterProvider } from 'react-router-dom';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

// auth provider
import { AuthProvider } from 'contexts/AuthContext';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <NavigationScroll>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NavigationScroll>
  );
}
