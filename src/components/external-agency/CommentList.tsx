
import { Comment } from './Comment';
import { Document, CommentType } from './types';

interface CommentListProps {
  comments: CommentType[];
  loading: boolean;
  onEditComment: (commentId: string, newContent: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReplyToComment: (author: string) => void;
  onViewDocument: (document: Document) => void;
}

export function CommentList({
  comments,
  loading,
  onEditComment,
  onDeleteComment,
  onReplyToComment,
  onViewDocument
}: CommentListProps) {
  if (loading && comments.length === 0) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {comments.map(comment => (
        <Comment
          key={comment.id}
          author={comment.author}
          date={comment.date}
          content={comment.content}
          role={comment.role}
          attachments={comment.attachments}
          onViewDocument={onViewDocument}
          onEdit={comment.author === 'You' ? (newContent => onEditComment(comment.id, newContent)) : undefined}
          onDelete={comment.author === 'You' ? (() => onDeleteComment(comment.id)) : undefined}
          onReply={() => onReplyToComment(comment.author)}
        />
      ))}
    </div>
  );
}
