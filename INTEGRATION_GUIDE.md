# ODF Export Integration Guide

This guide will help you add ODF (OpenDocument Format) export functionality to your existing Audience tab, alongside the current PDF export.

## Step 1: Install Required Dependency

```bash
npm install xlsx
```

## Step 2: Add Import

Add this import to your existing component file (at the top with other imports):

```typescript
import * as XLSX from 'xlsx';
```

## Step 3: Add State for Dropdown

Add this state variable with your other useState declarations:

```typescript
const [showExportDropdown, setShowExportDropdown] = useState(false);
```

## Step 4: Add the ODS Export Function

Add this function to your component (place it near your existing `exportToPDF` function):

```typescript
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
```

## Step 5: Update the handleExport Function

Replace your existing `handleExport` function with this enhanced version:

```typescript
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
```

## Step 6: Create the Enhanced Export Button Component

Add this component function inside your main component:

```typescript
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
```

## Step 7: Replace the Export Button in renderAudienceScreen()

In your `renderAudienceScreen()` function, find this existing export button:

```typescript
<button
  onClick={handleExport}
  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full"
>
  <svg>...</svg>
  Export
</button>
```

And replace it with:

```typescript
<ExportButtonComponent />
```

## Step 8: Add Click Outside Handler (Optional)

Add this useEffect to close the dropdown when clicking outside:

```typescript
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
```

## How It Works

1. **Same Data**: The ODS export uses the same `prepareAudienceData()` function as your PDF export, ensuring identical content.

2. **ODS Format**: Creates an OpenDocument Spreadsheet (.ods) file that can be opened in LibreOffice Calc, OpenOffice Calc, or Excel.

3. **Structured Layout**: Organizes data into sections with headers, just like your PDF export.

4. **User-Friendly**: Provides a dropdown to choose between PDF and ODS formats.

5. **Consistent Styling**: Maintains the same visual design as your existing export button.

## File Output

The exported ODS file will contain:
- Profile Information
- Gender Distribution
- Age Distribution
- Top Locations
- Most Active Times
- Reach Metrics

All formatted in a clean, readable spreadsheet layout with proper column widths and section headers.

## Testing

After implementation:
1. Click the Export button
2. Select "Export as ODS" from the dropdown
3. The file will download automatically
4. Open with LibreOffice Calc, Excel, or any ODS-compatible application

The ODS file will contain the exact same data as your PDF export, formatted appropriately for spreadsheet viewing and analysis.