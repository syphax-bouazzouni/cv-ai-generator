import { NextResponse } from 'next/server';
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import { CoverLetterTemplate } from '@/components/templates/CoverLetterTemplate';
import CVTemplate from '@/components/templates/CVTemplate';
import { ReactElement } from 'react';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Generating PDF for:', data.name);

    const isCoverLetter = data.coverLetter !== undefined;
    const filename = isCoverLetter ? 'cover-letter.pdf' : 'cv.pdf';

    // Ensure required fields are present
    if (!data.name || !data.email) {
      throw new Error('Missing required fields');
    }

    // For cover letter, ensure coverLetter data is properly structured
    if (isCoverLetter && (!data.coverLetter || !data.coverLetter.introduction || !data.coverLetter.body || !data.coverLetter.closing)) {
      throw new Error('Invalid cover letter data structure');
    }

    let pdfBuffer;

    if (isCoverLetter) {
      console.log('Cover letter data:', data);
      pdfBuffer = await renderToBuffer(CoverLetterTemplate(data) as ReactElement<DocumentProps>);
    } else {
      pdfBuffer = await renderToBuffer(CVTemplate(data) as ReactElement<DocumentProps>);
    }

    console.log('PDF generated successfully');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 