
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
}

export function DocumentPreview({ isOpen, onClose, fileName, fileUrl }: DocumentPreviewProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  console.log("Document preview:", { fileName, fileUrl, isPdf });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
        <DialogTitle className="truncate max-w-full">{fileName}</DialogTitle>
          <DialogDescription className="truncate max-w-full">
            External agency file: {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isPdf && fileUrl ? (
            <AspectRatio ratio={16 / 9}>
              <iframe 
                src={fileUrl} 
                className="w-full h-full border-0" 
                title={fileName}
              />
            </AspectRatio>
          ) : (
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <div className="flex h-full items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 9H18.5L13 3.5V9ZM6 2H14L20 8V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V4C4 3.46957 4.21071 2.96086 4.58579 2.58579C4.96086 2.21071 5.46957 2 6 2Z"
                    fill="#EF5350"
                  />
                </svg>
                <span className="ml-2 text-muted-foreground">
                {fileUrl ? `Loading ${fileName}...` : `Preview not available for ${fileName}`}
                </span>
              </div>
            </AspectRatio>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
