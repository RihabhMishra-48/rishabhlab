import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { WorkspaceFile, FileTreeNode } from '../../types/pycode';
import { useAuth } from '../../context/AuthContext';
import {
  Folder,
  FolderOpen,
  FileCode,
  Copy,
  Check,
  Terminal,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Code2
} from 'lucide-react';

interface StudentWorkspaceViewerProps {
  workspace?: {
    total_files: number;
    folders: string[];
    files: WorkspaceFile[];
    file_tree: FileTreeNode[];
  };
  loading?: boolean;
}

export const StudentWorkspaceViewer: React.FC<StudentWorkspaceViewerProps> = ({
  workspace,
  loading = false,
}) => {
  const { isDarkMode } = useAuth();
  const files = workspace?.files || [];
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Initialize selected file and expand ONLY that file's folder
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const first = files[0];
      setSelectedFile(first);
      if (first.folder && first.folder !== 'root') {
        setExpandedFolders({ [first.folder]: true });
      } else {
        setExpandedFolders({});
      }
    }
  }, [files, selectedFile]);

  const handleSelectFile = (file: WorkspaceFile) => {
    setSelectedFile(file);
    if (file.folder && file.folder !== 'root') {
      setExpandedFolders((prev) => ({
        ...prev,
        [file.folder as string]: true,
      }));
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleCopy = () => {
    if (!selectedFile?.code) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && (!workspace || files.length === 0)) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4">
        <div className="w-56 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  // Empty state
  if (!workspace || workspace.total_files === 0 || files.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          No Python scripts saved in your workspace yet
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Start writing and saving algorithms, loops, and scripts on PyCode! They will automatically synchronize to your mentorship workspace here.
        </p>
        <div className="pt-2">
          <a
            href="https://pycode-student.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold shadow-sm"
          >
            <span>Open Python Sandbox</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Group files by folder
  const rootFiles = files.filter((f) => !f.folder || f.folder === 'root');
  const folderGroups: Record<string, WorkspaceFile[]> = {};
  files.forEach((f) => {
    if (f.folder && f.folder !== 'root') {
      if (!folderGroups[f.folder]) folderGroups[f.folder] = [];
      folderGroups[f.folder].push(f);
    }
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs overflow-hidden">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
            Saved Terminal Workspace ({workspace.total_files} Python Scripts)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span>VS Code Python Workspace</span>
        </div>
      </div>

      {/* 2-Column VS Code-Style Layout with Theme Gray Backgrounds */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
        {/* Left Column: File Explorer (md:col-span-4) in Clean Gray */}
        <div className="md:col-span-4 border-r border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/70 dark:bg-[#1a1a1a] space-y-1 overflow-y-auto max-h-[520px]">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            EXPLORER / WORKSPACE
          </div>

          {/* Folders — Start Collapsed, Only Selected Folder Opens */}
          {Object.entries(folderGroups).map(([folderName, folderFiles]) => {
            const isExpanded = Boolean(expandedFolders[folderName]);

            return (
              <div key={folderName} className="space-y-0.5">
                <button
                  onClick={() => toggleFolder(folderName)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                  )}
                  <span className="truncate">{folderName}</span>
                  <span className="ml-auto text-[10px] text-neutral-400">({folderFiles.length})</span>
                </button>

                {isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3">
                    {folderFiles.map((file) => {
                      const isSelected = selectedFile?.name === file.name;
                      return (
                        <button
                          key={file.name}
                          onClick={() => handleSelectFile(file)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${
                            isSelected
                              ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold border border-neutral-300 dark:border-neutral-700'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                          <span className="truncate">{file.filename || file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Root Files in Neutral Gray */}
          {rootFiles.map((file) => {
            const isSelected = selectedFile?.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => handleSelectFile(file)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${
                  isSelected
                    ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold border border-neutral-300 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{file.filename || file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Viewer with Monaco Syntax Highlighting */}
        <div className="md:col-span-8 flex flex-col bg-white dark:bg-[#1e1e1e]">
          {selectedFile ? (
            <>
              {/* File Top Bar in Warm Neutral Gray */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-[#252525]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                  <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white truncate">
                    {selectedFile.filename || selectedFile.name}
                  </span>
                  {selectedFile.folder && selectedFile.folder !== 'root' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
                      /{selectedFile.folder}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {selectedFile.last_modified && (
                    <span className="text-[10px] text-neutral-500 hidden sm:flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedFile.last_modified).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real Monaco Editor for Genuine Python Syntax Colors */}
              <div className="flex-1 min-h-[400px]">
                <Editor
                  height="450px"
                  language="python"
                  value={selectedFile.code || '# Empty file'}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    lineNumbers: 'on',
                    automaticLayout: true,
                    fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace',
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 text-xs">
              Select a file from the explorer on the left to view code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspaceViewer;
