import ExcelJS from 'exceljs';
import logoImg from '../assets/logogrand.png';

/**
 * Helper to convert image URL to Base64/ArrayBuffer for ExcelJS
 */
const getLogoArrayBuffer = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blob.arrayBuffer();
};

/**
 * Export data array ke file Excel (.xlsx) dengan logo, header, dan format formal.
 *
 * @param {Array<Object>} data - Array of objects (rows)
 * @param {Array<{header: string, key: string}>} columns - Definisi kolom
 * @param {string} filename - Nama file tanpa ekstensi
 * @param {string} reportTitle - Judul laporan (misal: "Rekap Absensi Tutor")
 */
export const exportToExcelWithHeader = async (data, columns, filename = 'export', reportTitle = 'Laporan') => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // 1. Add Logo (positioned at A1:C13)
    try {
      const logoBuffer = await getLogoArrayBuffer(logoImg);
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png',
      });
      
      // Position logo spanning A1:C13 (13 rows tall, 3 columns wide)
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 240 }
      });
    } catch (err) {
      console.error('Failed to load logo in Excel export:', err);
    }

    // 2. Add Header Text (Bimbel Name & Report Title)
    // Header title section starts from cell D4
    worksheet.mergeCells('D4:K4');
    const titleCell = worksheet.getCell('D4');
    titleCell.value = 'GRAND 3 SUNGGAL';
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: '0000236F' } }; // Deep Academic Blue
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('D5:K5');
    const subtitleCell = worksheet.getCell('D5');
    subtitleCell.value = 'Sistem Informasi & Manajemen Akademik';
    subtitleCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: '0064748B' } }; // Slate Gray
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('D6:K6');
    const reportTitleCell = worksheet.getCell('D6');
    reportTitleCell.value = reportTitle;
    reportTitleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: '001E293B' } }; // Dark Slate
    reportTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Set row heights for header area (rows 1-19 are reserved, logo occupies 1-13)
    // Distribute height to make the logo fill the area proportionally
    for (let r = 1; r <= 13; r++) {
      worksheet.getRow(r).height = 18; // 13 rows × 18 ≈ 234 pixels for logo
    }
    worksheet.getRow(4).height = 28;
    worksheet.getRow(5).height = 20;
    worksheet.getRow(6).height = 24;
    worksheet.getRow(14).height = 10;
    // Rows 15-19 stay as default spacing before table

    // 3. Define Table Headers (Row 20)
    const headerRowNumber = 20;
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.height = 28;

    // Set initial column widths using direct getColumn (avoid worksheet.columns
    // which can auto-write headers to row 1 in some ExcelJS versions)
    columns.forEach((col, idx) => {
      worksheet.getColumn(idx + 1).width = 15;
    });

    // Write headers explicitly to Row 20
    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = col.header;
    });

    // SAFEGUARD: Explicitly clear cells in logo area (A1:C19) to remove any
    // auto-written header content from ExcelJS
    for (let r = 1; r <= 19; r++) {
      for (let c = 1; c <= 3; c++) {
        const cell = worksheet.getCell(r, c);
        if (cell.value !== null && cell.value !== undefined) {
          cell.value = null;
        }
      }
    }

    // Style Table Headers
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }; // White text
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0000236F' }, // Deep Academic Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: '00CBD5E1' } },
        left: { style: 'thin', color: { argb: '00CBD5E1' } },
        bottom: { style: 'medium', color: { argb: '0000236F' } },
        right: { style: 'thin', color: { argb: '00CBD5E1' } },
      };
    });

    // 4. Add Data Rows
    data.forEach((item, rowIdx) => {
      const rowData = columns.map(col => {
        const val = item[col.key];
        return val !== null && val !== undefined ? val : '';
      });
      const addedRow = worksheet.addRow(rowData);
      addedRow.height = 22;

      // Style Data Rows (Zebra striping & formal borders)
      const isEven = rowIdx % 2 === 1;
      addedRow.eachCell((cell, colIdx) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: '001E293B' } };
        cell.border = {
          top: { style: 'thin', color: { argb: '00E2E8F0' } },
          left: { style: 'thin', color: { argb: '00E2E8F0' } },
          bottom: { style: 'thin', color: { argb: '00E2E8F0' } },
          right: { style: 'thin', color: { argb: '00E2E8F0' } },
        };

        // Zebra striping background
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00F8FAFC' }, // Very light gray/blue
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' },
          };
        }

        // Alignments based on data type
        const value = cell.value;
        if (typeof value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          // Format currency if it looks like nominal/spp/jumlah
          const colKey = columns[colIdx - 1]?.key;
          if (['nominal', 'spp', 'jumlah', 'diskon'].includes(colKey)) {
            cell.numFmt = '"Rp"#,##0';
          }
        } else if (value === 'Aktif' || value === 'Verified' || value === 'Hadir') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '00059669' } }; // Emerald Green
        } else if (value === 'Nonaktif' || value === 'Rejected' || value === 'Alpha') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '00DC2626' } }; // Crimson Red
        } else if (['no', 'id_pembayaran', 'nis', 'nip', 'tanggal', 'tanggal_bayar', 'hari', 'jam', 'jam_selesai', 'status'].includes(columns[colIdx - 1]?.key)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // 5. Auto-fit column widths
    columns.forEach((col, colIdx) => {
      const headerLen = col.header ? String(col.header).length : 10;
      const maxDataLen = data.reduce((max, item) => {
        const val = item[col.key];
        if (val === null || val === undefined) return max;
        // Format currency length estimation
        if (['nominal', 'spp', 'jumlah', 'diskon'].includes(col.key) && typeof val === 'number') {
          return Math.max(max, String(val).length + 6); // Add space for "Rp " and commas
        }
        return Math.max(max, String(val).length);
      }, 0);

      const column = worksheet.getColumn(colIdx + 1);
      column.width = Math.min(Math.max(headerLen + 4, maxDataLen + 4, 12), 50);
    });

    // 6. Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel with ExcelJS:', error);
  }
};

/**
 * Legacy exportToExcel function (fallback)
 */
export const exportToExcel = (data, columns, filename = 'export') => {
  // Keep the legacy function just in case, but we use exportToExcelWithHeader everywhere
  exportToExcelWithHeader(data, columns, filename);
};
