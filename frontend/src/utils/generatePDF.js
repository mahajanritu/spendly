import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (user, stats, transactions) => {
  const doc = new jsPDF();
  const now = new Date();

  // Header
  doc.setFillColor(124, 107, 255);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Spendly', 14, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Expense Tracker — Monthly Report', 14, 30);
  doc.text(`Generated: ${now.toLocaleDateString('en-IN')}`, 140, 30);

  // User Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Report for: ${user?.name}`, 14, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Email: ${user?.email}`, 14, 63);

  // Summary Cards
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Financial Summary', 14, 78);

  // Income Box
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(14, 83, 55, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('TOTAL INCOME', 18, 91);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs.${(stats?.totalIncome || 0).toLocaleString('en-IN')}`, 18, 102);

  // Expense Box
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(74, 83, 55, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL EXPENSES', 78, 91);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs.${(stats?.totalExpense || 0).toLocaleString('en-IN')}`, 78, 102);

  // Balance Box
  doc.setFillColor(124, 107, 255);
  doc.roundedRect(134, 83, 62, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('NET BALANCE', 138, 91);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs.${(stats?.balance || 0).toLocaleString('en-IN')}`, 138, 102);

  // Transactions Table
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Transactions', 14, 122);

  const tableData = (transactions || []).slice(0, 20).map(tx => [
    new Date(tx.date).toLocaleDateString('en-IN'),
    tx.title,
    tx.category,
    tx.type === 'income' ? 'Income' : 'Expense',
    `Rs.${tx.amount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 127,
    head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
    body: tableData,
    headStyles: {
      fillColor: [124, 107, 255],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { halign: 'right' },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Spendly — Smart Expense Tracker | spendly-lac-two.vercel.app', 14, 287);
    doc.text(`Page ${i} of ${pageCount}`, 185, 287);
  }

  doc.save(`Spendly_Report_${now.getMonth() + 1}_${now.getFullYear()}.pdf`);
};