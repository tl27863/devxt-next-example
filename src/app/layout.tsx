import "./globals.css";
import "devextreme/dist/css/dx.common.css";
import "../themes/generated/theme.base.dark.css";
import "../themes/generated/theme.base.css";
import "../themes/generated/theme.additional.dark.css";
import "../themes/generated/theme.additional.css";
import "../dx-styles.scss";
import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/theme";

export default function RootLayout({ children }: PropsWithChildren<object>) {
  return (
    <html lang="en">
      <title>App Name</title>
      <body className="dx-viewport">
        <ThemeProvider>
          <div className="app">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
