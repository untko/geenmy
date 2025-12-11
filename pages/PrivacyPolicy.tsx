import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-slate">
        <p className="text-slate-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-slate-600 mb-4">
          We collect minimal information to provide the GEENMY dictionary service. This may include search queries, usage data, and voluntarily provided email addresses if you choose to sign in.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. How We Use Information</h2>
        <p className="text-slate-600 mb-4">
          We use the collected information to improve our dictionary definitions, train our semantic models, and ensure the security of our platform.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Data Security</h2>
        <p className="text-slate-600 mb-4">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Third-Party Services</h2>
        <p className="text-slate-600 mb-4">
          Our service is empowered by Google's Gemini models for generating definitions. Please refer to Google's privacy policy regarding their data handling practices.
        </p>
      </div>
    </div>
  );
};