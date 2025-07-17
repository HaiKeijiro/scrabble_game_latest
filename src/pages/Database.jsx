import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Database() {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  const exportToExcel = async () => {
    try {
      setExporting(true);
      setMessage("");

      // Fetch users directly for export
      const response = await fetch("http://localhost:3001/api/users");
      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to fetch database");
      }

      // Prepare data for Excel
      const excelData = data.users.map((user, index) => ({
        No: index + 1,
        Name: user.name,
        Phone: user.phone,
        Score: user.score,
        "Date Created": new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // No
        { wch: 20 }, // Name
        { wch: 15 }, // Phone
        { wch: 10 }, // Score
        { wch: 25 }, // Date Created
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Scrabble Users");

      // Generate Excel file and download
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `scrabble_database_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(fileData, fileName);

      setMessage(
        `✨ Magic! ${data.users.length} records exported successfully!`
      );
    } catch (err) {
      console.error("Error exporting database:", err);
      setMessage("❌ Magic failed! Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="another-bg blackbones-font uppercase min-h-screen w-full mx-auto text-white flex flex-col items-center pt-[25rem]">
      {/* Main Content */}
      <div className="text-center">
        <h1 className="text-[6em] font-black mb-8">database</h1>
        <p className="text-[1.2em] mb-16 opacity-80">
          convert your scrabble database into spreadsheet
        </p>

        {/* Magic Button */}
        <button
          onClick={exportToExcel}
          disabled={exporting}
          className={`bg-button rounded-[10rem] px-24 py-8 text-[1.5em] font-black transition-all duration-300 transform ${
            exporting
              ? "opacity-50 cursor-not-allowed scale-95"
              : "hover:bg-[#0f3a7a] hover:scale-110 active:scale-95"
          }`}
        >
          {exporting ? (
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              creating magic...
            </div>
          ) : (
            "✨ magic export ✨"
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className="mt-12 text-center">
            <p className="text-[0.8em] bg-black/30 rounded-2xl px-8 py-4 backdrop-blur-sm">
              {message}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-16 text-center opacity-60">
          <p className="text-[1em] mb-4">how it works:</p>
          <div className="text-[0.8em] space-y-2">
            <p>• click the magic button</p>
            <p>• database automatically converts to excel</p>
            <p>• file downloads to your computer</p>
            <p>• open with excel, google sheets, or any spreadsheet app</p>
          </div>
        </div>
      </div>
    </main>
  );
}
