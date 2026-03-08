import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

console.log('[main] starting app — main.tsx loaded', { time: Date.now() });

const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorTextOnPrimaryBackground: '#ffffff',
    colorBackground: '#ffffff',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorInputBackground: '#f8fafc',
    colorInputText: '#1e293b',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    card: 'shadow-2xl border border-blue-100',
    headerTitle: 'text-gray-900 font-bold',
    headerSubtitle: 'text-gray-500',
    socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all rounded-xl',
    socialButtonsBlockButtonText: 'font-semibold text-gray-700',
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 rounded-xl font-bold',
    formFieldInput: 'border-2 border-gray-200 focus:border-blue-500 rounded-xl',
    formFieldLabel: 'font-medium text-gray-700',
    footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
    dividerLine: 'bg-gray-200',
    dividerText: 'text-gray-400',
    userButtonBox: 'hover:opacity-80 transition-opacity',
    userButtonTrigger: 'rounded-full ring-2 ring-blue-200 ring-offset-2',
    userButtonPopoverRootBox: 'z-[9999]',
    userButtonPopoverCard: 'shadow-2xl border border-blue-100 rounded-2xl z-[9999]',
    userButtonPopoverActionButton: 'hover:bg-blue-50 rounded-lg',
    userButtonPopoverActionButtonText: 'font-medium text-gray-700',
    userButtonPopoverFooter: 'hidden',
    modalContent: 'rounded-2xl shadow-2xl',
    modalBackdrop: 'backdrop-blur-sm bg-black/50',
    rootBox: '',
    modalRootBox: 'fixed inset-0 z-[9999] flex items-center justify-center',
    cardBox: 'mx-auto max-w-md w-full',
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
