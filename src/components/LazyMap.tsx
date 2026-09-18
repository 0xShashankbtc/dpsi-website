import { trpc } from "@/providers/trpc";

export default function LazyMap() {
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const fallbackUrl =
    "https://maps.google.com/maps?q=Delhi%20Public%20School%20Indirapuram%20Ahinsa%20Khand%20Ghaziabad&t=&z=15&ie=UTF8&iwloc=&output=embed";

  const googleMapsUrl =
    siteSettings?.find((s: any) => s.key === "contact_map_url")?.value?.trim() || fallbackUrl;

  return (
    <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
      <iframe
        src={googleMapsUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="DPS Indirapuram Google Maps Location"
        className="w-full h-full"
      />
    </div>
  );
}
