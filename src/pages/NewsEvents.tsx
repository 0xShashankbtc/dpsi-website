import { motion } from "framer-motion";
import { CalendarDays, Clock, ArrowRight, MapPin, Newspaper, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { formatISTDate } from "@/lib/dateUtils";

export default function NewsEvents() {
  const { data: cmsActivities, isLoading: isCmsLoading } = trpc.cms.listActivities.useQuery();
  const { data: legacyNews, isLoading: isNewsLoading } = trpc.news.list.useQuery();
  const { data: legacyEvents, isLoading: isEventsLoading } = trpc.events.all.useQuery();

  const isLoading = isCmsLoading || isNewsLoading || isEventsLoading;

  const dynamicActivities = cmsActivities
    ?.filter((a: any) => !a.isDeleted && a.isPublished !== false)
    ?.map((a: any) => ({
      id: a._id?.toString() || a._id,
      title: a.title,
      category: a.category || "Campus Activity",
      excerpt: a.description,
      description: a.description,
      image: a.imageUrl || "",
      createdAt: a.eventDate || a.createdAt || new Date().toISOString(),
      eventDate: a.eventDate || a.createdAt || new Date().toISOString(),
      location: a.location || "DPS Indirapuram Campus",
    }));

  const displayNews = (dynamicActivities && dynamicActivities.length > 0)
    ? dynamicActivities
    : (legacyNews && legacyNews.length > 0)
    ? legacyNews.map((n: any) => ({
        id: n.id,
        title: n.title,
        category: n.category || "News",
        excerpt: n.excerpt || n.content?.slice(0, 150),
        description: n.content || n.excerpt,
        image: n.image || "",
        createdAt: n.createdAt,
        eventDate: n.createdAt,
        location: "DPS Indirapuram Campus",
      }))
    : [];

  const displayEvents = (dynamicActivities && dynamicActivities.length > 0)
    ? dynamicActivities
    : (legacyEvents && legacyEvents.length > 0)
    ? legacyEvents.map((e: any) => ({
        id: e.id || e._id,
        title: e.title,
        category: e.category || "Event",
        excerpt: e.description,
        description: e.description,
        image: e.image || e.imageUrl || "",
        createdAt: e.eventDate || e.createdAt,
        eventDate: e.eventDate || e.createdAt,
        location: e.location || "DPS Indirapuram Campus",
      }))
    : [];

  return (
    <Layout>
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
              Press Releases & Activity Logs
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              News & Events
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              Stay updated with the latest happenings, achievements, and upcoming events at DPS Indirapuram.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-10">
              <TabsTrigger value="news" className="flex-1">Latest News & Activities</TabsTrigger>
              <TabsTrigger value="events" className="flex-1">Upcoming Events</TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 animate-pulse space-y-3">
                      <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : displayNews.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto">
                  <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No News Announcements</h3>
                  <p className="text-xs text-slate-500 mt-1">There are currently no published news updates or press releases.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayNews.map((item: any, i: number) => (
                    <motion.div key={item.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center p-6 text-center">
                                <Newspaper className="w-10 h-10 text-emerald-300/60" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-md">{item.category || "News"}</span>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {formatISTDate(item.createdAt)}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{item.excerpt || item.description}</p>
                          </CardContent>
                        </div>
                        <div className="p-5 pt-0">
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                            Verified Campus Event <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 animate-pulse space-y-3">
                      <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : displayEvents.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Upcoming Events</h3>
                  <p className="text-xs text-slate-500 mt-1">There are no upcoming scheduled events at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayEvents.map((event: any, i: number) => {
                    const evtDate = new Date(event.eventDate || event.createdAt || 0);
                    return (
                      <motion.div key={event.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all h-full border border-slate-200 dark:border-slate-800">
                          <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
                            {event.image ? (
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6 text-center">
                                <CalendarDays className="w-10 h-10 text-sky-300/60" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-2.5 text-center min-w-[60px] shadow-lg border border-slate-200 dark:border-slate-800">
                              <span className="block text-xl font-bold text-emerald-700 dark:text-emerald-400">{evtDate.getDate()}</span>
                              <span className="block text-[10px] uppercase font-bold text-muted-foreground">{evtDate.toLocaleString("default", { month: "short" })}</span>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{event.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="flex items-center gap-1 font-medium"><CalendarDays className="w-3.5 h-3.5 text-emerald-600" /> {formatISTDate(evtDate)}</span>
                              <span className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {event.location || "DPS Indirapuram"}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}