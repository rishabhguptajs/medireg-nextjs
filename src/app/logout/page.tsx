"use client";

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const Logout: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return <div>Logging out...</div>;
};

export default Logout;
