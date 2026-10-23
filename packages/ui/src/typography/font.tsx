import localFont from "next/font/local";

export const geistSans = localFont({
    src: "./fontFiles/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
  });

export const geistMono = localFont({
    src: "./fontFiles/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
  });

export const cyberdyne = localFont({
    src: "./fontFiles/Cyberdyne.woff2",
    variable: "--font-cyberdyne",
    weight: "100 900",
  });

// EKARVO theme fonts (applied by styles/shadcn-ekarvo.css)
export const archivo = localFont({
    src: "./fontFiles/Archivo-latin-wght.woff2",
    variable: "--font-archivo",
    weight: "100 900",
  });

export const plusJakartaSans = localFont({
    src: "./fontFiles/PlusJakartaSans-latin-wght.woff2",
    variable: "--font-plus-jakarta-sans",
    weight: "200 800",
  });

export const ibmPlexMono = localFont({
    src: [
      { path: "./fontFiles/IBMPlexMono-latin-400.woff2", weight: "400" },
      { path: "./fontFiles/IBMPlexMono-latin-500.woff2", weight: "500" },
      { path: "./fontFiles/IBMPlexMono-latin-600.woff2", weight: "600" },
    ],
    variable: "--font-ibm-plex-mono",
  });
