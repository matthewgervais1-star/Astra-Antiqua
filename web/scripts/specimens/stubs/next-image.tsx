// Specimen stub for next/image: a plain <img>. Nothing in src imports it today.
import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean; priority?: boolean; quality?: number; placeholder?: string; unoptimized?: boolean;
};

export default function Image({ fill, priority, quality, placeholder, unoptimized, alt, ...rest }: Props) {
  void fill; void priority; void quality; void placeholder; void unoptimized;
  return <img alt={alt ?? ""} {...rest} />;
}
