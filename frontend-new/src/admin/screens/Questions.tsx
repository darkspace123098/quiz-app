import React, { useEffect, useState, useRef } from "react";
import { Search, Plus, Trash2, Filter, HelpCircle, Download, Upload, Pencil, X, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  className: string;
  quizCode: string;
}

export const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classes, setClasses] = useState<string[]>([]);

  // Form state
  const [text, setText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [correct, setCorrect] = useState("");
  const [qClass, setQClass] = useState("");
  const [qCode, setQCode] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/questions/data");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/admin/classes/data");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes);
      }
    } catch (err) {
      console.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchClasses();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: text,
          options: [opt1, opt2, opt3, opt4],
          correctAnswer: correct,
          className: qClass,
          quizCode: qCode
        })
      });

      if (res.ok) {
        toast.success(editingId ? "Updated successfully" : "Added successfully");
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
        fetchQuestions();
      } else {
        const data = await res.json();
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    }
  };

  const resetForm = () => {
    setText(""); setOpt1(""); setOpt2(""); setOpt3(""); setOpt4("");
    setCorrect(""); setQClass(""); setQCode("");
  };

  const handleEdit = (q: Question) => {
    setEditingId(q._id);
    setText(q.questionText);
    setOpt1(q.options[0]);
    setOpt2(q.options[1]);
    setOpt3(q.options[2]);
    setOpt4(q.options[3]);
    setCorrect(q.correctAnswer);
    setQClass(q.className);
    setQCode(q.quizCode);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Question deleted");
        fetchQuestions();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting question");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `questions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: Array.isArray(json) ? json : [json] })
        });
        if (res.ok) {
          toast.success("Import successful");
          fetchQuestions();
        } else {
          toast.error("Import failed");
        }
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const filteredQuestions = questions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.quizCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Question Bank</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage questions for different classes and quizzes.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJSON} 
            className="hidden" 
            accept=".json" 
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl gap-2 border-slate-200 dark:border-slate-800"
          >
            <Download size={18} />
            Import JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportJSON}
            className="rounded-2xl gap-2 border-slate-200 dark:border-slate-800"
          >
            <Upload size={18} />
            Export JSON
          </Button>
          <Button 
            onClick={() => {
              if (showAddForm) {
                setEditingId(null);
                resetForm();
              }
              setShowAddForm(!showAddForm);
            }}
            className={`rounded-2xl gap-2 shadow-lg transition-all duration-300 ${
              showAddForm 
                ? "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white" 
                : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
            }`}
          >
            {showAddForm ? <Plus className="rotate-45" size={18} /> : <Plus size={18} />}
            {showAddForm ? "Cancel" : "Add Question"}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-indigo-500/20 bg-indigo-500/[0.02] rounded-3xl p-8 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddQuestion} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="qText">Question Text</Label>
                <textarea 
                  id="qText" 
                  className="w-full min-h-[100px] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all"
                  placeholder="Enter your question here..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Label>Options</Label>
                <div className="space-y-3">
                  <Input placeholder="Option 1" value={opt1} onChange={e => setOpt1(e.target.value)} required className="rounded-xl" />
                  <Input placeholder="Option 2" value={opt2} onChange={e => setOpt2(e.target.value)} required className="rounded-xl" />
                  <Input placeholder="Option 3" value={opt3} onChange={e => setOpt3(e.target.value)} required className="rounded-xl" />
                  <Input placeholder="Option 4" value={opt4} onChange={e => setOpt4(e.target.value)} required className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <select 
                    value={correct}
                    onChange={e => setCorrect(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                  >
                    <option value="">Select Correct Option</option>
                    {opt1 && <option value={opt1}>{opt1}</option>}
                    {opt2 && <option value={opt2}>{opt2}</option>}
                    {opt3 && <option value={opt3}>{opt3}</option>}
                    {opt4 && <option value={opt4}>{opt4}</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <select 
                      value={qClass}
                      onChange={e => setQClass(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiz Code</Label>
                    <Input placeholder="QUIZ101" value={qCode} onChange={e => setQCode(e.target.value)} required className="rounded-xl" />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 h-11 shadow-lg shadow-indigo-500/10">
                  {editingId ? "Update Question" : "Save Question"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search questions, codes, or classes..." 
              className="pl-10 rounded-2xl h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
             <div className="p-12 text-center text-slate-400 animate-pulse">Loading bank...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No questions found.</div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                <div className="flex justify-between gap-4 mb-4">
                  <div className="flex gap-2">
                    <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight border border-indigo-500/10">
                      {q.quizCode}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight border border-slate-200 dark:border-slate-800">
                      {q.className}
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg"
                      onClick={() => handleEdit(q)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDelete(q._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-4 leading-relaxed">{q.questionText}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border text-sm transition-all ${
                        opt === q.correctAnswer 
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm shadow-emerald-500/10" 
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      <span className="mr-2 opacity-50 font-mono">{String.fromCharCode(65 + i)}.</span> {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
