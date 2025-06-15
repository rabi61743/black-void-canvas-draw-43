
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Edit, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Document {
  id: string;
  name: string;
  url?: string;
  uploaded_at: string;
}

interface CommentProps {
  author: string;
  date: string;
  content: string;
  role?: string;
  avatarUrl?: string;
  onReply?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  attachments?: Document[];
  onViewDocument?: (document: Document) => void;
}

export function Comment({
  author,
  date,
  content,
  role,
  avatarUrl,
  onReply,
  onEdit,
  onDelete,
  attachments = [],
  onViewDocument
}: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(editedContent);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex-shrink-0">
        <Avatar className="h-12 w-12 bg-gray-200 text-gray-700">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{author[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">{author}</span>
          <span className="text-gray-500">{date}</span>
          {role && (
            <span className="bg-gray-200 px-2 py-0.5 rounded text-sm">
              {role}
            </span>
          )}
          <div className="ml-auto">
            <span className="text-red-500">•</span>
          </div>
        </div>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[100px] mb-2"
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap break-words overflow-hidden max-w-full">{content}</p>
        )}
        
        {/* Display attachments if any */}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={() => onViewDocument && onViewDocument(doc)}
              >
                <FileText className="h-4 w-4" />
                {doc.name}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-4 mt-2">
          {onReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reply</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? "Save" : "Edit"}</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
