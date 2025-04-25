'use client';

import { useState, useEffect, useCallback } from 'react';
import { type CVTemplateProps } from '../../components/templates/CVTemplate';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getWithExpiry } from '@/lib/storage';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function CVEditPage() {
  const [cvData, setCvData] = useState<CVTemplateProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedCvData = getWithExpiry<CVTemplateProps>('cvData');
    if (savedCvData) {
      setCvData(savedCvData);
      debouncedUpdate(savedCvData);
    }
  }, []);

  const debouncedUpdate = useCallback((newData: CVTemplateProps) => {
    setIsLoading(true);
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    const timeout = setTimeout(async () => {
      setCvData(newData);
      try {
        const response = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newData),
        });
        if (!response.ok) throw new Error('Failed to generate PDF');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
      setIsLoading(false);
    }, 500);
    setUpdateTimeout(timeout);
  }, [updateTimeout]);

  const handleInputChange = (field: keyof CVTemplateProps, value: any) => {
    if (!cvData) return;
    const newData = {
      ...cvData,
      [field]: value
    };
    setCvData(newData);
    debouncedUpdate(newData);
  };



  const handleExperienceChange = (index: number, field: keyof NonNullable<typeof cvData>['experience'][0], value: any) => {
    if (!cvData?.experience) return;
    const newData = {
      ...cvData,
      experience: cvData.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    } as CVTemplateProps;
    setCvData(newData);
    debouncedUpdate(newData);
  };

  const handleEducationChange = (index: number, field: keyof NonNullable<typeof cvData>['education'][0], value: any) => {
    if (!cvData?.education) return;
    const newData = {
      ...cvData,
      education: cvData.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    } as CVTemplateProps;
    setCvData(newData);
    debouncedUpdate(newData);
  };

  const addExperience = () => {
    if (!cvData) return;
    const newData = {
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          title: '',
          company: '',
          location: '',
          startMonthYear: '',
          endMonthYear: '',
          description: [],
          technologies: ''
        }
      ]
    };
    debouncedUpdate(newData);
  };

  const removeExperience = (index: number) => {
    if (!cvData) return;
    const newData = {
      ...cvData,
      experience: cvData.experience.filter((_, i) => i !== index)
    };
    debouncedUpdate(newData);
  };

  const addEducation = () => {
    if (!cvData) return;
    const newData = {
      ...cvData,
      education: [
        ...cvData.education,
        {
          degree: '',
          institution: '',
          startMonthYear: '',
          endMonthYear: '',
          location: '',
          details: []
        }
      ]
    };
    debouncedUpdate(newData);
  };

  const removeEducation = (index: number) => {
    if (!cvData) return;
    const newData = {
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index)
    };
    debouncedUpdate(newData);
  };


  const handleDownload = async () => {
    if (!cvData) return;
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cvData),
    });
    if (!response.ok) throw new Error('Failed to generate PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [updateTimeout, pdfUrl]);

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>No CV data found. Please go back to the home page and generate a CV first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Left Column - Edit Form */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit CV</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
              >
                Download CV
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/cover-letter')}
              >
                Generate Cover Letter
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Job Description Summary</Label>
                <p className="text-sm text-gray-700">{cvData.jobDescriptionSummary}</p>
              </div>
              <div className="space-y-2">
                <Label>ATS Score</Label>
                <p>{cvData.atsScore}</p>
              </div>
              <div className="space-y-2">
                <Label>Required Years of Experience</Label>
                <p>{cvData.requiredYearsExperience}</p>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {cvData.recommendedKeywords?.map((skill, index) => {
                    let isMatched =  cvData.summary.toLowerCase().includes(skill.toLowerCase())
                  
                    isMatched =  isMatched || cvData.experience.some(exp => 
                      exp.technologies?.toLowerCase().includes(skill.toLowerCase()) ||
                      exp.description.some(desc => desc.toLowerCase().includes(skill.toLowerCase()))
                    );
                    
                    return (
                      <div key={index} className={`px-2 py-1 rounded ${
                        isMatched ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {skill}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Edit CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={cvData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={cvData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={cvData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={cvData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={cvData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Github</Label>
                <Input
                  value={cvData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Linkedin</Label>
                <Input
                  value={cvData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea
                    value={cvData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Professional summary..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Experience</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                  >
                    Add Experience
                  </Button>
                </div>
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-lg relative">
                    <Input
                      placeholder="Title"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                    />
                    <Input
                      placeholder="Start Month/Year"
                      value={exp.startMonthYear}
                      onChange={(e) => handleExperienceChange(index, 'startMonthYear', e.target.value)}
                    />
                    <Input
                      placeholder="End Month/Year"
                      value={exp.endMonthYear} 
                      onChange={(e) => handleExperienceChange(index, 'endMonthYear', e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (one per line)"
                      value={exp.description.join('\n')}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value.split('\n'))}
                    />
                    <Input
                      placeholder="Technologies"
                      value={exp.technologies}
                      onChange={(e) => handleExperienceChange(index, 'technologies', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Education</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                  >
                    Add Education
                  </Button>
                </div>
                {cvData.education.map((edu, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-lg relative">
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    />
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    />
                    <Input
                      placeholder="Start Month/Year"
                      value={edu.startMonthYear}
                      onChange={(e) => handleEducationChange(index, 'startMonthYear', e.target.value)}
                    />
                    <Input
                      placeholder="End Month/Year"
                      value={edu.endMonthYear}
                      onChange={(e) => handleEducationChange(index, 'endMonthYear', e.target.value)}
                    />

                    <Input
                      placeholder="Location"
                      value={edu.location}
                      onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                    />
                    <Textarea
                      placeholder="Details (one per line)"
                      value={edu.details?.join('\n')}
                      onChange={(e) => handleEducationChange(index, 'details', e.target.value.split('\n'))}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Right Column - PDF Preview */}
        <div className="h-[800px] fixed right-0 w-1/2">
          {cvData ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowPathIcon className="h-8 w-8 animate-spin" />
                    <p className="text-sm text-muted-foreground">Updating preview...</p>
                  </div>
                </div>
              )}
              {pdfUrl && (<>
                <div className="flex justify-end mb-2 mr-2">
                  <Button onClick={handleDownload} className="bg-blue-500 text-white"> 
                    Download PDF
                  </Button>
                </div>
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border rounded-lg"
                  title="CV Preview"
                />
              </>)}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Please add your CV information</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 