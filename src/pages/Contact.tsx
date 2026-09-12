import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import LazyMap from "@/components/LazyMap";
import SEO from "@/components/SEO";
import { trpc } from "@/providers/trpc";

export default function Contact() {
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const address = getSetting("contact_address", "526/1, Ahinsa Khand-II, Indirapuram, Ghaziabad, U.P. - 201014");
  const phone = getSetting("contact_phone", "+91-0120-4660000, 4670000");
  const email = getSetting("contact_email", "info@dpsindirapuram.com");
  const officeHours = getSetting("office_hours", "Monday – Saturday: 8:00 AM – 3:00 PM (Second & Fourth Saturdays Closed)");

  const mutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    mutation.mutate(form);
  };

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Reach out to DPS Indirapuram admissions office, administration, and campus location in Ahinsa Khand-II, Ghaziabad."
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
              Connect With Us
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              Contact Us
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              We would love to hear from you. Reach out for admissions, inquiries, or feedback.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Get in Touch</h2>
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Address</h3>
                    <p className="text-sm text-muted-foreground">{address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Phone</h3>
                    <p className="text-sm text-muted-foreground">{phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Email</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Office Hours</h3>
                    <p className="text-sm text-muted-foreground">{officeHours}</p>
                  </div>
                </div>
              </div>

              <LazyMap />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {submitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Send a Message</h2>
                  {errorMessage && (
                    <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" disabled={mutation.isPending}>
                    {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}