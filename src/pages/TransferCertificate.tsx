import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Search,
  Download,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatISTDate } from "@/lib/dateUtils";

export default function TransferCertificate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results, isLoading, refetch } = trpc.cms.listTc.useQuery(
    { search: searchTerm },
    { enabled: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" /> Official Verification Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transfer Certificate (TC) Search
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Verify and download official Transfer Certificates issued by Delhi Public School Indirapuram.
            </p>
          </div>

          {/* Search Box */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden p-6 sm:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Student Admission Number or Name
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. DPSI-1082 or Student Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-base rounded-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-900/20"
                  >
                    Search TC
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tip: You can search by Admission Number, Student Name, or Father's Name.
              </p>
            </form>
          </Card>

          {/* Results Area */}
          {hasSearched && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Search Results {results ? `(${results.length})` : ""}
              </h2>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Searching official database...</p>
                </div>
              ) : results && results.length > 0 ? (
                <div className="grid gap-4">
                  {results.map((tc: any) => (
                    <motion.div
                      key={tc._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                            {tc.admissionNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            {tc.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {tc.studentName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                          <p><strong>Father:</strong> {tc.fatherName}</p>
                          <p><strong>Class Leaving:</strong> {tc.classLeaving}</p>
                          <p><strong>Date of Issue:</strong> {formatISTDate(tc.dateOfIssue)}</p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        <Button
                          onClick={() => window.open(tc.certificatePdfUrl, "_blank")}
                          className="w-full sm:w-auto bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download TC PDF
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No certificate found for "{searchTerm}"
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Please check the admission number or contact the school administrative office.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Verification Footnote */}
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold">Affiliated to CBSE, New Delhi (Affiliation No. 2130647)</p>
              <p className="mt-0.5 text-emerald-800 dark:text-emerald-400">
                All certificates generated through this portal are digitally verified and authenticated by Delhi Public School Indirapuram.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
