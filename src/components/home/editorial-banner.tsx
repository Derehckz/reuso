import Image from "next/image";
import Link from "next/link";
import { HeadingEditorial } from "@/components/ui/typography";
import { ModaCircularBadge } from "@/components/brand/moda-circular-badge";

type EditorialBannerProps = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  subtitle?: string;
};

export function EditorialBanner({
  title,
  href,
  imageSrc,
  imageAlt,
  subtitle,
}: EditorialBannerProps) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/5] overflow-hidden sm:aspect-[21/9]"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="100vw"
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-900/50 via-neutral-900/10 to-transparent transition-opacity duration-500 group-hover:from-neutral-900/60" />
      <ModaCircularBadge className="z-[30]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        {subtitle && (
          <span className="text-label-sm mb-4 text-white/80">{subtitle}</span>
        )}
        <HeadingEditorial className="text-white drop-shadow-sm">
          {title}
        </HeadingEditorial>
        <span className="text-nav mt-6 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
          Explorar →
        </span>
      </div>
    </Link>
  );
}
