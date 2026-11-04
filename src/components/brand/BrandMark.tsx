import Image from "next/image";

/** Mohammad's own logo mark (bridge + voice bars) for headers and labels. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/brand/bridgevoice-icon.png"
      alt=""
      width={size}
      height={size}
    />
  );
}
