// hooks/useCommitteeForm.ts
import { useState } from 'react';
import type { Committee, CommitteeMember } from '@/types/committee';

export const useCommitteeForm = (
  onClose: () => void,
  onCreateCommittee?: (committee: Committee) => void
) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [formDate, setFormDate] = useState('');
  const [specificationDate, setSpecificationDate] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        employeeId: '',
        name: '',
        email: '',
        department: '',
        phone: '',
        role: 'member',
        tasks: [],
      },
    ]);
  };

  const handleUpdateMember = (
    index: number,
    field: keyof CommitteeMember,
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    );
  };

  const resetForm = () => {
    setName('');
    setPurpose('');
    setFormDate('');
    setSpecificationDate('');
    setReviewDate('');
    setSelectedFile(null);
    setMembers([]);
  };

  return {
    name,
    purpose,
    formDate,
    specificationDate,
    reviewDate,
    selectedFile,
    members,
    setName,
    setPurpose,
    setFormDate,
    setSpecificationDate,
    setReviewDate,
    setSelectedFile,
    setMembers,
    handleAddMember,
    handleUpdateMember,
    resetForm,
  };
};


