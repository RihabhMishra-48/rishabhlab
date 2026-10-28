import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { WorkspaceFile, FileTreeNode } from '../../types/pycode';
import { STARTER_PYTHON_WORKSPACE } from '../../data/starterPythonWorkspace';
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
  Code2,
  Share2,
  Link as LinkIcon,
  MessageCircle,
  MoreVertical,
  Sparkles,
  Search
} from 'lucide-react';

interface StudentWorkspaceViewerProps {
  workspace?: {
    total_files: number;
    folders: string[];
    folder_details?: Array<{
      name: string;
      files_count: number;
      open_editor_url?: string;
      share_url?: string;
    }>;
    files: WorkspaceFile[];
    file_tree: FileTreeNode[];
  };
  loading?: boolean;
}

// WhatsApp brand SVG icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-emerald-500' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.33 7.34 9 7.42 8.76 7.68C8.5 7.94 7.84 8.56 7.84 9.83C7.84 11.1 8.77 12.33 8.9 12.5C9.03 12.67 10.73 15.3 13.33 16.42C13.95 16.69 14.43 16.85 14.81 16.97C15.43 17.17 16 17.14 16.44 17.07C16.94 17 17.98 16.44 18.2 15.82C18.42 15.2 18.42 14.67 18.35 14.56C18.29 14.45 18.12 14.38 17.86 14.25C17.6 14.12 16.3 13.48 16.06 13.39C15.82 13.3 15.65 13.26 15.48 13.52C15.31 13.78 14.83 14.35 14.68 14.52C14.54 14.7 14.39 14.72 14.13 14.59C13.87 14.46 12.78 14.1 11.49 12.95C10.48 12.05 9.8 10.94 9.67 10.72C9.54 10.5 9.66 10.38 9.79 10.25C9.9 10.14 10.04 9.96 10.17 9.81C10.3 9.66 10.34 9.55 10.43 9.38C10.52 9.2 10.48 9.05 10.41 8.92C10.35 8.79 9.83 7.5 9.61 7C9.4 6.5 9.18 6.57 9.03 6.56L8.53 6.55L9.53 7.34Z" />
  </svg>
);

export const StudentWorkspaceViewer: React.FC<StudentWorkspaceViewerProps> = ({
  workspace,
  loading = false,
}) => {
  const { isDarkMode } = useAuth();
  const [localWorkspace, setLocalWorkspace] = useState<any>(null);
  const [importNotice, setImportNotice] = useState(false);
  const [fileSearch, setFileSearch] = useState('');

  // Use local override, or props workspace if non-empty, or fallback to STARTER_PYTHON_WORKSPACE
  const effectiveWorkspace = useMemo(() => {
    if (localWorkspace) return localWorkspace;
    if (workspace && workspace.files && workspace.files.length > 0) return workspace;
    return STARTER_PYTHON_WORKSPACE;
  }, [localWorkspace, workspace]);

  const files = effectiveWorkspace?.files || [];
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ DSA: true, visualisations: false, algorithms: false });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFileLink, setCopiedFileLink] = useState(false);
  const [copiedFolderLink, setCopiedFolderLink] = useState(false);

  // Dropdown states
  const [fileShareOpen, setFileShareOpen] = useState(false);
  const [folderShareOpen, setFolderShareOpen] = useState<string | null>(null);

  const fileShareRef = useRef<HTMLDivElement>(null);
  const folderShareRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileShareRef.current && !fileShareRef.current.contains(event.target as Node)) {
        setFileShareOpen(false);
      }
      if (folderShareRef.current && !folderShareRef.current.contains(event.target as Node)) {
        setFolderShareOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected file and expand that file's folder
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const first = files[0];
      setSelectedFile(first);
      if (first.folder && first.folder !== 'root') {
        setExpandedFolders((prev) => ({ ...prev, [first.folder as string]: true }));
      }
    }
  }, [files, selectedFile]);

  const handleImportStarter = () => {
    setLocalWorkspace(STARTER_PYTHON_WORKSPACE);
    if (STARTER_PYTHON_WORKSPACE.files.length > 0) {
      setSelectedFile(STARTER_PYTHON_WORKSPACE.files[0]);
      setExpandedFolders({ DSA: true, visualisations: false, algorithms: false });
    }
    setImportNotice(true);
    setTimeout(() => setImportNotice(false), 2500);
  };

  const handleSelectFile = (file: WorkspaceFile) => {
    setSelectedFile(file);
    setFileShareOpen(false);
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

  const handleCopyCode = () => {
    if (!selectedFile?.code) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFileLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFileLink(true);
    setTimeout(() => {
      setCopiedFileLink(false);
      setFileShareOpen(false);
    }, 1800);
  };

  const handleCopyFolderLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFolderLink(true);
    setTimeout(() => {
      setCopiedFolderLink(false);
      setFolderShareOpen(null);
    }, 1800);
  };

  if (loading && (!effectiveWorkspace || files.length === 0)) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-4">
        <div className="w-56 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    );
  }

  // Filter files based on search
  const displayedFiles = (files as WorkspaceFile[]).filter((f: WorkspaceFile) => {
    if (!fileSearch.trim()) return true;
    const query = fileSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(query) ||
      (f.folder && f.folder.toLowerCase().includes(query)) ||
      (f.code && f.code.toLowerCase().includes(query))
    );
  });

  // Group files by folder
  const rootFiles = displayedFiles.filter((f: WorkspaceFile) => !f.folder || f.folder === 'root');
  const folderGroups: Record<string, WorkspaceFile[]> = {};
  displayedFiles.forEach((f: WorkspaceFile) => {
    if (f.folder && f.folder !== 'root') {
      if (!folderGroups[f.folder]) folderGroups[f.folder] = [];
      folderGroups[f.folder].push(f);
    }
  });

  // Folder details lookup map
  const folderDetailsList: any[] = effectiveWorkspace?.folder_details || [];
  const folderDetailsMap = folderDetailsList.reduce((acc: Record<string, any>, f: any) => {
    acc[f.name] = f;
    return acc;
  }, {});

  // URL helpers with safe fallbacks
  const getFileEditorUrl = (file: WorkspaceFile) => {
    return file.open_editor_url || `https://pycode-student.vercel.app/editor?file=${encodeURIComponent(file.name)}`;
  };

  const getFileShareUrl = (file: WorkspaceFile) => {
    return file.share_url || getFileEditorUrl(file);
  };

  const getFolderEditorUrl = (folderName: string) => {
    const meta = folderDetailsMap[folderName];
    return meta?.open_editor_url || `https://pycode-student.vercel.app/editor?folder=${encodeURIComponent(folderName)}`;
  };

  const getFolderShareUrl = (folderName: string) => {
    const meta = folderDetailsMap[folderName];
    return meta?.share_url || getFolderEditorUrl(folderName);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs overflow-hidden">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
            Saved Terminal Workspace ({effectiveWorkspace?.total_files || files.length} Python Scripts)
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Synced
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleImportStarter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors cursor-pointer"
            title="Import or reset 16 starter Python scripts across DSA & Visualisations"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{importNotice ? '16 Scripts Imported! ✓' : 'Import Starter Workspace'}</span>
          </button>

          <a
            href="https://pycode-student.vercel.app/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            <span>Launch PyCode IDE</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2-Column VS Code-Style Layout with Theme Gray Backgrounds */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Column: File Explorer (md:col-span-4) */}
        <div className="md:col-span-4 border-r border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/70 dark:bg-[#1a1a1a] space-y-2 overflow-y-auto max-h-[560px]">
          <div className="px-1 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            <span>EXPLORER / WORKSPACE</span>
            <span>{displayedFiles.length} files</span>
          </div>

          {/* Quick File Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-neutral-200/50 dark:bg-neutral-800/80 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-white outline-hidden"
            />
          </div>

          {/* Folders — Start Collapsed, Only Selected Folder Opens */}
          {Object.entries(folderGroups).map(([folderName, folderFiles]) => {
            const isExpanded = Boolean(expandedFolders[folderName]);
            const folderEditorUrl = getFolderEditorUrl(folderName);
            const folderShareUrl = getFolderShareUrl(folderName);

            return (
              <div key={folderName} className="space-y-0.5">
                <div className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors group">
                  <button
                    onClick={() => toggleFolder(folderName)}
                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
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
                    <span className="text-[10px] text-neutral-400 ml-1">({folderFiles.length})</span>
                  </button>

                  {/* Folder Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={folderEditorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Folder in PyCode ↗️"
                      className="p-1 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Folder Share Dropdown Toggle */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderShareOpen(folderShareOpen === folderName ? null : folderName);
                        }}
                        title="Share Folder"
                        className="p-1 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700 text-neutral-500 hover:text-emerald-500"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>

                      {folderShareOpen === folderName && (
                        <div
                          ref={folderShareRef}
                          className="absolute right-0 top-7 z-30 w-48 p-1.5 rounded-xl bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-1 text-left"
                        >
                          <button
                            onClick={() => handleCopyFolderLink(folderShareUrl)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                            <span>{copiedFolderLink ? 'Copied! ✓' : 'Copy Folder Link'}</span>
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my Python folder (${folderName}): ${folderShareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>Share on WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3">
                    {folderFiles.map((file) => {
                      const isSelected = selectedFile?.name === file.name;
                      const fileEditorUrl = getFileEditorUrl(file);

                      return (
                        <div
                          key={file.name}
                          onClick={() => handleSelectFile(file)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold border border-neutral-300 dark:border-neutral-700'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                            <span className="truncate">{file.filename || file.name}</span>
                          </div>

                          <a
                            href={fileEditorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Edit File in PyCode ↗️"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-neutral-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Root Files */}
          {rootFiles.map((file: WorkspaceFile) => {
            const isSelected = selectedFile?.name === file.name;
            const fileEditorUrl = getFileEditorUrl(file);

            return (
              <div
                key={file.name}
                onClick={() => handleSelectFile(file)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-neutral-200/90 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold border border-neutral-300 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate">{file.filename || file.name}</span>
                </div>

                <a
                  href={fileEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Edit File in PyCode ↗️"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded text-neutral-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Right Column: Premium Code Viewer Toolbar & Monaco Syntax Container */}
        <div className="md:col-span-8 flex flex-col bg-white dark:bg-[#1e1e1e]">
          {selectedFile ? (
            <>
              {/* Premium File Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-[#252525]">
                {/* 1. File Breadcrumb & Info */}
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {selectedFile.folder && selectedFile.folder !== 'root' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                      <Folder className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selectedFile.folder}</span>
                      <span className="text-neutral-400">/</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                      <Folder className="w-3.5 h-3.5 text-neutral-400" />
                      <span>root</span>
                      <span className="text-neutral-400">/</span>
                    </span>
                  )}

                  <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{selectedFile.filename || selectedFile.name}</span>
                  </span>

                  {selectedFile.last_modified && (
                    <span className="text-[10px] text-neutral-500 px-2 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 font-mono hidden md:inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedFile.last_modified).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* 2. Action Buttons (Top-Right) */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* "Edit in PyCode Editor" Button (Primary) */}
                  <a
                    href={getFileEditorUrl(selectedFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
                    title="Opens PyCode Editor, expands folder and loads this exact file in Monaco ready to run"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Edit in PyCode Editor</span>
                  </a>

                  {/* "Share File" Dropdown Button */}
                  <div className="relative" ref={fileShareRef}>
                    <button
                      onClick={() => setFileShareOpen(!fileShareOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Share</span>
                    </button>

                    {fileShareOpen && (
                      <div className="absolute right-0 top-9 z-30 w-52 p-1.5 rounded-xl bg-white dark:bg-[#242424] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-1 animate-in fade-in duration-100">
                        {/* 1. Copy Link */}
                        <button
                          onClick={() => handleCopyFileLink(getFileShareUrl(selectedFile))}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-left transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-blue-500" />
                          <span>{copiedFileLink ? 'Copied! ✓' : 'Copy File Link'}</span>
                        </button>

                        {/* 2. Share on WhatsApp */}
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Check out my Python code (${selectedFile.filename || selectedFile.name}): ${getFileShareUrl(selectedFile)}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-left transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Share on WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* "Copy Code" Button */}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
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
              <div className="flex-1 min-h-[420px]">
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-xs space-y-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p>Select any Python file from the left explorer to view code and actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspaceViewer;
