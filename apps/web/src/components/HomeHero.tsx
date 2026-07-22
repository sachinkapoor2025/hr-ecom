import Image from "next/image";
import Link from "next/link";
import type { HomeBanner } from "@/components/BannerCarousel";
import { BannerCarousel } from "@/components/BannerCarousel";

/**
 * Server component wrapper: first banner image is rendered on the server and
 * passed into the client carousel as a slot. Carousel JS still owns autoplay /
 * dots / later slides — it must not gate the LCP <img> behind hydration.
 */
export function HomeHero({ banners }: { banners: readonly HomeBanner[] }) {
  const first = banners[0];
  if (!first) return null;

  const lcpImage = first.href ? (
    <Link href={first.href} className="block h-full w-full">
      <Image
        src={first.src}
        alt={first.alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1023px) 100vw, 768px"
        priority
        fetchPriority="high"
      />
    </Link>
  ) : (
    <Image
      src={first.src}
      alt={first.alt}
      fill
      className="object-cover object-center"
      sizes="(max-width: 1023px) 100vw, 768px"
      priority
      fetchPriority="high"
    />
  );

  return <BannerCarousel banners={banners} lcpImage={lcpImage} />;
}
