import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { store } from './store';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}