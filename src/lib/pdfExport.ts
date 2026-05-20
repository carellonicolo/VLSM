import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SubnetInfo, VLSMSubnet } from './subnet';
import type { IPv6SubnetInfo, IPv6VLSMSubnet } from './ipv6';

/**
 * Export Subnet Calculator results to PDF
 */
export function exportSubnetToPDF(subnet: SubnetInfo, isDarkMode: boolean = false) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500
  const headerText = [255, 255, 255];
  const altRowBg = isDarkMode ? [51, 65, 85] : [245, 247, 250];
  const borderColor = isDarkMode ? [71, 85, 105] : [200, 200, 200];

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.text('Subnet Calculator - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 27);

  // Main Info
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Informazioni Subnet', 14, 40);

  doc.setFontSize(10);
  let y = 48;

  const mainInfo = [
    ['Indirizzo IP', subnet.ipAddress],
    ['Notazione CIDR', `/${subnet.cidr}`],
    ['Classe IP', subnet.ipClass],
    ['Tipo IP', subnet.ipType],
    ['Host Totali', subnet.totalHosts.toLocaleString()],
    ['Host Utilizzabili', subnet.usableHosts.toLocaleString()],
  ];

  mainInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, y);
    y += 7;
  });

  // Detailed Table
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Dettagli Completi', 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Parametro', 'Valore Decimale', 'Valore Binario']],
    body: [
      ['Subnet Mask', subnet.subnetMask, subnet.subnetMaskBinary],
      ['Wildcard Mask', subnet.wildcardMask, '-'],
      ['Network Address', subnet.networkAddress, subnet.networkAddressBinary],
      ['First Usable IP', subnet.firstUsableIP, '-'],
      ['Last Usable IP', subnet.lastUsableIP, '-'],
      ['Broadcast Address', subnet.broadcastAddress, subnet.broadcastAddressBinary],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [headerBg[0], headerBg[1], headerBg[2]],
      textColor: [headerText[0], headerText[1], headerText[2]],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      font: 'courier',
    },
    alternateRowStyles: {
      fillColor: [altRowBg[0], altRowBg[1], altRowBg[2]],
    },
    styles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || y + 50;
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Subnet Calculator by Prof. Carello Nicolò', 14, finalY + 15);
  doc.text('https://github.com/carellonicolo/Subnet', 14, finalY + 20);

  // Save
  doc.save(`subnet_${subnet.ipAddress.replace(/\./g, '_')}_${subnet.cidr}.pdf`);
}

/**
 * Export VLSM results to PDF
 */
export function exportVLSMToPDF(
  networkIP: string,
  networkCIDR: number,
  subnets: VLSMSubnet[],
  isDarkMode: boolean = false
) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500
  const headerText = [255, 255, 255];
  const altRowBg = isDarkMode ? [51, 65, 85] : [245, 247, 250];
  const borderColor = isDarkMode ? [71, 85, 105] : [200, 200, 200];

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.text('VLSM Calculator - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Rete: ${networkIP}/${networkCIDR}`, 14, 27);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 32);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Subnet Allocate: ${subnets.length}`, 14, 45);

  // Subnets Table
  const tableData = subnets.map((subnet) => [
    subnet.name,
    `${subnet.requiredHosts}`,
    `${subnet.allocatedHosts}`,
    `/${subnet.cidr}`,
    subnet.subnetMask,
    subnet.networkAddress,
    `${subnet.firstUsableIP} - ${subnet.lastUsableIP}`,
    subnet.broadcastAddress,
  ]);

  autoTable(doc, {
    startY: 52,
    head: [
      [
        'Nome',
        'Hosts\nRichiesti',
        'Hosts\nAllocati',
        'CIDR',
        'Subnet Mask',
        'Network',
        'Range IP',
        'Broadcast',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [headerBg[0], headerBg[1], headerBg[2]],
      textColor: [headerText[0], headerText[1], headerText[2]],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      font: 'courier',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [altRowBg[0], altRowBg[1], altRowBg[2]],
    },
    styles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
    },
    margin: { left: 8, right: 8 },
  });

  // Detailed breakdown for each subnet
  let currentY = (doc as any).lastAutoTable.finalY + 15;

  subnets.forEach((subnet, index) => {
    // Add new page if needed
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${index + 1}. ${subnet.name}`, 14, currentY);
    currentY += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const details = [
      `Network: ${subnet.networkAddress}/${subnet.cidr}`,
      `Subnet Mask: ${subnet.subnetMask}`,
      `Range: ${subnet.firstUsableIP} - ${subnet.lastUsableIP}`,
      `Broadcast: ${subnet.broadcastAddress}`,
      `Hosts: ${subnet.allocatedHosts} (richiesti: ${subnet.requiredHosts})`,
    ];

    details.forEach((detail) => {
      doc.text(detail, 20, currentY);
      currentY += 5;
    });

    currentY += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text('Subnet Calculator by Prof. Carello Nicolò', 14, doc.internal.pageSize.height - 10);
  }

  // Save
  doc.save(`vlsm_${networkIP.replace(/\./g, '_')}_${networkCIDR}.pdf`);
}

/**
 * Export Subnet Visualizer results to PDF
 */
export function exportSubnetVisualizerToPDF(
  networkIP: string,
  originalCIDR: number,
  newCIDR: number,
  subnets: SubnetInfo[],
  isDarkMode: boolean = false
) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500
  const headerText = [255, 255, 255];
  const altRowBg = isDarkMode ? [51, 65, 85] : [245, 247, 250];
  const borderColor = isDarkMode ? [71, 85, 105] : [200, 200, 200];

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.text('Subnet Visualizer - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Rete: ${networkIP}/${originalCIDR} → /${newCIDR}`, 14, 27);
  doc.text(`Subnet Generate: ${subnets.length}`, 14, 32);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 37);

  // Statistics
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Statistiche', 14, 48);

  doc.setFontSize(10);
  doc.text(`• Host per subnet: ${subnets[0]?.usableHosts || 0}`, 20, 55);
  doc.text(`• Indirizzi totali per subnet: ${subnets[0]?.totalHosts || 0}`, 20, 61);
  doc.text(`• Subnet mask: ${subnets[0]?.subnetMask || '-'}`, 20, 67);

  // Subnets Table
  const tableData = subnets.map((subnet, index) => [
    `${index + 1}`,
    subnet.networkAddress,
    `/${subnet.cidr}`,
    subnet.firstUsableIP,
    subnet.lastUsableIP,
    subnet.broadcastAddress,
    `${subnet.usableHosts}`,
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['#', 'Network', 'CIDR', 'First IP', 'Last IP', 'Broadcast', 'Hosts']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [headerBg[0], headerBg[1], headerBg[2]],
      textColor: [headerText[0], headerText[1], headerText[2]],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      font: 'courier',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 15 },
      6: { halign: 'right', cellWidth: 15 },
    },
    alternateRowStyles: {
      fillColor: [altRowBg[0], altRowBg[1], altRowBg[2]],
    },
    styles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
    },
    margin: { left: 8, right: 8 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text('Subnet Calculator by Prof. Carello Nicolò', 14, doc.internal.pageSize.height - 10);
  }

  // Save
  doc.save(`visualizer_${networkIP.replace(/\./g, '_')}_${originalCIDR}_to_${newCIDR}.pdf`);
}

/**
 * Export IPv6 Subnet Calculator results to PDF
 */
export function exportIPv6SubnetToPDF(subnet: IPv6SubnetInfo, isDarkMode: boolean = false) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500
  const headerText = [255, 255, 255];
  const altRowBg = isDarkMode ? [51, 65, 85] : [245, 247, 250];
  const borderColor = isDarkMode ? [71, 85, 105] : [200, 200, 200];

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]); // Blue
  doc.text('IPv6 Subnet Calculator - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 27);

  // Main Info
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Informazioni Subnet IPv6', 14, 40);

  doc.setFontSize(10);
  let y = 48;

  const mainInfo = [
    ['Indirizzo IPv6', subnet.ipAddressCompressed],
    ['Formato Espanso', subnet.ipAddressExpanded],
    ['Prefix Length', `/${subnet.prefix}`],
    ['Tipo Indirizzo', subnet.addressType],
    ['Scope', subnet.scope],
    ['Indirizzi Totali', subnet.totalAddresses],
  ];

  mainInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    // Split long text if needed
    const maxWidth = 110;
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines, 80, y);
    y += 7 * lines.length;
  });

  // Network Details Table
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Dettagli di Rete', 14, y);
  y += 8;

  const networkDetails = [
    ['Network Address (Compresso)', subnet.networkAddressCompressed],
    ['Network Address (Espanso)', subnet.networkAddress],
    ['Subnet Mask', subnet.subnetMask],
    ['Primo Indirizzo', subnet.firstAddress],
    ['Ultimo Indirizzo', subnet.lastAddress],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Parametro', 'Valore']],
    body: networkDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [headerBg[0], headerBg[1], headerBg[2]],
      textColor: [headerText[0], headerText[1], headerText[2]],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      font: 'courier',
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 120 },
    },
    alternateRowStyles: {
      fillColor: [altRowBg[0], altRowBg[1], altRowBg[2]],
    },
    styles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
    },
  });

  // Binary Representation
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Rappresentazione Binaria', 14, finalY);
  finalY += 7;

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  // Split binary into multiple lines for readability
  const binaryParts = subnet.binary.split(':');
  const binaryLine1 = binaryParts.slice(0, 4).join(':');
  const binaryLine2 = binaryParts.slice(4, 8).join(':');

  doc.text(binaryLine1, 14, finalY);
  finalY += 4;
  doc.text(binaryLine2, 14, finalY);
  finalY += 10;

  // Reverse DNS
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Reverse DNS (PTR Record)', 14, finalY);
  finalY += 7;

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  // Split reverse DNS into multiple lines
  const reverseDNS = subnet.reverseDNS;
  const maxCharsPerLine = 80;
  const reverseDNSLines = [];
  for (let i = 0; i < reverseDNS.length; i += maxCharsPerLine) {
    reverseDNSLines.push(reverseDNS.substring(i, i + maxCharsPerLine));
  }

  reverseDNSLines.forEach(line => {
    doc.text(line, 14, finalY);
    finalY += 4;
  });

  // IPv4 Mapped (if applicable)
  if (subnet.ipv4Mapped) {
    finalY += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('IPv4 Mapped Address', 14, finalY);
    finalY += 7;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(subnet.ipv4Mapped, 14, finalY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('IPv6 Subnet Calculator by Prof. Carello Nicolò', 14, doc.internal.pageSize.height - 10);

  // Save
  const filename = subnet.ipAddressCompressed.replace(/:/g, '_').replace(/\//g, '-');
  doc.save(`ipv6_subnet_${filename}_${subnet.prefix}.pdf`);
}

/**
 * Export IPv6 VLSM results to PDF
 */
export function exportIPv6VLSMToPDF(
  networkIP: string,
  networkPrefix: number,
  subnets: IPv6VLSMSubnet[],
  isDarkMode: boolean = false
) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.text('IPv6 VLSM Calculator - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Rete: ${networkIP}/${networkPrefix}`, 14, 27);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 32);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Subnet Allocate: ${subnets.length}`, 14, 45);

  // Subnets Table
  const tableData = subnets.map((subnet) => [
    subnet.name,
    subnet.requiredHosts,
    subnet.allocatedHosts,
    `/${subnet.prefix}`,
    subnet.networkAddressCompressed,
    subnet.firstAddress,
    subnet.lastAddress,
  ]);

  autoTable(doc, {
    startY: 52,
    head: [
      [
        'Nome',
        'Indirizzi\nRichiesti',
        'Indirizzi\nAllocati',
        'Prefix',
        'Network',
        'Primo IP',
        'Ultimo IP',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      font: 'courier',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 15 },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 8, right: 8 },
  });

  // Detailed breakdown for each subnet
  let currentY = (doc as any).lastAutoTable.finalY + 15;

  subnets.forEach((subnet, index) => {
    // Add new page if needed
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${subnet.name}`, 14, currentY);
    currentY += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const details = [
      `Network: ${subnet.networkAddressCompressed}/${subnet.prefix}`,
      `Primo IP: ${subnet.firstAddress}`,
      `Ultimo IP: ${subnet.lastAddress}`,
      `Indirizzi: ${subnet.allocatedHosts} (richiesti: ${subnet.requiredHosts})`,
    ];

    details.forEach((detail) => {
      // Split long lines
      const lines = doc.splitTextToSize(detail, 170);
      lines.forEach((line: string) => {
        doc.text(line, 20, currentY);
        currentY += 5;
      });
    });

    currentY += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text('IPv6 Subnet Calculator by Prof. Carello Nicolò', 14, doc.internal.pageSize.height - 10);
  }

  // Save
  const filename = networkIP.replace(/:/g, '_').replace(/\//g, '-');
  doc.save(`ipv6_vlsm_${filename}_${networkPrefix}.pdf`);
}

/**
 * Export FLSM results to PDF
 */
export function exportFLSMToPDF(
  networkIP: string,
  originalCIDR: number,
  newCIDR: number,
  subnets: SubnetInfo[],
  isDarkMode: boolean = false
) {
  const doc = new jsPDF();

  // Theme colors
  const bg = isDarkMode ? [30, 41, 59] : [255, 255, 255]; // slate-800 vs white
  const textColor = isDarkMode ? [226, 232, 240] : [51, 51, 51]; // slate-200 vs dark
  const headerBg = isDarkMode ? [51, 65, 85] : [59, 130, 246]; // slate-600 vs blue-500
  const headerText = [255, 255, 255];
  const altRowBg = isDarkMode ? [51, 65, 85] : [245, 247, 250];
  const borderColor = isDarkMode ? [71, 85, 105] : [200, 200, 200];

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.text('FLSM Calculator - Risultati', 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Rete Originale: ${networkIP}/${originalCIDR} → Nuove Subnet: /${newCIDR}`, 14, 27);
  doc.text(`Subnet Generate: ${subnets.length}`, 14, 32);
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, 14, 37);

  // Statistics
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Statistiche', 14, 48);

  doc.setFontSize(10);
  doc.text(`• Host per subnet: ${subnets[0]?.usableHosts || 0}`, 20, 55);
  doc.text(`• Indirizzi totali per subnet: ${subnets[0]?.totalHosts || 0}`, 20, 61);
  doc.text(`• Subnet mask: ${subnets[0]?.subnetMask || '-'}`, 20, 67);

  // Subnets Table
  const tableData = subnets.map((subnet, index) => [
    `${index + 1}`,
    subnet.networkAddress,
    `/${subnet.cidr}`,
    subnet.firstUsableIP,
    subnet.lastUsableIP,
    subnet.broadcastAddress,
    `${subnet.usableHosts}`,
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['#', 'Network', 'CIDR', 'First IP', 'Last IP', 'Broadcast', 'Hosts']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [headerBg[0], headerBg[1], headerBg[2]],
      textColor: [headerText[0], headerText[1], headerText[2]],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      font: 'courier',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      2: { halign: 'center', cellWidth: 15 },
      6: { halign: 'right', cellWidth: 15 },
    },
    alternateRowStyles: {
      fillColor: [altRowBg[0], altRowBg[1], altRowBg[2]],
    },
    styles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
      lineColor: [borderColor[0], borderColor[1], borderColor[2]],
    },
    margin: { left: 8, right: 8 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text('Subnet Calculator by Prof. Carello Nicolò', 14, doc.internal.pageSize.height - 10);
  }

  // Save
  doc.save(`flsm_${networkIP.replace(/\./g, '_')}_${originalCIDR}_to_${newCIDR}.pdf`);
}

