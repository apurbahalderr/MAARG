import type { ReactNode, SVGProps } from "react";

/**
 * MAARG icon system — consistent Lucide-style stroke icons on a 24 grid.
 * All icons inherit `currentColor` and scale with `size`. Decorative by
 * default (aria-hidden); pass `title` + role="img" via props for meaning.
 */
export type IconName =
  | "menu"
  | "close"
  | "arrowRight"
  | "arrowUpRight"
  | "chevronDown"
  | "chevronUp"
  | "chevronRight"
  | "search"
  | "mapPin"
  | "flag"
  | "route"
  | "map"
  | "mountain"
  | "cloudRain"
  | "cone"
  | "bridge"
  | "truck"
  | "car"
  | "user"
  | "users"
  | "landmark"
  | "alertTriangle"
  | "clock"
  | "gauge"
  | "globe"
  | "signal"
  | "shieldCheck"
  | "lightbulb"
  | "check"
  | "checkCircle"
  | "camera"
  | "lock"
  | "info"
  | "phone"
  | "mail"
  | "barChart"
  | "activity"
  | "layers"
  | "navigation"
  | "droplet"
  | "wind"
  | "sun"
  | "logout";

const paths: Record<IconName, ReactNode> = {
  menu: (
    <>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  flag: (
    <>
      <path d="M5 22V4" />
      <path d="M5 4h12l-2.5 4L17 12H5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h5.5" />
    </>
  ),
  map: (
    <>
      <path d="m9 4-6 2.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13" />
      <path d="M15 6.5v13" />
    </>
  ),
  mountain: (
    <>
      <path d="M2 20h20L14.5 6l-3.3 6.4L8 8.5 2 20Z" />
    </>
  ),
  cloudRain: (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
      <path d="M8 15v5" />
      <path d="M12 17v4" />
      <path d="M16 15v5" />
    </>
  ),
  cone: (
    <>
      <path d="M12 3 6.5 20h11L12 3Z" />
      <path d="M9.3 9h5.4" />
      <path d="M8 14h8" />
      <path d="M5.5 20h13" />
    </>
  ),
  bridge: (
    <>
      <path d="M2 12h20" />
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M4 12v7" />
      <path d="M20 12v7" />
      <path d="M12 12v7" />
      <path d="M2 19h20" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6.5A1.5 1.5 0 0 1 3.5 5H13a1 1 0 0 1 1 1v10H2Z" />
      <path d="M14 8.5h3.6a1 1 0 0 1 .8.4l2.4 3.1a1 1 0 0 1 .2.6V16H14Z" />
      <circle cx="6.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
    </>
  ),
  car: (
    <>
      <path d="M5 17H3v-4l2.2-4.4A2 2 0 0 1 7 7.5h8a2 2 0 0 1 1.8 1.1L19 13l2 .5V17h-2" />
      <path d="M8.5 17h7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" />
      <path d="M17.5 21a6.5 6.5 0 0 0-2-4.7" />
    </>
  ),
  landmark: (
    <>
      <path d="M3 21h18" />
      <path d="M4 10h16" />
      <path d="M12 3 3.5 8h17L12 3Z" />
      <path d="M6 10v9" />
      <path d="M10 10v9" />
      <path d="M14 10v9" />
      <path d="M18 10v9" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17.2h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.2 2" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16l3.5-4" />
      <circle cx="12" cy="16" r="1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  signal: (
    <>
      <path d="M5 12a7 7 0 0 1 2-4.9" />
      <path d="M17 7.1A7 7 0 0 1 19 12" />
      <path d="M7.8 14.2A4 4 0 0 1 8 9" />
      <path d="M16 9a4 4 0 0 1 .2 5.2" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 13.6V21" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3 5 6v5.5c0 4.5 3.1 7.2 7 8.5 3.9-1.3 7-4 7-8.5V6l-7-3Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9.2 18h5.6" />
      <path d="M10 21.5h4" />
      <path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.8.7 1.2 1.3 1.3 2.4h5.4c.1-1.1.5-1.7 1.3-2.4A6.5 6.5 0 0 0 12 2.5Z" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.4-2h7.2L17 7h2.5A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  phone: (
    <path d="M15.5 21a13 13 0 0 1-12.5-12.5A2 2 0 0 1 5 6.4l2.2-.5a1.6 1.6 0 0 1 1.8.9l.9 2a1.6 1.6 0 0 1-.4 1.9l-1 .8a11 11 0 0 0 4 4l.8-1a1.6 1.6 0 0 1 1.9-.4l2 .9a1.6 1.6 0 0 1 .9 1.8l-.5 2.2A2 2 0 0 1 15.5 21Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  barChart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6" />
      <path d="M13 17V8" />
      <path d="M18 17v-9" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 8-6-16-3 8H2" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  navigation: <path d="M12 2 20 20l-8-4-8 4 8-18Z" />,
  droplet: <path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10Z" />,
  wind: (
    <>
      <path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 13h14a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 17h7" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
}

export default function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
