'use client';

export default function ResultActions({ assessmentId, scoreResult }: { assessmentId: string, scoreResult: any }) {

    const handlePrint = () => {
        window.print();
    };

    const handleCSV = () => {
        // Simple CSV generation
        const headers = ['Category', 'Score', 'Weighted Score'];
        const rows = Object.entries(scoreResult.breakdown).map(([k, v]) => [k, '-', v]); // Simplified
        // Real CSV should fetch responses.

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `assessment_${assessmentId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex gap-4 print:hidden">
            <button onClick={handlePrint} className="btn-secondary">
                Export to PDF (Print)
            </button>
            <button onClick={handleCSV} className="btn-secondary">
                Download CSV
            </button>
        </div>
    );
}
