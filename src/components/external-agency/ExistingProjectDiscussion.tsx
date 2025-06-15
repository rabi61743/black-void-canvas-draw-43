
import { Card } from "@/components/ui/card";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { DocumentPreview } from './DocumentPreview';
import { projectsApi, commentsApi } from "@/services/api";
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { ProjectDocumentsSection } from './ProjectDocumentsSection';
import { ProjectHeader } from './ProjectHeader';
import { StatusDropdown } from './StatusDropdown';
import { Document, ProjectData, CommentType, Status } from './types';

export function ExistingProjectDiscussion() {
  const [replyText, setReplyText] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
    
  const projectData = location.state?.project as ProjectData;
  const projectId = projectData?.id;
  
  // Initialize status from projectData
  const [projectStatus, setProjectStatus] = useState<Status>(
    projectData?.status || "pending"
  );
  
  // Debug log to check what status is received
  useEffect(() => {
    console.log("Project data received:", projectData);
    console.log("Initial status:", projectData?.status);
    
    if (projectData?.status) {
      console.log("Setting project status to:", projectData.status);
      setProjectStatus(projectData.status);
    }
  }, [projectData]); 

  // Fetch project documents and comments if project ID is available
  useEffect(() => {
    if (projectId) {
      fetchProjectDocuments();
      fetchProjectComments();
    }
  }, [projectId]);
  
  const fetchProjectDocuments = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await projectsApi.getById(projectId);
      if (response.data && response.data.documents) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching project documents:", error);
      toast({
        title: "Error",
        description: "Failed to load project documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectComments = async () => {
    if (!projectId) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await commentsApi.getByProject(projectId);
      if (response.data && response.data.length > 0) {
        setComments(response.data);
      } else {
        // Set a default "no comments" message if there are no comments
        setComments([
          {
            id: 'system-1',
            author: 'System',
            date: new Date().toLocaleString(),
            content: 'No comments yet.',
            role: 'System'
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching project comments:", error);
      toast({
        title: "Error",
        description: "Failed to load project comments",
        variant: "destructive",
      });
      // Set a default error message comment
      setComments([
        {
          id: 'system-error',
          author: 'System',
          date: new Date().toLocaleString(),
          content: 'Could not load comments. Please try again later.',
          role: 'System'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleAddComment = async () => {
    if (!replyText.trim() && commentAttachments.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a comment or attach files",
        variant: "destructive",
      });
      return;
    }

    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing. Cannot add comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const commentData = {
        author: 'You',
        content: replyText || 'Attached files', // If no text, use default message
        role: 'Author'
      };
      
      let response;
      
      // If there are attachments, use the special endpoint
      if (commentAttachments.length > 0) {
        response = await commentsApi.createWithAttachments(projectId, commentData, commentAttachments);
      } else {
        response = await commentsApi.create(projectId, commentData);
      }
      
      // Clear system message if it exists
      if (comments.length === 1 && comments[0].author === 'System') {
        setComments([response.data]);
      } else {
        setComments(prev => [...prev, response.data]);
      }
      
      // Refresh documents if files were attached
      if (commentAttachments.length > 0) {
        await fetchProjectDocuments();
      }
      
      setReplyText('');
      setCommentAttachments([]);
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      setLoading(true);
      await commentsApi.update(commentId, newContent);
      
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, content: newContent }
            : comment
        )
      );
      
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Don't try to delete system messages
    if (commentId.startsWith('system-')) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return;
    }
    
    try {
      setLoading(true);
      await commentsApi.delete(commentId);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      
      // If no comments left, add the system message back
      if (comments.length <= 1) {
        fetchProjectComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleProjectDocumentUpload = async (files: File[]) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing. Cannot upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await projectsApi.uploadDocuments(projectId, files);
      
      // If successful, add the new documents to state
      if (response.data) {
        setDocuments(prev => [...prev, ...response.data]);
        toast({
          title: "Success",
          description: `${files.length} document(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is missing. Cannot update status.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await projectsApi.updateStatus(projectId, newStatus);
      
      setProjectStatus(newStatus);
      
      toast({
        title: "Success",
        description: `Project status updated to ${newStatus}`,
      });
      
      // Add a system comment about the status change
      const statusChangeComment = {
        id: `system-status-${Date.now()}`,
        author: 'System',
        date: new Date().toLocaleString(),
        content: `Project status has been updated to "${newStatus}".`,
        role: 'System'
      };
      
      // Clear system message if it exists and add new comment
      if (comments.length === 1 && comments[0].author === 'System' && 
          !comments[0].content.includes('status')) {
        setComments([statusChangeComment]);
      } else {
        setComments(prev => [...prev, statusChangeComment]);
      }
      
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleAddCommentAttachment = (files: File[]) => {
    setCommentAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveCommentAttachment = (index: number) => {
    setCommentAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplyToComment = (author: string) => {
    setReplyText(`@${author} `);
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-white">
      <header className="w-full h-[78px] border-b border-gray-300 flex items-center px-8 justify-between">
        <button 
          onClick={handleGoBack} 
          className="flex items-center gap-2 hover:text-gray-600"
        >
          <span>← Back to Projects</span>
        </button>
        <h1 className="font-semibold text-4xl text-black">External Agency</h1>
      </header>

      <div className="p-8">
        <Card className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-[#333333] mb-2">
                {projectData?.title || "Project Name"}
              </h2>
              <p className="text-xl text-[#333333]">
                Discussion on {projectData?.title || "Project Name"}
              </p>
            </div>
            <StatusDropdown 
              status={projectStatus}
              onStatusChange={handleStatusChange}
            />
          </div>

          <ProjectDocumentsSection 
            documents={documents} 
            onViewDocument={handleViewDocument} 
          />

          <div className="mt-6 space-y-6">
            <CommentList 
              comments={comments}
              loading={loading}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onReplyToComment={handleReplyToComment}
              onViewDocument={handleViewDocument}
            />

            <div className="mt-8">
              <CommentForm 
                replyText={replyText}
                onReplyTextChange={setReplyText}
                commentAttachments={commentAttachments}
                onAddCommentAttachment={handleAddCommentAttachment}
                onRemoveCommentAttachment={handleRemoveCommentAttachment}
                onAddComment={handleAddComment}
                onShowUploadDialog={() => setIsUploadDialogOpen(true)}
                loading={loading}
              />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Document Upload Dialog */}
      <DocumentUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleProjectDocumentUpload}
      />
      
      {/* Document Preview Dialog */}
      {selectedDocument && (
        <DocumentPreview
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          fileName={selectedDocument.name}
          fileUrl={selectedDocument.url}
        />
      )}
    </div>
  );
}
