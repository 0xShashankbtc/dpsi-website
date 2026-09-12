import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, ChevronDown, ChevronUp, FileText, ClipboardList, CreditCard, BadgeCheck, Loader2, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-6 h-6" />,
  ClipboardList: <ClipboardList className="w-6 h-6" />,
  CreditCard: <CreditCard className="w-6 h-6" />,
  BadgeCheck: <BadgeCheck className="w-6 h-6" />,
  CheckCircle: <CheckCircle className="w-6 h-6" />,
  HelpCircle: <HelpCircle className="w-6 h-6" />,
};

export default function Admissions() {
  const { data: stepsList } = trpc.cms.listAdmissionSteps.useQuery();
  const { data: faqsList } = trpc.cms.listFaqs.useQuery({ category: "Admissions" });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    email: "",
    phone: "",
    grade: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    previousSchool: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = trpc.admissions.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to submit admission application. Please check details and try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    mutation.mutate(formData);
  };

  return (
    <Layout>
      <SEO
        title="Admissions 2026-27"
        description="Admissions open for Session 2026-27 from Pre-Nursery to Class 9 and 11 at Delhi Public School Indirapuram. Apply online."
      />
      <section className="relative py-20 sm:py-24 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
        {/* Dynamic Background Mesh Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              Session 2026-27 Registrations Open
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              Admissions
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              Join the DPS Indirapuram family. A journey of excellence, discovery, and growth awaits your child.
            </p>
          </div>
        </div>
      </section>

      {/* 100% DYNAMIC ADMISSION STEPS */}
      {stepsList && stepsList.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Admission Process</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stepsList.map((step: any, i: number) => (
                <motion.div key={step._id || step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full text-center hover:shadow-lg transition-shadow relative border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        {iconMap[step.icon || "FileText"] || <FileText className="w-6 h-6" />}
                      </div>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {step.stepNumber || i + 1}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-emerald-50 dark:bg-emerald-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Online Admission Form</h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-lg">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground mb-6">Thank you for your interest. Our admissions team will contact you within 2-3 business days.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another</Button>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg space-y-6">
              {errorMessage && (
                <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
                  {errorMessage}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input id="studentName" required value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input id="parentName" required value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Applying For *</Label>
                  <Select value={formData.grade} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      {["Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((g) => (
                        <SelectItem key={g} value={g}>Class {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea id="address" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input id="previousSchool" value={formData.previousSchool} onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Additional Message</Label>
                  <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Application"}
              </Button>
            </motion.form>
          )}
        </div>
      </section>

      {/* 100% DYNAMIC ADMISSION FAQS */}
      {faqsList && faqsList.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </motion.div>
            <div className="space-y-3">
              {faqsList.map((faq: any, i: number) => (
                <motion.div key={faq._id || i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                      {openFaq === i ? <ChevronUp className="w-5 h-5 text-emerald-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-emerald-500 shrink-0" />}
                    </div>
                    {openFaq === i && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-slate-600 dark:text-slate-300 mt-3 text-sm leading-relaxed">
                        {faq.answer}
                      </motion.p>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}