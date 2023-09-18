import usePushNotification from './usePushNotification';
import { UserProvider } from './userContext'; 

import RootStack from './navigators/RootStack';

export default function App() {
  usePushNotification();
  return (
    <UserProvider>
      <RootStack />
    </UserProvider>
  )
}

