"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import FloatingToolbar from "./FloatingToolbar";
import { zustandStore } from "../zustand/store";

const LINE_HEIGHT = "24px";
const MAX_CHARS_PER_LINE = 80;

export default function TextEditor() {
  const { note, setNote } = zustandStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(1);
  const [totalLines, setTotalLines] = useState(1);
  const [selection, setSelection] = useState<{
    range: Range | null;
    position: { top: number; left: number } | null;
  }>({ range: null, position: null });

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedNote = localStorage.getItem("note");
    if (savedNote) {
      setNote(savedNote);
      if (editorRef.current) {
        editorRef.current.innerHTML = savedNote;
      }
    }
  }, [setNote]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      localStorage.setItem("note", htmlContent);
    }
  }, [note]);

  // Sync editor content with note state
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== note) {
      // Only update if different to avoid cursor jumping
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      editorRef.current.innerHTML = note;
      if (range && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Ignore selection errors
        }
      }
    }
  }, [note]);

  // Handle text input
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const htmlContent = editorRef.current.innerHTML;
    setNote(htmlContent);
  }, [setNote]);

  // Detect text selection
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      setSelection({ range: null, position: null });
      return;
    }

    const range = selection.getRangeAt(0);
    const isSelectionInEditor = editorRef.current.contains(range.commonAncestorContainer);

    if (!isSelectionInEditor || range.collapsed) {
      setSelection({ range: null, position: null });
      return;
    }

    const rect = range.getBoundingClientRect();

    setSelection({
      range: range.cloneRange(),
      position: {
        top: rect.top + window.scrollY - 50, // Position above selection with spacing (viewport coordinates)
        left: rect.left + window.scrollX + rect.width / 2, // Center point of selection (toolbar will center itself with transform)
      },
    });
  }, []);

  // Handle selection events
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Handle mouse up for selection
  const handleMouseUp = () => {
    setTimeout(handleSelectionChange, 10);
  };

  // Handle click outside to close toolbar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!selection.range) return;

      // Check if click is inside editor
      if (editorRef.current && editorRef.current.contains(target as Node)) {
        return;
      }

      // Check if click is on toolbar (by data attribute since it's fixed positioned)
      if (target.closest('[data-toolbar="true"]')) {
        return;
      }

      // Click is outside both editor and toolbar, close toolbar
      setSelection({ range: null, position: null });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selection.range]);

  // Update active line
  const updateActiveLine = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If no selection, check cursor position at end
      const textContent = editorRef.current.textContent || "";
      const lines = textContent.split("\n");
      setActiveLine(lines.length || 1);
      return;
    }

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    // Count lines by creating a temporary range and counting block elements and br tags
    const container = document.createElement("div");
    container.appendChild(preSelectionRange.cloneContents());
    
    // Count block elements (div, p) - each represents a line
    const blockElements = container.querySelectorAll("div, p");
    
    // Count br tags
    const brCount = container.querySelectorAll("br").length;
    
    // Get text content and count newlines
    const textBeforeCursor = preSelectionRange.toString();
    const textLineCount = textBeforeCursor.split("\n").length;
    
    // Calculate line number: base 1 + block elements + br tags, or use text-based count
    const calculatedLine = Math.max(1, 1 + blockElements.length + brCount, textLineCount);
    setActiveLine(calculatedLine);
  }, []);

  // Scroll sync
  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  // Helper function to find code span parent
  const findCodeSpan = (node: Node | null): HTMLElement | null => {
    if (!editorRef.current) return null;
    let element = node;
    while (element && element !== editorRef.current) {
      if (element instanceof HTMLSpanElement) {
        const computedStyle = window.getComputedStyle(element);
        const bgColor = computedStyle.backgroundColor;
        const fontFamily = computedStyle.fontFamily.toLowerCase();
        
        const bgMatch = bgColor.match(/\d+/g);
        if (bgMatch && bgMatch.length >= 3) {
          const r = parseInt(bgMatch[0]);
          const g = parseInt(bgMatch[1]);
          const b = parseInt(bgMatch[2]);
          if (r >= 50 && r <= 60 && g >= 60 && g <= 70 && b >= 75 && b <= 85) {
            if (fontFamily.includes("monospace")) {
              return element;
            }
          }
        }
      }
      element = element.parentElement;
    }
    return null;
  };

  // Helper function to check if selection is already formatted as code
  const isCodeFormatted = (range: Range): boolean => {
    let element: Node | null = range.startContainer;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }
    return !!findCodeSpan(element);
  };

  // Helper function to check if selection is already a link
  const isLinkFormatted = (range: Range): boolean => {
    const container = range.commonAncestorContainer;
    let element: Node | null = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    while (element && element !== editorRef.current) {
      if (element instanceof HTMLAnchorElement) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  };

  // Helper function to remove formatting and convert to plain text
  const removeFormatting = (range: Range): string => {
    const fragment = range.cloneContents();
    const div = document.createElement("div");
    div.appendChild(fragment);
    return div.innerText || div.textContent || "";
  };
  

  // Apply formatting
  const handleFormat = useCallback(
    (format: "bold" | "italic" | "underline" | "code" | "link" | "revert") => {
      if (!selection.range || !editorRef.current) return;

      const windowSelection = window.getSelection();
      if (!windowSelection) return;

      // Restore the saved range
      try {
        windowSelection.removeAllRanges();
        windowSelection.addRange(selection.range);
      } catch (e) {
        // If range is invalid, try to get current selection
        if (windowSelection.rangeCount === 0) return;
      }

      const range = windowSelection.rangeCount > 0 
        ? windowSelection.getRangeAt(0) 
        : selection.range;

        if (format === "revert") {
          const plainText = removeFormatting(range);
          const wasCodeFormatted = isCodeFormatted(range);
          
          // First try standard remove format
          document.execCommand("removeFormat", false);
          document.execCommand("unlink", false);

          if (wasCodeFormatted) {
            // Handle custom code blocks
            // We manually replace the content to ensure we break out of code spans
            
            // Get the updated range after execCommand as the DOM may have changed
            const updatedRange = windowSelection.rangeCount > 0 ? windowSelection.getRangeAt(0) : range;

            updatedRange.deleteContents();
            const textNode = document.createTextNode(plainText);
            updatedRange.insertNode(textNode);
            updatedRange.selectNode(textNode);

            const codeSpan = findCodeSpan(textNode.parentElement);
            if (codeSpan && codeSpan.parentElement) {
              const parent = codeSpan.parentElement;
              const beforeSpan = codeSpan.cloneNode(false) as HTMLElement;
              const afterSpan = codeSpan.cloneNode(false) as HTMLElement;

              // Move nodes before textNode to beforeSpan
              while (codeSpan.firstChild && codeSpan.firstChild !== textNode) {
                beforeSpan.appendChild(codeSpan.firstChild);
              }

              // Remove textNode from codeSpan (it's currently the firstChild after the loop)
              if (codeSpan.contains(textNode)) {
                codeSpan.removeChild(textNode);
              }

              // Move remaining nodes to afterSpan
              while (codeSpan.firstChild) {
                afterSpan.appendChild(codeSpan.firstChild);
              }

              // Insert beforeSpan if it has content
              if (beforeSpan.textContent) {
                parent.insertBefore(beforeSpan, codeSpan);
              }

              // Insert the textNode
              parent.insertBefore(textNode, codeSpan);

              // Insert afterSpan if it has content
              if (afterSpan.textContent) {
                parent.insertBefore(afterSpan, codeSpan);
              }

              // Remove the empty original span
              parent.removeChild(codeSpan);

              // Restore selection
              range.selectNodeContents(textNode);
            }
          }
        }
         else if (format === "bold") {
        document.execCommand("bold", false);
      } else if (format === "italic") {
        document.execCommand("italic", false);
      } else if (format === "underline") {
        document.execCommand("underline", false);
      } else if (format === "code") {
        // Toggle code formatting
        if (isCodeFormatted(range)) {
          // Remove code formatting - convert to plain text
          const plainText = removeFormatting(range);
          range.deleteContents();
          const textNode = document.createTextNode(plainText);
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
        } else {
          // Apply code formatting
          const selectedText = range.toString();
          const codeSpan = document.createElement("span");
          codeSpan.style.backgroundColor = "#374151"; // darker grey for better contrast
          codeSpan.style.color = "#fbbf24"; // amber-400
          codeSpan.style.padding = "2px 4px";
          codeSpan.style.borderRadius = "4px";
          codeSpan.style.fontFamily = "monospace";
          codeSpan.textContent = selectedText;
          
          range.deleteContents();
          range.insertNode(codeSpan);
        }
      } else if (format === "link") {
        // Toggle link formatting
        if (isLinkFormatted(range)) {
          // Remove link formatting - convert to plain text
          const plainText = removeFormatting(range);
          range.deleteContents();
          const textNode = document.createTextNode(plainText);
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
        } else {
          // Apply link formatting
          const url = prompt("Enter URL:");
          if (url) {
            const selectedText = range.toString();
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.style.color = "#3b82f6"; // blue-500
            link.style.textDecoration = "underline";
            link.textContent = selectedText;
            
            range.deleteContents();
            range.insertNode(link);
          }
        }
      }

      // Update note state
      if (editorRef.current) {
        setNote(editorRef.current.innerHTML);
      }

      // Clear selection
      setSelection({ range: null, position: null });
      windowSelection.removeAllRanges();
    },
    [selection.range, setNote]
  );

  // Update total lines when content changes
  // Count lines using Range API to get accurate visual line count
  const updateLineCount = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      
      // Get all line-height sized rectangles in the range
      const rects = range.getClientRects();
      const lineHeight = parseInt(LINE_HEIGHT);
      
      if (rects.length > 0) {
        // Count distinct vertical positions (lines)
        const uniqueLines = new Set<number>();
        Array.from(rects).forEach((rect) => {
          // Round to nearest line height to group by line
          const lineIndex = Math.round(rect.top / lineHeight);
          uniqueLines.add(lineIndex);
        });
        setTotalLines(Math.max(1, uniqueLines.size || 1));
      } else {
        // Fallback: count by HTML structure
        const html = editorRef.current.innerHTML;
        const brCount = (html.match(/<br\s*\/?>/gi) || []).length;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const blockCount = tempDiv.querySelectorAll("div, p").length;
        const textContent = editorRef.current.textContent || "";
        const textLines = textContent ? textContent.split("\n").length : 1;
        setTotalLines(Math.max(1, brCount + Math.max(blockCount, textLines)));
      }
    } catch (e) {
      // Fallback to simple text-based count
      const textContent = editorRef.current.textContent || "";
      setTotalLines(Math.max(1, textContent.split("\n").length));
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(updateLineCount, 0);
    return () => clearTimeout(timeoutId);
  }, [note, updateLineCount]);

  return (
    <>
      <div className="w-full max-w-5xl h-[84vh] flex rounded-lg overflow-hidden bg-black">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-[60px] overflow-y-scroll scrollbar-none select-none font-mono text-sm"
        >
          <div className="py-4 px-3">
            {Array.from({ length: totalLines }, (_, i) => i + 1).map(
              (lineNum) => (
                <div
                  key={lineNum}
                  className={`flex items-center justify-end pr-1 ${
                    lineNum === activeLine ? "text-white" : "text-gray-500"
                  }`}
                  style={{ height: LINE_HEIGHT }}
                >
                  {lineNum}
                </div>
              )
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={updateActiveLine}
            onClick={updateActiveLine}
            onMouseUp={handleMouseUp}
            onScroll={handleScroll}
            data-placeholder="Start typing..."
            className="
              w-full h-full
              font-mono text-sm
              bg-black text-white
              focus:outline-none
              overflow-y-scroll
              scrollbar-none
              whitespace-pre-wrap
              py-4 px-4
            "
            style={{
              lineHeight: LINE_HEIGHT,
            }}
          />

      {/* Floating Toolbar */}
      {selection.position && selection.range && (
        <FloatingToolbar
          position={selection.position}
          onFormat={handleFormat}
          onClose={() => setSelection({ range: null, position: null })}
        />
      )}
        </div>
      </div>
    </>
  );
}

