import { FileText, Plus } from "lucide-react";

export default function Content() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Content
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create, review, and schedule content across brands</p>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="font-heading font-semibold text-foreground">Content Hub</h2>
          <p className="text-sm text-muted-foreground">
            Create and schedule content for your brands. Ask Jarvis to draft posts, product descriptions, or marketing emails.
          </p>
          <button className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Plus className="w-4 h-4" /> Create Content
          </button>
        </div>
      </div>
    </div>
  );
}
