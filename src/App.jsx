import { AppRouteHost } from './components/AppRouteHost';
import { useBuildABookingApp } from './features/app-runtime';

export default function App() {
  const routeHostConfig = useBuildABookingApp();

  return <AppRouteHost {...routeHostConfig} />;
}
