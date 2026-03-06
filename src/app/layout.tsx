import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AutoCarousel V3",
    description: "Transform text to professional carousels",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
