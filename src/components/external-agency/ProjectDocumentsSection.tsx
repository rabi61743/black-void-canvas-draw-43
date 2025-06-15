
import { DocumentList } from './DocumentList';
import { Document } from './types';

interface ProjectDocumentsSectionProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
}

export function ProjectDocumentsSection({ documents, onViewDocument }: ProjectDocumentsSectionProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-b py-6">
      <h3 className="text-xl font-semibold mb-4">Project Documents</h3>
      <DocumentList count={documents.length} documents={documents} onDocumentClick={onViewDocument} />
    </div>
  );
}
