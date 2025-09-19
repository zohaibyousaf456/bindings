// Complete Export Implementation for Audience Tab
// This file contains the complete implementation to add ODF export functionality

// 1. INSTALLATION REQUIRED:
// npm install xlsx

// 2. ADD THESE IMPORTS to your existing component:
import * as XLSX from 'xlsx';

// 3. ADD THESE FUNCTIONS to your existing component (replace the existing handleExport function):

const exportToODS = async () => {
  try {
    // Use the same data preparation function as PDF
    const audienceData = prepareAudienceData();
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create a comprehensive sheet with all data
    const allData = [
      ['AUDIENCE ANALYTICS REPORT'],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Platform: ${selectedPlatform.toUpperCase()}`],
      [''],
      
      // Profile Information Section
      ['PROFILE INFORMATION'],
      ['Field', 'Value'],
      ...audienceData.profile,
      [''],
      
      // Gender Distribution Section
      ...(audienceData.gender.length > 1 ? [
        ['GENDER DISTRIBUTION'],
        ...audienceData.gender,
        ['']
      ] : []),
      
      // Age Distribution Section  
      ...(audienceData.age.length > 1 ? [
        ['AGE DISTRIBUTION'],
        ...audienceData.age,
        ['']
      ] : []),
      
      // Locations Section
      ...(audienceData.locations.length > 1 ? [
        ['TOP LOCATIONS'],
        ...audienceData.locations,
        ['']
      ] : []),
      
      // Active Times Section
      ...(audienceData.activeTimes.length > 1 ? [
        ['MOST ACTIVE TIMES'],
        ...audienceData.activeTimes,
        ['']
      ] : []),
      
      // Reach Metrics Section
      ['REACH METRICS'],
      ['Metric', 'Value'],
      ...audienceData.reach
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths for better formatting
    ws['!cols'] = [
      { width: 25 }, // Column A - Labels/Fields
      { width: 20 }  // Column B - Values
    ];
    
    // Add some basic styling (header rows)
    const headerRows = [0, 5, 9, 15, 21, 27, 33]; // Adjust based on your data structure
    headerRows.forEach(row => {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: 14 },
          fill: { fgColor: { rgb: "E3F2FD" } }
        };
      }
    });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Audience Data');
    
    // Generate and download ODS file
    const fileName = `audience-data-${new Date().toISOString().split('T')[0]}.ods`;
    XLSX.writeFile(wb, fileName, { bookType: 'ods' });
    
    showDialog(
      "Export Successful", 
      "Audience data exported to ODS format successfully!"
    );
    
  } catch (error) {
    console.error("ODS export error:", error);
    showDialog(
      "Export Failed", 
      "Failed to export ODS file. Please try again."
    );
  }
};

// Enhanced handleExport function (REPLACE your existing handleExport function with this):
const handleExport = async (format: 'pdf' | 'ods' = 'pdf') => {
  try {
    if (format === 'pdf') {
      await exportToPDF();
    } else if (format === 'ods') {
      await exportToODS();
    }
  } catch (error) {
    console.error("Export failed:", error);
    showDialog("Export Failed", "Failed to export data. Please try again.");
  }
};

// 4. ADD THIS STATE to your existing component (add to your other useState declarations):
const [showExportDropdown, setShowExportDropdown] = useState(false);

// 5. REPLACE the export button in renderAudienceScreen() with this enhanced version:
const ExportButtonComponent = () => (
  <div className="relative">
    <button
      onClick={() => setShowExportDropdown(!showExportDropdown)}
      className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full"
    >
      <svg
        className="w-3 h-3 md:w-4 md:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export
      <svg
        className={`w-3 h-3 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    
    {showExportDropdown && (
      <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        <button
          onClick={() => {
            handleExport('pdf');
            setShowExportDropdown(false);
          }}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export as PDF
        </button>
        <button
          onClick={() => {
            handleExport('ods');
            setShowExportDropdown(false);
          }}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as ODS
        </button>
      </div>
    )}
  </div>
);

// 6. INTEGRATION INSTRUCTIONS:

// In your renderAudienceScreen() function, REPLACE this line:
/*
<button
  onClick={handleExport}
  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full"
>
  <svg>...</svg>
  Export
</button>
*/

// WITH this line:
// <ExportButtonComponent />

// 7. CLICK OUTSIDE TO CLOSE DROPDOWN (add this useEffect):
/*
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.relative')) {
      setShowExportDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
*/

export { exportToODS, ExportButtonComponent };