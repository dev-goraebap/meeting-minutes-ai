import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div id="mm-print" className="text-body text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1
              className="text-minutes-h1 mt-6 mb-3 font-bold text-ink first:mt-0"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="text-minutes-h2 mt-5 mb-2 border-b border-divider pb-1.5 font-bold text-ink"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="text-minutes-h3 mt-4 mb-1.5 font-bold text-ink"
              {...props}
            />
          ),
          p: (props) => <p className="mb-3 leading-relaxed" {...props} />,
          ul: (props) => (
            <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />
          ),
          strong: (props) => <strong className="font-semibold" {...props} />,
          table: (props) => (
            <div className="mb-3 overflow-x-auto rounded-[var(--radius-control)] border border-border">
              <table className="w-full border-collapse text-body" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-surface-sunken" {...props} />,
          th: (props) => (
            <th
              className="border-b border-border px-3 py-2 text-left font-semibold text-ink"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border-b border-divider px-3 py-2 align-top"
              {...props}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
