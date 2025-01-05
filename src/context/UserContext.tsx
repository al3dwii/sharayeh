
// context/UserContext.tsx

'use client';

import { createContext, useContext } from 'react';
import { UserData } from '../lib/getAllUserData';

const UserContext = createContext<UserData>(null);

export const useUserData = () => useContext(UserContext);

export default UserContext;
