import "@/styles/globals.css";

export const metadata = {
  title: "Open Startup School — P01 Plataforma Gamificada",
  description: "Avaliação de Competências Empreendedoras da Open Startups School.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
