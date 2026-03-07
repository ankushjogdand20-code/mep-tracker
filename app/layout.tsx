import "./globals.css";

export const metadata = {
  title: "MEP Executive Command Center",
  description: "Rustomjee MEP Monitoring Platform"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}