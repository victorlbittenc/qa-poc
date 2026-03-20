import { InventoryProvider } from '../context/InventoryContext';
import { Dashboard } from './Dashboard';

export function App() {
  return (
    <InventoryProvider>
      <Dashboard />
    </InventoryProvider>
  );
}
