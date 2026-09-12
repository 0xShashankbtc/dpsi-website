import DOMPurify from "isomorphic-dompurify";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { formatISTDate } from "@/lib/dateUtils";

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const cleanSlug = (slug || "").replace(/^\/+/, "");

  const { data: page, isLoading } = trpc.cms.getPageBySlug.useQuery(
    { slug: cleanSlug },
    { enabled: !!cleanSlug }
  );

  return (
    <Layout>
      <SEO
        title={page?.metaTitle || page?.title || "Page"}
        description={
          page?.metaDescription ||
          (page?.title
            ? `Read ${page.title} on Delhi Public School Indirapuram.`
            : "Delhi Public School Indirapuram official page.")
        }
      />
      <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading page content...</p>
            </div>
          ) : page ? (
            <motion.article
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-xs text-slate-500">
                <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="capitalize">{page.category || "Pages"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">{page.title}</span>
              </nav>

              {/* Header */}
              <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50">
                    {page.category || "General"}
                  </span>
                  {page.updatedAt && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Updated {formatISTDate(page.updatedAt)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {page.title}
                </h1>
              </header>

              {/* Rich Content Render Area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 shadow-sm">
                <div
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-lg prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content || "<p>No content provided for this page.</p>") }}
                />
              </div>

              {/* Back to Home CTA */}
              <div className="pt-4 flex items-center justify-between">
                <Link to="/">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                    Contact School
                  </Button>
                </Link>
              </div>
            </motion.article>
          ) : (
            <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The page "/{cleanSlug}" could not be found or has not been published yet.
              </p>
              <Link to="/" className="inline-block pt-2">
                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                  Return to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
