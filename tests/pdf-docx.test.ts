import { generateResumePdf } from "../src/lib/pdf/generator";
import { generateResumeDocx } from "../src/lib/docx/generator";
import { sampleResumeData } from "../src/lib/sample-data";

export async function testPdfAndDocxGeneration() {
  console.log("▶ Running Vector PDF & Word DOCX Generation Tests...");

  // 1. Test PDF generation
  const pdfBuffer = await generateResumePdf(sampleResumeData);
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF generation failed: Returned empty buffer");
  }
  // PDF files begin with %PDF
  const pdfHeader = pdfBuffer.slice(0, 4).toString("utf-8");
  if (pdfHeader !== "%PDF") {
    throw new Error(`Invalid PDF header: ${pdfHeader}`);
  }
  console.log(`  ✔ Vector PDF generated successfully (${pdfBuffer.length} bytes, Header: ${pdfHeader})`);

  // 2. Test DOCX generation
  const docxBuffer = await generateResumeDocx(sampleResumeData);
  if (!docxBuffer || docxBuffer.length === 0) {
    throw new Error("DOCX generation failed: Returned empty buffer");
  }
  // DOCX (Zip archive) files begin with PK\x03\x04
  const docxMagic = docxBuffer.slice(0, 2).toString("utf-8");
  if (docxMagic !== "PK") {
    throw new Error(`Invalid DOCX magic bytes: ${docxMagic}`);
  }
  console.log(`  ✔ Editable DOCX generated successfully (${docxBuffer.length} bytes, Magic: ${docxMagic})`);
}
