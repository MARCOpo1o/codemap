import { toKebabCase } from "./naming";
import type { ScaffoldFile, ScreenSpec } from "./types";

export function generatePackageJson(projectName: string): ScaffoldFile {
  const pkg = {
    name: toKebabCase(projectName),
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: {
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      typescript: "^5",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
    },
  };
  return { path: "package.json", contents: `${JSON.stringify(pkg, null, 2)}\n` };
}

export function generateTsConfig(): ScaffoldFile {
  const config = {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  };
  return { path: "tsconfig.json", contents: `${JSON.stringify(config, null, 2)}\n` };
}

export function generateNextConfig(): ScaffoldFile {
  return {
    path: "next.config.mjs",
    contents: "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\n\nexport default nextConfig;\n",
  };
}

export function generateGlobalsCss(): ScaffoldFile {
  const contents = `:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #111;
  background: #fff;
}

main {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}

nav {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ddd;
  background: #fff;
}

a {
  color: #2563eb;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

input {
  padding: 8px;
  font-size: 14px;
}

.new-link {
  display: inline-block;
  margin: 12px 0;
}
`;
  return { path: "app/globals.css", contents };
}

/** Top-level, non-dynamic, non-form routes make sense as nav links — "Create X" screens are reached from a list page's "+ New" link instead. */
function navLinksFor(screens: ScreenSpec[]): ScreenSpec[] {
  return screens.filter(
    (screen) =>
      screen.routePath !== "/" &&
      !screen.routePath.includes("[") &&
      !screen.name.toLowerCase().startsWith("create ")
  );
}

export function generateLayout(projectName: string, screens: ScreenSpec[]): ScaffoldFile {
  const links = navLinksFor(screens)
    .map((screen) => `          <a href="${screen.routePath}">${screen.name}</a>`)
    .join("\n");

  const contents = `import "./globals.css";

export const metadata = {
  title: "${projectName}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/">Home</a>
${links}
        </nav>
        {children}
      </body>
    </html>
  );
}
`;
  return { path: "app/layout.tsx", contents };
}
