import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { CVTemplateProps } from '@/components/CVTemplate';
import CVTemplate from '@/components/CVTemplate';

export async function POST(request: Request) {
  try {
    const cvData = await request.json() as CVTemplateProps;
    
    if (!cvData || !cvData.name || !cvData.email) {
      return NextResponse.json(
        { error: 'Invalid CV data' },
        { status: 400 }
      );
    }

    console.log('Generating PDF for:', cvData.name);

   
    const pdfBuffer = await renderToBuffer(CVTemplate(cvData));
  
    console.log('PDF generated successfully');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv.pdf"',
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