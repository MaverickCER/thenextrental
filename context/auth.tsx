import { Subscription, onCurrentUserSubscriptionUpdate } from '@stripe/firestore-stripe-payments';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, database } from '../utils/firebase';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onDisconnect, onValue, ref, serverTimestamp, update } from 'firebase/database';

import payments from '../utils/stripe';
import { useRouter } from 'next/router';

interface IAuth {
  user: User | null;
  subscription: Subscription | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  loading: boolean;
}
interface dbUser {
  user: {
    [k: string]: {
      status: string,
      timestamp: number
    }
  }
}

const AuthContext = createContext<IAuth>({
  user: null,
  subscription: null,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
  error: null,
  loading: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const useAuthContext = () => {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    console.log(`auth.signUp: {email: ${email}, password: ${password}}`);
    setLoading(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('auth.signUp.user', userCredential.user);
        setUser(userCredential.user);
        setLoading(false);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  const signIn = async (email: string, password: string) => {
    console.log(`auth.signIn: {email: ${email}, password: ${password}}`);
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('auth.signIn.user', userCredential.user);
        setUser(userCredential.user);
        setLoading(false);
      })
      .catch((error) => {setError(error.message); console.error(error)})
      .finally(() => setLoading(false));
  };

  const logout = async () => {
    setLoading(true);

    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false));
  };

  
  const presence = () => {
    if (user) {
      // stores the timestamp of my last disconnect (the last time I was seen online)
      onValue(ref(database, '.info/connected'), async (snapshot) => {
        // If we're not currently connected, don't do anything.
        if (snapshot.val() == false) {
          return;
        }
        // build the object of required updates for when the user disconnects
        let disconnect: { [key: string]: any } = {};
        disconnect[`user/${user.uid}/status`] = 'online';
        disconnect[`user/${user.uid}/timestamp`] = serverTimestamp();
        // establish a connection and set up the disconnect events.
        onDisconnect(ref(database)).update(disconnect).then(() => {
          // Now that the user will go offline once disconnected, show that they are online.
          let connect: { [key: string]: any } = {};
          connect[`user/${user.uid}/status`] = 'online';
          connect[`user/${user.uid}/timestamp`] = serverTimestamp();
          update(ref(database), connect);
        });
      });
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Logged in...
        setUser(user);
        presence();
      } else {
        // Not logged in...
        setUser(null);
      }

      setInitialLoading(false);
    });

    if (user) {
      onCurrentUserSubscriptionUpdate(payments, (snapshot) => {
        setSubscription(
          // returns first active or trailing subscription or undefined
          snapshot.subscriptions.filter(
            (subscription) => subscription.status === 'active' || subscription.status === 'trialing'
          )[0]
        );
      });
    } else if (subscription) {
      setSubscription(null);
    }
  }, [user]);

  const memoedValue = useMemo(
    () => ({ user, subscription, signUp, signIn, error, loading, logout }),
    [user, subscription, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>{!initialLoading && children}</AuthContext.Provider>
  );
};

export { AuthProvider };
export default useAuthContext;