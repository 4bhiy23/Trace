import { syntaxTree } from "@codemirror/language";
import {
  RangeSet,
  StateField,
  type EditorState,
  type Range,
} from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

const inlineTags: Record<string, string> = {
  Emphasis: "em",
  StrongEmphasis: "strong",
  Strikethrough: "s",
  InlineCode: "code",
};

const inlineMarkers = new Set([
  "EmphasisMark",
  "StrikethroughMark",
  "CodeMark",
]);
const hidden = Decoration.replace({});

function safeHref(source: string) {
  try {
    const url = new URL(source.replace(/^<|>$/g, ""), window.location.href);
    if (["http:", "https:", "mailto:"].includes(url.protocol)) return url.href;
  } catch {
    // Keep malformed links as text.
  }
}

function configureLink(link: HTMLAnchorElement, href: string) {
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

class TaskCheckbox extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly readOnly: boolean,
  ) {
    super();
  }

  eq(other: TaskCheckbox) {
    return this.checked === other.checked && this.readOnly === other.readOnly;
  }

  toDOM(view: EditorView) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "cm-md-checkbox";
    input.checked = this.checked;
    input.disabled = this.readOnly;
    input.setAttribute("aria-label", "Toggle task");
    input.addEventListener("change", () => {
      const from = view.posAtDOM(input);
      view.dispatch({
        changes: { from, to: from + 3, insert: input.checked ? "[x]" : "[ ]" },
      });
    });
    return input;
  }
}

class ListBullet extends WidgetType {
  toDOM() {
    const bullet = document.createElement("span");
    bullet.className = "cm-md-bullet";
    bullet.textContent = "•";
    return bullet;
  }
}

function previewBlock(view: EditorView, offset: number, indent: number) {
  const block = document.createElement("div");
  block.className = "cm-md-block";
  if (indent) block.style.marginInlineStart = `${indent}ch`;
  if (!view.state.readOnly) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cm-md-edit-source";
    button.textContent = "Edit source";
    button.addEventListener("click", () => {
      const anchor = view.posAtDOM(block) + offset;
      view.dispatch({ selection: { anchor }, scrollIntoView: true });
      view.focus();
    });
    block.append(button);
  }
  return block;
}

let mermaidId = 0;
const loadMermaid = () =>
  import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      suppressErrorRendering: true,
    });
    return mermaid;
  });
let mermaidModule: ReturnType<typeof loadMermaid> | undefined;

class CodeBlock extends WidgetType {
  constructor(
    readonly source: string,
    readonly language: string,
    readonly offset: number,
    readonly indent: number,
  ) {
    super();
  }

  eq(other: CodeBlock) {
    return (
      this.source === other.source &&
      this.language === other.language &&
      this.offset === other.offset &&
      this.indent === other.indent
    );
  }

  toDOM(view: EditorView) {
    const block = previewBlock(view, this.offset, this.indent);
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = this.source || " ";
    pre.append(code);
    if (this.language !== "mermaid") {
      block.append(pre);
      return block;
    }

    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = "Rendering diagram…";
    block.append(status);

    void (async () => {
      try {
        mermaidModule ??= loadMermaid().catch((error: unknown) => {
          mermaidModule = undefined;
          throw error;
        });
        const mermaid = await mermaidModule;
        if (!block.isConnected) return;
        const { svg } = await mermaid.render(
          `trace-mermaid-${++mermaidId}`,
          this.source,
        );
        if (!block.isConnected) return;
        const image = document.createElement("img");
        image.alt = "Mermaid diagram";
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        status.replaceWith(image);
      } catch (error) {
        status.className = "cm-md-diagram-error";
        status.textContent =
          error instanceof Error
            ? `Mermaid: ${error.message}`
            : "Could not render the Mermaid diagram.";
        block.append(pre);
      }
    })();
    return block;
  }
}

function appendCellContent(
  target: HTMLElement,
  cell: SyntaxNode,
  state: EditorState,
) {
  let position = cell.from;
  for (let child = cell.firstChild; child; child = child.nextSibling) {
    target.append(state.sliceDoc(position, child.from));
    const tag = inlineTags[child.name];
    if (tag) {
      const inner = document.createElement(tag);
      appendCellContent(inner, child, state);
      target.append(inner);
    } else if (child.name === "Link" && child.getChild("URL")) {
      const labelStart = child.getChild("LinkMark")!.to;
      const labelEnd = child.getChildren("LinkMark")[1].from;
      const url = child.getChild("URL")!;
      const href = safeHref(state.sliceDoc(url.from, url.to));
      const label = state.sliceDoc(labelStart, labelEnd);
      if (href) {
        const link = document.createElement("a");
        configureLink(link, href);
        link.textContent = label;
        target.append(link);
      } else {
        target.append(label);
      }
    } else if (!inlineMarkers.has(child.name)) {
      target.append(state.sliceDoc(child.from, child.to));
    }
    position = child.to;
  }
  target.append(state.sliceDoc(position, cell.to));
}

class MarkdownTable extends WidgetType {
  constructor(
    readonly source: string,
    readonly node: SyntaxNode,
    readonly indent: number,
  ) {
    super();
  }

  eq(other: MarkdownTable) {
    return (
      this.source === other.source &&
      this.node.from === other.node.from &&
      this.indent === other.indent
    );
  }

  toDOM(view: EditorView) {
    const block = previewBlock(view, this.indent, this.indent);
    const wrapper = document.createElement("div");
    wrapper.className = "cm-md-table";
    const table = document.createElement("table");
    const header = this.node.getChild("TableHeader");
    if (!header) return block;

    const delimiter = this.node.getChild("TableDelimiter");
    const alignment = delimiter
      ? view.state
          .sliceDoc(delimiter.from, delimiter.to)
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
      : [];
    const body = table.createTBody();
    const headerCells = header.getChildren("TableCell");
    for (const row of [header, ...this.node.getChildren("TableRow")]) {
      const isHeader = row === header;
      const tr = isHeader ? table.createTHead().insertRow() : body.insertRow();
      const cells = row.getChildren("TableCell");
      for (let column = 0; column < headerCells.length; column++) {
        const cell = document.createElement(isHeader ? "th" : "td");
        const align = alignment[column]?.trim();
        if (align?.endsWith(":"))
          cell.style.textAlign = align.startsWith(":") ? "center" : "right";
        const value = cells[column];
        if (value) appendCellContent(cell, value, view.state);
        tr.append(cell);
      }
    }

    wrapper.append(table);
    block.append(wrapper);
    return block;
  }
}

function decorations(state: EditorState) {
  const ranges: Range<Decoration>[] = [];
  const active = (from: number, to: number) =>
    !state.readOnly &&
    state.selection.ranges.some(
      (range) =>
        range.from <= state.doc.lineAt(to).to &&
        range.to >= state.doc.lineAt(from).from,
    );

  const tree = syntaxTree(state);
  const normalizedLabel = (label: string) =>
    label.trim().replace(/\s+/g, " ").toLowerCase();
  let references: Map<string, string> | undefined;
  const referenceUrl = (label: string) => {
    if (!references) {
      const byLabel = new Map<string, string>();
      tree.iterate({
        enter({ node, name }) {
          if (name !== "LinkReference") return;
          const label = node.getChild("LinkLabel");
          const url = node.getChild("URL");
          if (label && url) {
            const key = normalizedLabel(
              state.sliceDoc(label.from + 1, label.to - 1),
            );
            if (!byLabel.has(key))
              byLabel.set(key, state.sliceDoc(url.from, url.to));
          }
        },
      });
      references = byLabel;
    }
    return references.get(normalizedLabel(label));
  };

  tree.iterate({
    enter({ node, name, from, to }) {
      if (name === "FencedCode" || name === "CodeBlock" || name === "Table") {
        if (active(from, to)) return false;
        const firstLine = state.doc.lineAt(from);
        const lastLine = state.doc.lineAt(to);
        const indent = from - firstLine.from;

        const info = node.getChild("CodeInfo");
        const language = info
          ? state
              .sliceDoc(info.from, info.to)
              .trim()
              .split(/\s+/)[0]
              .toLowerCase()
          : "";
        const code = node.getChildren("CodeText");
        const widget =
          name === "Table"
            ? new MarkdownTable(state.sliceDoc(from, to), node, indent)
            : new CodeBlock(
                code.map((part) => state.sliceDoc(part.from, part.to)).join(""),
                language,
                (code[0]?.from ?? from) - firstLine.from,
                indent,
              );
        ranges.push(
          Decoration.replace({ block: true, widget }).range(
            firstLine.from,
            lastLine.to,
          ),
        );
        return false;
      }

      if (active(from, to)) return;

      const heading = /^(ATX|Setext)Heading([1-6])$/.exec(name);
      if (heading) {
        ranges.push(
          Decoration.line({
            class: `cm-md-h${heading[2]}`,
            attributes: { role: "heading", "aria-level": heading[2] },
          }).range(state.doc.lineAt(from).from),
        );
        for (const marker of node.getChildren("HeaderMark")) {
          const line = state.doc.lineAt(marker.from);
          if (heading[1] === "Setext") {
            ranges.push(
              Decoration.line({ class: "cm-md-setext-marker" }).range(
                line.from,
              ),
            );
            ranges.push(hidden.range(marker.from, marker.to));
          } else {
            const end =
              marker.from === from
                ? marker.to +
                  (state.sliceDoc(marker.to, to).match(/^\s*/)?.[0].length ?? 0)
                : marker.to;
            ranges.push(hidden.range(marker.from, end));
          }
        }
        return;
      }

      const tagName = inlineTags[name];
      if (tagName) {
        ranges.push(Decoration.mark({ tagName }).range(from, to));
        for (const marker of node.getChildren(
          `${name === "InlineCode" ? "Code" : name === "Strikethrough" ? "Strikethrough" : "Emphasis"}Mark`,
        )) {
          ranges.push(hidden.range(marker.from, marker.to));
        }
      } else if (name === "TaskMarker") {
        ranges.push(
          Decoration.replace({
            widget: new TaskCheckbox(
              state.sliceDoc(from + 1, from + 2).toLowerCase() === "x",
              state.readOnly,
            ),
          }).range(from, to),
        );
      } else if (
        name === "ListMark" &&
        node.parent?.parent?.name === "BulletList"
      ) {
        if (node.nextSibling?.name === "Task") {
          ranges.push(hidden.range(from, node.nextSibling.from));
        } else {
          ranges.push(
            Decoration.replace({ widget: new ListBullet() }).range(from, to),
          );
        }
      } else if (
        name === "Link" ||
        name === "Autolink" ||
        (name === "URL" &&
          [
            "Paragraph",
            "TableCell",
            "Emphasis",
            "StrongEmphasis",
            "Strikethrough",
          ].includes(node.parent?.name ?? ""))
      ) {
        const url = name === "URL" ? node : node.getChild("URL");
        const marks = node.getChildren("LinkMark");
        const start = marks[0]?.to ?? from;
        const end = marks[1]?.from ?? to;
        const label = node.getChild("LinkLabel");
        let destination = url
          ? state.sliceDoc(url.from, url.to)
          : referenceUrl(
              label && label.to - label.from > 2
                ? state.sliceDoc(label.from + 1, label.to - 1)
                : state.sliceDoc(start, end),
            );
        if (destination === undefined) return;
        if (name !== "Link") {
          if (destination.startsWith("www."))
            destination = `https://${destination}`;
          else if (/^[^:/\s]+@[^:/\s]+$/.test(destination))
            destination = `mailto:${destination}`;
        }
        const href = safeHref(destination);
        if (end > start) {
          ranges.push(
            Decoration.mark(
              href
                ? {
                    tagName: "a",
                    class: "cm-md-link",
                    attributes: {
                      href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                  }
                : { class: "cm-md-link" },
            ).range(start, end),
          );
        }
        if (start > from) ranges.push(hidden.range(from, start));
        if (end < to) ranges.push(hidden.range(end, to));
      }
    },
  });

  return RangeSet.of(ranges, true);
}

export const markdownPreview = [
  StateField.define({
    create: decorations,
    update(value, transaction) {
      return transaction.docChanged ||
        transaction.selection ||
        syntaxTree(transaction.startState) !== syntaxTree(transaction.state)
        ? decorations(transaction.state)
        : value;
    },
    provide: (field) => EditorView.decorations.from(field),
  }),
  EditorView.domEventHandlers({
    mousedown(event) {
      // Keep the preview link in the DOM through its click.
      if (
        event.target instanceof Element &&
        event.target.closest("a.cm-md-link")
      ) {
        event.preventDefault();
        return true;
      }
      return false;
    },
  }),
];
