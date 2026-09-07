// Specimen stub for next/image: a plain <img>. Nothing in src imports it today.
import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean; priority?: boolean; quality?: number; placeholder?: string; unoptimized?: boolean;
};

export default function Image({ fill, priority, quality, placeholder, unoptimized, alt, ...rest }: Props) {
  void fill; void priority; void quality; void placeholder; void unoptimized;
  // A plain <img> is the whole purpose of this stub: it stands in for next/image
  // under a static render where Next's loader does not exist.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt ?? ""} {...rest} />;
}
