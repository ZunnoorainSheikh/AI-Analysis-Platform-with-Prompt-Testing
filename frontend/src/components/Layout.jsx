import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="min-h-screen w-full flex flex-col">
    <Navbar />
    <main className="flex-1 w-full px-4 py-6 md:px-6 md:py-10">
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

export default Layout;
