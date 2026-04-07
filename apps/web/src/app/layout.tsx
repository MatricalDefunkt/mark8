import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark8",
  description:
    "Sell and run curated n8n workflows with RBAC, quota, and token billing.",
};

type LayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
