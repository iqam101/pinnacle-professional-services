import React from "react";
import { sanitizeNoEmDash } from "@/lib/constants";

function renderInline(text: string): React.ReactNode[] {
  const clean = sanitizeNoEmDash(text);
  const tokens = clean.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={idx}>{token.slice(2, -2)}</strong>;
    }
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isExternal = href.startsWith("http");
      return (
        <a
          key={idx}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {label}
        </a>
      );
    }
    return token;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = sanitizeNoEmDash(content).split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${keyCounter++}`}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={`h3-${keyCounter++}`}>{renderInline(line.slice(4))}</h3>);
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={`h2-${keyCounter++}`}>{renderInline(line.slice(3))}</h2>);
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      blocks.push(<h2 key={`h1-${keyCounter++}`}>{renderInline(line.slice(2))}</h2>);
      continue;
    }

    if (line.startsWith("> ")) {
      flushList();
      blocks.push(
        <blockquote key={`bq-${keyCounter++}`}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    blocks.push(<p key={`p-${keyCounter++}`}>{renderInline(line)}</p>);
  }

  flushList();

  return <div className="article-prose">{blocks}</div>;
}
