"use client";
import { useStudioAutosave } from "@/lib/use-studio-autosave";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { VirtualFileSystem, FileNode } from "@/lib/file-system";
import {
  SerializedFileSystem,
  streamedToolCallSchema,
} from "@/lib/data-schemas";

interface FileSystemContextType {
  fileSystem: VirtualFileSystem;
  selectedFile: string | null;
  setSelectedFile: (path: string | null) => void;
  createFile: (path: string, content?: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => boolean;
  getFileContent: (path: string) => string | null;
  getAllFiles: () => Map<string, string>;
  refreshTrigger: number;
  handleToolCall: (toolCall: unknown) => void;
  reset: () => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined
);

export function FileSystemProvider({
  children,
  fileSystem: providedFileSystem,
  initialData,
}: {
  children: React.ReactNode;
  fileSystem?: VirtualFileSystem;
  initialData?: SerializedFileSystem;
}) {
  const [fileSystem] = useState(() => {
    const fs = providedFileSystem || new VirtualFileSystem();
    if (initialData) {
      fs.deserializeFromNodes(initialData);
    }
    return fs;
  });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useStudioAutosave("canvas-files",{files:fileSystem.serialize()},value=>{fileSystem.deserializeFromNodes(value.files);triggerRefresh();});

  useEffect(() => {
    if (!selectedFile) {
      const files = fileSystem.getAllFiles();

      // Check if App.jsx exists
      if (files.has("/App.jsx")) {
        setSelectedFile("/App.jsx");
      } else {
        // Find first file in root directory
        const rootFiles = Array.from(files.keys())
          .filter((path) => {
            const parts = path.split("/").filter(Boolean);
            return parts.length === 1; // Root level file
          })
          .sort();

        if (rootFiles.length > 0) {
          setSelectedFile(rootFiles[0]);
        }
      }
    }
  }, [selectedFile, fileSystem, refreshTrigger]);

  const createFile = useCallback(
    (path: string, content: string = "") => {
      fileSystem.createFile(path, content);
      triggerRefresh();
    },
    [fileSystem, triggerRefresh]
  );

  const updateFile = useCallback(
    (path: string, content: string) => {
      fileSystem.updateFile(path, content);
      triggerRefresh();
    },
    [fileSystem, triggerRefresh]
  );

  const deleteFile = useCallback(
    (path: string) => {
      fileSystem.deleteFile(path);
      if (selectedFile === path) {
        setSelectedFile(null);
      }
      triggerRefresh();
    },
    [fileSystem, selectedFile, triggerRefresh]
  );

  const renameFile = useCallback(
    (oldPath: string, newPath: string): boolean => {
      const success = fileSystem.rename(oldPath, newPath);
      if (success) {
        // Update selected file if it was renamed
        if (selectedFile === oldPath) {
          setSelectedFile(newPath);
        } else if (selectedFile && selectedFile.startsWith(oldPath + "/")) {
          // Update selected file if it's inside a renamed directory
          const relativePath = selectedFile.substring(oldPath.length);
          setSelectedFile(newPath + relativePath);
        }
        triggerRefresh();
      }
      return success;
    },
    [fileSystem, selectedFile, triggerRefresh]
  );

  const getFileContent = useCallback(
    (path: string) => {
      return fileSystem.readFile(path);
    },
    [fileSystem]
  );

  const getAllFiles = useCallback(() => {
    return fileSystem.getAllFiles();
  }, [fileSystem]);

  const reset = useCallback(() => {
    fileSystem.reset();
    setSelectedFile(null);
    triggerRefresh();
  }, [fileSystem, triggerRefresh]);

  const handleToolCall = useCallback(
    (toolCall: unknown) => {
      const parsed = streamedToolCallSchema.safeParse(toolCall);
      if (!parsed.success) {
        console.error("Rejected invalid filesystem tool call", parsed.error.flatten());
        return;
      }
      const { toolName, args } = parsed.data;

      // Handle str_replace_editor tool
      if (toolName === "str_replace_editor") {
        switch (args.command) {
          case "create":
            {
              const result = fileSystem.createFileWithParents(args.path, args.file_text);
              if (!result.startsWith("Error:")) {
                createFile(args.path, args.file_text);
              }
            }
            break;

          case "str_replace":
            {
              const result = fileSystem.replaceInFile(
                args.path,
                args.old_str,
                args.new_str
              );
              if (!result.startsWith("Error:")) {
                const content = fileSystem.readFile(args.path);
                if (content !== null) {
                  updateFile(args.path, content);
                }
              }
            }
            break;

          case "insert":
            {
              const result = fileSystem.insertInFile(
                args.path,
                args.insert_line,
                args.new_str
              );
              if (!result.startsWith("Error:")) {
                const content = fileSystem.readFile(args.path);
                if (content !== null) {
                  updateFile(args.path, content);
                }
              }
            }
            break;
        }
      }

      // Handle file_manager tool
      if (toolName === "file_manager") {
        switch (args.command) {
          case "rename":
            renameFile(args.path, args.new_path);
            break;

          case "delete":
            {
              const success = fileSystem.deleteFile(args.path);
              if (success) deleteFile(args.path);
            }
            break;
        }
      }
    },
    [fileSystem, createFile, updateFile, deleteFile, renameFile]
  );

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        selectedFile,
        setSelectedFile,
        createFile,
        updateFile,
        deleteFile,
        renameFile,
        getFileContent,
        getAllFiles,
        refreshTrigger,
        handleToolCall,
        reset,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
}

