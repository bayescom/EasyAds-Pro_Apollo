import { useAuth } from 'ice';
import { useEffect } from 'react';
import LoginBlock from '@/components/LoginBlock';

export default function Login() {
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const newAuth = Object.assign({}, auth);
    Object.keys(newAuth).forEach(authKey => {
      newAuth[authKey] = false;
    });

    // setAuth 实际是 addAuth
    setAuth(newAuth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoginBlock />
  );
}
