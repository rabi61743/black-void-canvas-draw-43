
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload } from 'lucide-react';
import { CommentAttachment } from './CommentAttachment';

interface CommentFormProps {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  commentAttachments: File[];
  onAddCommentAttachment: (files: File[]) => void;
  onRemoveCommentAttachment: (index: number) => void;
  onAddComment: () => void;
  onShowUploadDialog: () => void;
  loading: boolean;
}

export function CommentForm({
  replyText,
  onReplyTextChange,
  commentAttachments,
  onAddCommentAttachment,
  onRemoveCommentAttachment,
  onAddComment,
  onShowUploadDialog,
  loading
}: CommentFormProps) {
  return (
    <div>
      <Textarea
        placeholder="Write a Reply"
        className="min-h-[100px] mb-4"
        value={replyText}
        onChange={(e) => onReplyTextChange(e.target.value)}
      />
      
      {/* File attachment component */}
      <CommentAttachment 
        onFileSelect={onAddCommentAttachment}
        selectedFiles={commentAttachments}
        onRemove={onRemoveCommentAttachment}
      />
      
      <div className="flex justify-between items-center mt-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={onShowUploadDialog}
          title="Upload to Project Documents"
        >
          <Upload className="h-4 w-4" />
          <span>Upload to Project</span>
        </Button>
        <Button 
          onClick={onAddComment}
          disabled={loading || (!replyText.trim() && commentAttachments.length === 0)}
        >
          {loading ? "Submitting..." : "Comment"}
        </Button>
      </div>
    </div>
  );
}
