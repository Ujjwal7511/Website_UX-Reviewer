import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportAsPdf(element, filename = 'ux-review-report.pdf') {
  if (!element) return;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#f8fafc',
  });
  const img = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.height / canvas.width;
  const imgW = pageW;
  const imgH = pageW * ratio;
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, 'PNG', 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(img, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(filename);
}
