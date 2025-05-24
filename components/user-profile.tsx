'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DraggableWindow from './draggable-window';

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { data: session } = useSession();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ejemplo: lógica personalizada para iniciar sesión con email y contraseña
    await signIn('credentials', {
      email: 'test@example.com',
      password: 'password',
    });
  };

  return (
    <DraggableWindow
      title="User Profile"
      onClose={onClose}
      defaultWidth={350}
      defaultHeight={400}
      resizable={true}
    >
      <div className="p-4 space-y-4">
        {session ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Welcome, {session.user?.email || 'User'}!</h2>
            <p>You are logged in.</p>
            <Button onClick={() => signOut()} className="mt-4">
              Log Out
            </Button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Email" required />
              <Input type="password" placeholder="Password" required />
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
            <div className="mt-4">
              <Button onClick={() => signIn('google')} variant="outline" className="w-full">
                Continue with Google
              </Button>
            </div>
          </div>
        )}
      </div>
    </DraggableWindow>
  );
}
