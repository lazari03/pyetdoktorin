import PDFDocument from 'pdfkit';
import type { DoctorAgreement } from '@/services/doctorAgreementsService';
import { DOCTOR_TERMS_TITLE, DOCTOR_TERMS_SECTIONS } from '@/content/doctorTermsContent';

export function renderDoctorAgreementPdf(agreement: DoctorAgreement): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 56 });

  doc.fontSize(18).font('Helvetica-Bold').text(DOCTOR_TERMS_TITLE);
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#555').text(`Terms version: ${agreement.termsVersion}`);
  doc.text(`Signed: ${new Date(agreement.signedAt).toISOString()}`);
  doc.moveDown(1);

  doc.fillColor('#000').fontSize(12).font('Helvetica-Bold').text('Doctor');
  doc.fontSize(11).font('Helvetica');
  doc.text(agreement.doctorName || agreement.doctorId);
  if (agreement.doctorEmail) doc.text(agreement.doctorEmail);
  doc.text(`ID: ${agreement.doctorId}`);
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').text('Terms & Conditions');
  doc.moveDown(0.3);
  DOCTOR_TERMS_SECTIONS.forEach((section) => {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(section.title);
    doc.moveDown(0.2);
    doc.fontSize(10.5).font('Helvetica');
    section.paragraphs.forEach((paragraph) => {
      doc.text(paragraph, { align: 'justify' });
      doc.moveDown(0.4);
    });
    if (section.bullets?.length) {
      doc.list(section.bullets, { bulletRadius: 1.5, textIndent: 12 });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.3);
  });

  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold').text('Signature');
  doc.moveDown(0.3);
  const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(agreement.signatureDataUrl);
  if (match?.[2]) {
    const buffer = Buffer.from(match[2], 'base64');
    doc.image(buffer, { width: 220 });
  }

  doc.end();
  return doc;
}
