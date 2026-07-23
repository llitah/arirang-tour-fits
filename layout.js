import "./globals.css";

export const metadata = {
  title: "Arirang Looks",
  description: "Planejamento de looks para os shows — Letícia & Stella",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
