"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [tree, setTree] = useState("");

  useEffect(() => {
    const code = `import { Highlight } from '../highlight/Highlight'
import type { editorChange, line, state } from '../../../types'

function getUpdatedLine(line: line, language: string, content: string): line {
  const id = line.id
  const formatted = Highlight.get(content, language)
  const length = content.length
  return { id, content, formatted, length }
}

function getNewLine(nextLineId: number, language: string, content: string = ''): line {
  const id = nextLineId
  const formatted = Highlight.get(content, language)
  const length = content.length
  return { id, content, formatted, length }
}

function insert(state: state, char: string): editorChange {
  const { lines, cursor, language } = state.editor
  const line = lines[cursor.row]
  const before = line.content.slice(0, cursor.col)
  const after = line.content.slice(cursor.col)
  const content = before + char + after
  lines[cursor.row] = getUpdatedLine(line, language, content)
  const { row } = cursor
  const col = cursor.col + 1
  const change = {
    lines,
    cursor: { row, col }
  }
  return change
}

function insertNewLine(state: state): editorChange {
  const { lines, cursor, language } = state.editor
  const line = lines[cursor.row]
  const before = line.content.slice(0, cursor.col)
  lines[cursor.row] = getUpdatedLine(line, language, before)
  const after = line.content.slice(cursor.col)
  const newLine = getNewLine(state.editor.nextLineId, language, after)
  lines.splice(cursor.row + 1, 0, newLine)
  const row = cursor.row + 1
  const col = 0
  const nextLineId = newLine.id + 1
  const change = {
    lines,
    cursor: { row, col },
    nextLineId
  }
  return change
}

function newLine(state: state): editorChange {
  const { lines, cursor, language } = state.editor
  const newLine = getNewLine(state.editor.nextLineId, language)
  lines.splice(cursor.row + 1, 0, newLine)
  const row = cursor.row + 1
  const col = 0
  const nextLineId = newLine.id + 1
  const change = {
    lines,
    cursor: { row, col },
    nextLineId
  }
  return change
}

function backspace(state: state): editorChange {
  const { lines, cursor, language } = state.editor
  if (cursor.col > 0) {
    const line = lines[cursor.row]
    const content = line.content.slice(0, cursor.col - 1) + line.content.slice(cursor.col)
    lines[cursor.row] = getUpdatedLine(line, language, content)
    const { row } = cursor
    const col = cursor.col - 1
    const change = {
      lines,
      cursor: { row, col }
    }
    return change
  } else if (cursor.row > 0) {
    const previousLine = lines[cursor.row - 1]
    const currentLine = lines[cursor.row]
    const content = previousLine.content + currentLine.content
    lines[cursor.row - 1] = getUpdatedLine(previousLine, language, content)
    lines.splice(cursor.row, 1)
    const row = cursor.row - 1
    const col = previousLine.length
    const change = {
      lines,
      cursor: { row, col }
    }
    return change
  }
}

function deleteCharacter(state: state): editorChange {
  const { lines, cursor, language } = state.editor
  const line = lines[cursor.row]
  const content = line.content.slice(0, cursor.col) + line.content.slice(cursor.col + 1)
  lines[cursor.row] = getUpdatedLine(line, language, content)
  return { lines }
}

function deleteLine(state: state): editorChange {
  const { lines, cursor } = state.editor
  lines.splice(cursor.row, 1)
  return { lines }
}

function copyLine(state: state): editorChange {
  const { lines, cursor } = state.editor
  const line = lines[cursor.row]
  const clipboard = line.content
  return { clipboard }
}

function pasteLine(state: state): editorChange {
  const { lines, cursor, clipboard, language } = state.editor
  const newLine = getNewLine(state.editor.nextLineId, language, clipboard)
  lines.splice(cursor.row + 1, 0, newLine)
  const row = cursor.row + 1
  const { col } = cursor
  const nextLineId = newLine.id + 1
  return {
    lines,
    cursor: { row, col },
    nextLineId
  }
}

export const Edit = {
  insert,
  insertNewLine,
  newLine,
  backspace,
  deleteCharacter,
  deleteLine,
  copyLine,
  pasteLine
}
`;
    console.time("parse");
    fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => setTree(data.tree))
      .catch((err) => {
        console.error("API error:", err);
        setTree("Failed to parse code.");
      });
    console.timeEnd("parse");
  }, []);

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Tree-sitter Parse Tree</h1>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {tree}
      </pre>
    </main>
  );
}
