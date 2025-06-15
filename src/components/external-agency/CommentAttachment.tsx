
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, PaperclipIcon, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CommentAttachmentProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemove: (index: number) => void;
}

export function CommentAttachment({ onFileSelect, selectedFiles, onRemove }: CommentAttachmentProps) {
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size limit (10MB)
      const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "Error",
          description: "Some files exceed the 10MB size limit",
          variant: "destructive",
        });
        // Filter out oversized files
        const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
        onFileSelect(validFiles);
        return;
      }
      
      onFileSelect(newFiles);
    }
  };

  return (
    <div className="w-full">
      {selectedFiles.length > 0 && (
        <div className="mb-4 border rounded-md p-2">
          <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          asChild
        >
          <label htmlFor="comment-attachment">
            <PaperclipIcon className="h-4 w-4" />
            Attach Files
            <Input 
              id="comment-attachment"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
          </label>
        </Button>
        <span className="text-xs text-gray-500">(Max 10MB per file)</span>
      </div>
    </div>
  );
}
