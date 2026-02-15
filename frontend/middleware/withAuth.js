import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const withAuth = (WrappedComponent) => {
  const ProtectedPage = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // ✅ Only redirect AFTER the auth check is fully complete
      if (!loading && !isAuthenticated) {
        router.replace('/login');
      }
    }, [loading, isAuthenticated, router]);

    // ✅ Show spinner while cookie/session is being verified on reload
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0E1A1F] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#6967FB] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#FFFFFF]/60 text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    // ✅ Auth check done — not authenticated, render nothing (redirect in progress)
    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };

  ProtectedPage.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ProtectedPage;
};

export default withAuth;