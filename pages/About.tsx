import React from 'react';
import { Database, Users, Cpu, FileJson, Globe, BookOpen } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">About GEENMY</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Bridging languages through the power of Generative AI and Community Collaboration.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Cpu className="w-6 h-6 text-purple-600" />
             How It's Made
           </h2>
           <p className="text-slate-600 leading-relaxed mb-4">
             GEENMY (Gemini Empowered English-Myanmar Dictionary) utilizes Google's advanced <strong>Gemini models</strong> to generate high-quality, context-aware dictionary entries. Unlike traditional static dictionaries, our engine can generate definitions, examples, and phonetic transcriptions on the fly for any word.
           </p>
           <p className="text-slate-600 leading-relaxed">
             The application is built with modern web technologies including React, TypeScript, and Supabase, ensuring a fast and responsive experience for all users.
           </p>
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Users className="w-6 h-6 text-blue-600" />
             Crowdsourcing & Verification
           </h2>
           <p className="text-slate-600 leading-relaxed">
             AI is powerful, but human nuance is irreplaceable. GEENMY operates on a <strong>crowdsourcing model</strong> where users can:
           </p>
           <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
             <li>Vote on definitions to signal accuracy.</li>
             <li>Suggest edits to refine meanings or correct translations.</li>
             <li>Review AI-generated content before it becomes part of the permanent database.</li>
           </ul>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-16 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
           <Globe className="w-6 h-6 text-green-600" />
           Our Core Purpose
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
           <div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-slate-500" />
                Structured Data for AI Training
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                Every entry in GEENMY is stored in a strict, schema-compliant JSON format. This allows the data to be easily exported and used to <strong>fine-tune Large Language Models (LLMs)</strong> for low-resource languages like Myanmar.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                While optimized for modern JSON-based workflows, our data structure is designed to be interoperable with linguistic standards like <strong>OntoLex-Lemon</strong> and <strong>TEI</strong> (Text Encoding Initiative), facilitating seamless integration into the semantic web and academic research.
              </p>
           </div>
           <div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-slate-500" />
                 Preserving Rare Languages
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                 By combining AI generation with community verification, we can rapidly build comprehensive datasets for languages that are underrepresented in the digital space. Our goal is to create a sustainable pipeline for language preservation and digitization.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};