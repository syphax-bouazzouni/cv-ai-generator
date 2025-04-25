'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { CVTemplate } from '../components/CVTemplate';
import { PDFViewer } from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWithExpiry, setWithExpiry } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface CVData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
  skills: string[];
  recommendedKeywords: string[];
  requiredYearsExperience: number;
}

export default function Home() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cvData, setCvData] = useState<CVData | null>(null);

  // Load saved data on component mount
  useEffect(() => {
    const savedJobDescription = getWithExpiry<string>('jobDescription');
    const savedApiKey = getWithExpiry<string>('apiKey');
    
    if (savedJobDescription) setJobDescription(savedJobDescription);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (jobDescription) {
      setWithExpiry('jobDescription', jobDescription, 60 * 60 * 1000); // 1 hour
    }
  }, [jobDescription]);

  useEffect(() => {
    if (apiKey) {
      setWithExpiry('apiKey', apiKey, 60 * 60 * 1000); // 1 hour
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCvData(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription, apiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      const data = await response.json();
      setCvData(data);
      setWithExpiry('cvData', data, 60 * 60 * 1000); // 1 hour
      router.push('/cv-edit');
    } catch (err) {
      setError('Failed to generate CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
       <h1 className="text-4xl font-bold text-center">AI-Powered CV Generator</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">Gemini API Key</Label>
                <Input
                  type="password"
                  id="apiKey"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Generating CV...
                  </>
                ) : (
                  'Generate CV'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
