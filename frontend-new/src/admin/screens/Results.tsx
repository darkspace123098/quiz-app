import React, { useEffect, useState } from "react";
import { Search, Award, Trash2, Download, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Result {
  _id: string;
  name: string;
  usn: string;
  className: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export const Results: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/admin/results/data");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (err) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await fetch(`/api/admin/results/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Result deleted");
        fetchResults();
      } else {
        toast.error("Failed to delete result");
      }
    } catch (err) {
      toast.error("Error deleting result");
    }
  };

  const downloadSingleResult = (r: Result) => {
    const doc = new jsPDF();
    const percentage = r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0;
    
    doc.setFontSize(22);
    doc.text("Quiz Completion Certificate", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Student Name: ${r.name}`, 20, 40);
    doc.text(`USN: ${r.usn}`, 20, 50);
    doc.text(`Class: ${r.className}`, 20, 60);
    doc.text(`Date: ${new Date(r.submittedAt).toLocaleString()}`, 20, 70);
    
    autoTable(doc, {
      startY: 80,
      head: [['Category', 'Details']],
      body: [
        ['Score', `${r.score} / ${r.totalQuestions}`],
        ['Percentage', `${percentage}%`],
        ['Status', percentage >= 40 ? 'PASSED' : 'FAILED']
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save(`${r.usn}_result.pdf`);
    toast.success("PDF generated");
  };

  const downloadAllResults = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Global Quiz Results Report", 105, 15, { align: "center" });
    
    const tableData = filteredResults.map(r => [
      r.name,
      r.usn,
      r.className,
      `${r.score} / ${r.totalQuestions}`,
      `${r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0}%`,
      new Date(r.submittedAt).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Student', 'USN', 'Class', 'Score', '%', 'Date']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save("all_results.pdf");
    toast.success("Bulk PDF report generated");
  };

  const filteredResults = results.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number, total: number) => {
    if (!total || total === 0) return "text-slate-500 bg-slate-500/10";
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-emerald-500 bg-emerald-500/10";
    if (percentage >= 50) return "text-blue-500 bg-blue-500/10";
    return "text-red-500 bg-red-500/10";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Quiz Results</h2>
          <p className="text-slate-500 dark:text-slate-400">View and manage student performances.</p>
        </div>
        <Button 
          onClick={downloadAllResults}
          variant="outline" 
          className="rounded-2xl gap-2 border-slate-200 dark:border-slate-800 hover:bg-indigo-500 hover:text-white transition-all"
        >
          <Download size={18} />
          Download All (PDF)
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by name, USN, or class..." 
              className="pl-10 rounded-2xl h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center animate-pulse">Loading results...</td></tr>
              ) : filteredResults.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No results found.</td></tr>
              ) : (
                filteredResults.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{r.name}</span>
                        <span className="text-xs text-slate-400 font-mono tracking-tight">{r.usn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-800">
                        {r.className}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(r.score, r.totalQuestions)}`}>
                          {r.score} / {r.totalQuestions}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold mt-1 block">
                        {r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(r.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
                          onClick={() => downloadSingleResult(r)}
                        >
                          <FileText size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(r._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
