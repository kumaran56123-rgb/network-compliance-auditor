import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from './components/ui/Toaster.tsx';
import { useUiStore } from './store/useUiStore.ts';
import { AskAuditorPanel } from './components/AskAuditorPanel.tsx';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
    <Toaster />
    <DrawerAnchor />
  </StrictMode>,
);

function DrawerAnchor() {
  const open = useUiStore((s) => s.auditorOpen);
  if (!open) return null;
  return (
    <div id="auditor-drawer" className="fixed bottom-4 right-4 z-50 w-96" role="dialog" aria-label="Ask the Auditor">
      <AskAuditorPanel />
    </div>
  );
}
