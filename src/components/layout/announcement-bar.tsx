import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  return (
    <div
      className="bg-brand-green text-white"
      role="region"
      aria-label="Promociones"
    >
      <Container className="flex min-h-9 items-center justify-center py-2">
        <p className="text-center text-label-sm text-white/95">
          {siteConfig.announcement.join("  ·  ")}
        </p>
      </Container>
    </div>
  );
}
