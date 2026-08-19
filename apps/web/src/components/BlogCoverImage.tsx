interface Props {
  src: string;
  alt: string;
  /** Article hero is larger; card is used on the blog index. */
  variant?: "article" | "card";
  className?: string;
}

/**
 * Shows the full blog image (top and bottom included) inside a padded frame.
 * Uses contain — never cover — so banners and portraits are not cropped.
 */
export function BlogCoverImage({ src, alt, variant = "article", className = "" }: Props) {
  if (variant === "card") {
    return (
      <div
        className={`relative aspect-[16/9] w-full overflow-hidden bg-slate-100 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain object-center p-2 sm:p-3"
        />
      </div>
    );
  }

  return (
    <figure
      className={`mb-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-4 ${className}`}
    >
      <div className="flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="mx-auto block h-auto w-auto max-h-[min(70vh,560px)] max-w-full object-contain object-center"
        />
      </div>
    </figure>
  );
}
