import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportCSV = (data) => {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Hour,Total Consumption (kWh),Residential Consumption (kWh),Commercial Consumption (kWh)\n";
  
  data.forEach(item => {
    csvContent += `${item.hour},${item.total},${item.residential},${item.commercial}\n`;
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `energy_consumption_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  document.body.removeChild(link);
};

export const exportPDF = (data, stats) => {
  // Create PDF
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Energy Consumption Report', 14, 22);
  
  // Add timestamp
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add summary stats
  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, 40);
  
  doc.setFontSize(11);
  doc.text(`Total Households: ${stats.total_households || 0}`, 14, 48);
  doc.text(`Total Consumption: ${(stats.total_consumption || 0).toFixed(2)} kWh`, 14, 55);
  doc.text(`Average Consumption: ${(stats.avg_consumption || 0).toFixed(2)} kWh per household`, 14, 62);
  
  const commercial = stats.type_breakdown?.commercial?.consumption || 0;
  const total = stats.total_consumption || 1;
  const ratio = Math.round((commercial / total) * 100);
  doc.text(`Commercial Ratio: ${ratio}%`, 14, 69);
  
  // Prepare table data
  const tableColumn = ["Hour", "Total (kWh)", "Residential (kWh)", "Commercial (kWh)"];
  const tableRows = [];
  
  data.forEach(item => {
    const hourData = [
      new Date(item.hour).toLocaleString(),
      item.total.toFixed(2),
      item.residential.toFixed(2),
      item.commercial.toFixed(2)
    ];
    tableRows.push(hourData);
  });
  
  // Add table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 80,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [13, 110, 253],
      textColor: 255
    }
  });
  
  // Add copyright
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.text('Copyright © 2025 Your Name. Licensed under GPL-3.0.', 14, doc.internal.pageSize.height - 10, {
    align: 'left'
  });
  
  // Save the PDF
  doc.save(`energy_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
