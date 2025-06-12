import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
  <footer className="bg-gradient-to-r from-blue-50 to-gray-50 border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">        <div className="col-span-1 md:col-span-1">          <div className="flex items-center mb-4">
            {/* <img src="/logo.png" alt="PromptCraft Pro Logo" className="h-32 w-32 mr-2" /> */}
            <div className="text-xl font-bold text-blue-600">PromptCraft Pro</div>
          </div>
          <p className="text-sm text-gray-600">
            Advanced document analysis powered by AI. Streamline your prompt testing and optimization.
          </p>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-600 hover:text-blue-600 text-sm">Home</Link></li>
            <li><Link to="/upload" className="text-gray-600 hover:text-blue-600 text-sm">Document Upload</Link></li>
            <li><Link to="/analyze" className="text-gray-600 hover:text-blue-600 text-sm">AI Analyzer</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Documentation</a></li>
            <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">API Reference</a></li>
            <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Blog</a></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Connect</h3>
          <div className="flex space-x-4">
            <a
              href="https://github.com/ZunnoorainSheikh/AI-Analysis-Platform-with-Prompt-Testing"
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
              <span className="sr-only">Privacy Policy</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
              <span className="sr-only">Contact</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Contact us at:</p>
            <a href="mailto:info@promptcraftpro.com" className="text-sm text-blue-600 hover:underline">info@promptcraftpro.com</a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          &copy; {currentYear} PromptCraft Pro. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;

