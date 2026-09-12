import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Search,
  Download,
  AlertCircle,
  ShieldCheck,
  Calendar,
  UserCheck,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatISTDate } from "@/lib/dateUtils";

export default function TransferCertificate() {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [dob, setDob] = useState("");
  const [verifiedResult, setVerifiedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyMutation = trpc.cms.verifyTc.useMutation({
    onSuccess: (res) => {
      setVerifiedResult(res.data);
      setErrorMessage("");
    },
    onError: (err) => {
      setVerifiedResult(null);
      setErrorMessage(
        err.message ||
          "No Transfer Certificate found matching the provided Admission Number and Date of Birth. Please verify your details and try again."
      );
    },
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setVerifiedResult(null);

    const cleanAdm = admissionNumber.trim();
    const cleanDob = dob.trim();

    if (!cleanAdm) {
      setErrorMessage("Please enter your Student Admission Number.");
      return;
    }
    if (!cleanDob) {
      setErrorMessage("Please enter your Date of Birth as per school records.");
      return;
    }

    verifyMutation.mutate({
      admissionNumber: cleanAdm,
      dob: cleanDob,
    });
  };

  return (
    <Layout>
      <SEO
        title="Transfer Certificate (TC) Verification"
        description="Digitally authenticate and download official Transfer Certificates issued by DPS Indirapuram."
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" /> Official Verification Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transfer Certificate (TC) Verification
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Securely verify and download digitally authenticated Transfer Certificates issued by Delhi Public School Indirapuram.
            </p>
          </div>

          {/* Two-Field Verification Form */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden p-6 sm:p-8">
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="tc-admission-number" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Student Admission Number
                  </label>
                  <Input
                    id="tc-admission-number"
                    type="text"
                    placeholder="e.g. DPSI-1082 or ADM-18492"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-base rounded-lg font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500">Found on Student ID card, Report Card, or Fee Receipt.</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tc-dob" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Date of Birth (DOB)
                  </label>
                  <Input
                    id="tc-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-base rounded-lg"
                    required
                  />
                  <p className="text-[11px] text-slate-500">Official Date of Birth as registered with DPS Indirapuram.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Dual-field cryptographic verification prevents unauthorized data extraction.
                </p>
                <Button
                  type="submit"
                  disabled={verifyMutation.isPending}
                  className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-900/20 cursor-pointer shrink-0"
                >
                  {verifyMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying Records...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" /> Verify & Access TC
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Verification Results Area */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300 flex items-start gap-3.5 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Verification Unsuccessful</h3>
                <p className="text-xs mt-1 text-red-700 dark:text-red-300 leading-relaxed">
                  {errorMessage}
                </p>
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-2">
                  For administrative assistance, please contact the school office at info@dpsindirapuram.com or call +91-0120-4660000.
                </p>
              </div>
            </motion.div>
          )}

          {verifiedResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Transfer Certificate Record Verified
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                  Status: {verifiedResult.status || "Issued"}
                </span>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                      Admission No: {verifiedResult.admissionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      CBSE Affiliated
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {verifiedResult.studentName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <p><strong>Father's Name:</strong> {verifiedResult.fatherName}</p>
                    <p><strong>Class Leaving:</strong> {verifiedResult.classLeaving}</p>
                    <p><strong>Date of Issue:</strong> {formatISTDate(verifiedResult.dateOfIssue)}</p>
                    <p><strong>Verification Hash:</strong> <span className="font-mono text-[10px]">DPSI-TC-{verifiedResult.id.slice(-6).toUpperCase()}</span></p>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <Button
                    onClick={() => window.open(verifiedResult.certificatePdfUrl, "_blank")}
                    className="w-full md:w-auto h-12 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer hover:scale-105 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Official TC (PDF)
                  </Button>
                </div>
              </div>
            </motion.div>
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

