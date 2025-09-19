// ODF Export Solution for Audience Tab
// Add this to your existing React component

// First, install the required dependency:
// npm install xlsx

import * as XLSX from 'xlsx';

// Add this function to your existing component
const exportToODS = async () => {
  try {
    // Prepare the same data structure as PDF export
    const audienceData = prepareAudienceData();
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheets for different sections
    
    // 1. Profile Information Sheet
    const profileWS = XLSX.utils.aoa_to_sheet([
      ['Audience Analytics Report'],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Platform: ${selectedPlatform.toUpperCase()}`],
      [''],
      ['Profile Information'],
      ['Field', 'Value'],
      ...audienceData.profile
    ]);
    
    // Style the profile sheet
    profileWS['!cols'] = [{ width: 20 }, { width: 30 }];
    
    // 2. Gender Distribution Sheet
    if (audienceData.gender.length > 1) {
      const genderWS = XLSX.utils.aoa_to_sheet([
        ['Gender Distribution'],
        [''],
        ...audienceData.gender
      ]);
      genderWS['!cols'] = [{ width: 15 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, genderWS, 'Gender Distribution');
    }
    
    // 3. Age Distribution Sheet
    if (audienceData.age.length > 1) {
      const ageWS = XLSX.utils.aoa_to_sheet([
        ['Age Distribution'],
        [''],
        ...audienceData.age
      ]);
      ageWS['!cols'] = [{ width: 15 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, ageWS, 'Age Distribution');
    }
    
    // 4. Locations Sheet
    if (audienceData.locations.length > 1) {
      const locationsWS = XLSX.utils.aoa_to_sheet([
        ['Top Locations'],
        [''],
        ...audienceData.locations
      ]);
      locationsWS['!cols'] = [{ width: 20 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, locationsWS, 'Locations');
    }
    
    // 5. Active Times Sheet
    if (audienceData.activeTimes.length > 1) {
      const activeTimesWS = XLSX.utils.aoa_to_sheet([
        ['Most Active Times'],
        [''],
        ...audienceData.activeTimes
      ]);
      activeTimesWS['!cols'] = [{ width: 15 }, { width: 15 }];
      XLSX.utils.book_append_sheet(wb, activeTimesWS, 'Active Times');
    }
    
    // 6. Reach Metrics Sheet
    const reachWS = XLSX.utils.aoa_to_sheet([
      ['Reach Metrics'],
      [''],
      ['Metric', 'Value'],
      ...audienceData.reach
    ]);
    reachWS['!cols'] = [{ width: 20 }, { width: 15 }];
    XLSX.utils.book_append_sheet(wb, reachWS, 'Reach Metrics');
    
    // Add the profile sheet first
    XLSX.utils.book_append_sheet(wb, profileWS, 'Profile Information');
    
    // Generate ODS file
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

// Enhanced export function with format selection
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

// Updated export button with dropdown for format selection
const ExportButton = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
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
          className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
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
      
      {showDropdown && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              handleExport('pdf');
              setShowDropdown(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
          >
            Export as PDF
          </button>
          <button
            onClick={() => {
              handleExport('ods');
              setShowDropdown(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
          >
            Export as ODS
          </button>
        </div>
      )}
    </div>
  );
};

// Usage: Replace the existing export button in renderAudienceScreen with:
// <ExportButton />