'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWithExpiry, setWithExpiry } from '@/lib/storage';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [error, setError] = useState('');
  const [pdfText, setPdfText] = useState('');

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


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsParsingPdf(true);
    const formData = new FormData();
    formData.append('FILE', e.target.files[0]);

    try {
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse PDF');
      const text = await response.text();
      setPdfText(text);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Failed to parse PDF. Please try again.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription, apiKey, pdfText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      const data = await response.json();
      setWithExpiry('cvData', data, 60 * 60 * 1000); // 1 hour
      router.push('/cv-edit');
    } catch (err) {
      console.error('Error generating CV:', err);
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
                <Label htmlFor="file">Upload Current CV (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    disabled={isParsingPdf}
                  />
                  {isParsingPdf && (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  )}
                </div>
              </div>

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
