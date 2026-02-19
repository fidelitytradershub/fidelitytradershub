import React from 'react';
import Header from './Header';
import Footer from './Footer';


const Layout = ({ children }) => {
  return (
    <div className="min-h-screen text-[#0E1A1F] bg-[#FFFFFF] flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;