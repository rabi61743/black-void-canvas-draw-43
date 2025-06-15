
import { useState } from 'react';
import { DocumentPreview } from './DocumentPreview';

interface Document {
  id?: string;
  name: string;
  url?: string;
}

interface DocumentProps {
  count: number;
  documents?: Document[];
  onDocumentClick?: (doc: Document) => void;
}

export function DocumentList({ count, documents, onDocumentClick }: DocumentProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Use provided documents or generate placeholders if not provided
  const displayDocuments = documents && documents.length > 0 
    ? documents 
    : Array(count).fill(null).map((_, i) => ({
        name: `Doc${i+1}.pdf`,
      }));

  // Use all documents if showAll is true, otherwise limit to 3
  const visibleDocuments = showAll ? displayDocuments : displayDocuments.slice(0, 3);

  const handleDocumentClick = (doc: Document) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    } else {
      setSelectedDoc(doc);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {visibleDocuments.map((doc, index) => (
          <div 
            key={index} 
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 9H18.5L13 3.5V9ZM6 2H14L20 8V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V4C4 3.46957 4.21071 2.96086 4.58579 2.58579C4.96086 2.21071 5.46957 2 6 2Z"
                  fill="#EF5350"
                />
              </svg>
              <span className="text-sm font-medium truncate max-w-[120px]">
                {doc.name}
              </span>
            </div>
          </div>
        ))}
        {!showAll && count > 3 && (
          <div 
            className="font-normal text-base text-blue-600 cursor-pointer hover:underline"
            onClick={() => setShowAll(true)}
          >
            +{count - 3} more
          </div>
        )}
      </div>
      
      {!onDocumentClick && selectedDoc && (
        <DocumentPreview
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          fileName={selectedDoc.name}
          fileUrl={selectedDoc.url}
        />
      )}
    </>
  );
}
