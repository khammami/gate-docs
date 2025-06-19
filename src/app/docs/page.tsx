import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose prose-lg dark:prose-invert prose-headings:font-headline prose-headings:text-primary prose-a:text-accent prose-code:text-accent prose-code:bg-muted prose-code:p-1 prose-code:rounded-md prose-strong:text-primary">
        <h1 className="text-4xl font-bold mb-6 text-primary">Welcome to Gatedocs</h1>
        
        <p>This is a secure documentation platform. The content you see here is accessible only to authorized users who have authenticated via GitHub.</p>

        <h2 className="text-3xl font-semibold mt-8 mb-4 text-primary">Getting Started</h2>
        <p>
          To navigate this documentation, you would typically use a sidebar or a table of contents.
          For this demonstration, we are using a single-column layout focusing on content readability, inspired by Material for MkDocs.
        </p>
        <p>
          Key features of this platform include:
        </p>
        <ul>
          <li>GitHub Authentication via Firebase.</li>
          <li>Role-based access control (only authorized users).</li>
          <li>Content displayed in a clean, readable format.</li>
        </ul>

        <h2 className="text-3xl font-semibold mt-8 mb-4 text-primary">Example Code Block</h2>
        <p>Here's how you might see a code block styled:</p>
        <pre><code className="language-javascript bg-gray-800 text-white p-4 rounded-md block overflow-x-auto">{`
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('Authorized User');
        `}</code></pre>
        <p>The styling aims for clarity and ease of reading, similar to what you'd expect from a Material Design themed documentation site.</p>

        <h2 className="text-3xl font-semibold mt-8 mb-4 text-primary">Further Information</h2>
        <p>
          This page is a placeholder to demonstrate the gated content area. In a real "Material for MkDocs" setup, this content would be generated from Markdown files and could include complex layouts, navigation, search, and theming options.
        </p>
        <p>
          Explore the UI elements, notice the fonts and colors. The primary color is <span className="text-primary font-semibold">Dark Slate Blue</span>, the accent color for interactive elements is <span className="text-accent font-semibold">Coral</span>, and the background is a <span className="text-gray-600">Light Gray</span> for legibility.
        </p>
      </article>

      <Card className="mt-12 bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">About This Document</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-card-foreground">
            This document serves as a sample for the Gatedocs platform.
            It demonstrates how protected content can be displayed after successful authentication and authorization.
            The visual theme is inspired by Material for MkDocs, prioritizing readability and a clean user experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
