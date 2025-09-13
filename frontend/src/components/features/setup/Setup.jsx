"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import { DocumentTypeModal } from "./DocumentTypeModal";
import { SectionRulesModal } from "./SectionRulesModal";
import { useSetup } from "@/hooks/useSetup";
import { useModal } from "@/hooks/useModal";
import { Plus, Clock, Search } from "lucide-react";
import { useState } from "react";

export function Setup() {
  const {
    documentTypes,
    loading,
    loadDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType
  } = useSetup();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingDocType, setEditingDocType] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const createModal = useModal();
  const editModal = useModal();
  const rulesModal = useModal();

  const handleCreateDocumentType = () => {
    setEditingDocType(null);
    createModal.open();
  };

  const handleEditDocumentType = (docType) => {
    setEditingDocType(docType);
    editModal.open();
  };

  const handleDeleteDocumentType = async (docType) => {
    if (window.confirm('Are you sure you want to delete this document type?')) {
      try {
        await deleteDocumentType(docType.id);
        await loadDocumentTypes();
      } catch (error) {
        console.error('Error deleting document type:', error);
        alert('Error deleting document type');
      }
    }
  };

  const handleSaveDocumentType = async (docTypeData) => {
    try {
      if (editingDocType) {
        await updateDocumentType(editingDocType.id, docTypeData);
      } else {
        await createDocumentType(docTypeData);
      }
      await loadDocumentTypes();
      createModal.close();
      editModal.close();
    } catch (error) {
      console.error('Error saving document type:', error);
      alert('Error saving document type');
    }
  };

  const handleOpenRulesModal = (section) => {
    setSelectedSection(section);
    rulesModal.open();
  };

  const handleSaveSectionRules = async (updatedSection) => {
    try {
      if (editingDocType) {
        const updatedSections = editingDocType.sections.map(s => 
          s.name === updatedSection.name ? updatedSection : s
        );
        await updateDocumentType(editingDocType.id, { sections: updatedSections });
        await loadDocumentTypes();
      }
    } catch (error) {
      console.error('Error saving section rules:', error);
      alert('Error saving section rules');
    }
  };

  const filteredDocumentTypes = documentTypes.filter(docType =>
    docType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docType.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (docType.description && docType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      key: 'name',
      label: 'Document Name',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.description || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'code',
      label: 'Document Type',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {value}
        </span>
      )
    },
    {
      key: 'sections',
      label: 'Sections',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900 dark:text-white">
            {row.sections?.length || 0}
          </span>
          {row.sections?.some(s => s.is_required) && (
            <span className="text-xs text-red-600 dark:text-red-400">
              ({row.sections.filter(s => s.is_required).length} required)
            </span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'created_by',
      label: 'Created By',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value || 'System'}
        </span>
      )
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'updated_by',
      label: 'Updated By',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {value || 'System'}
        </span>
      )
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Document Types Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage document type configurations and validation rules
          </p>
        </div>

        {/* Header Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search document types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={loadDocumentTypes}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
                <Button
                  onClick={handleCreateDocumentType}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Document Type</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable
          data={filteredDocumentTypes}
          columns={columns}
          loading={loading}
          onEdit={handleEditDocumentType}
          onDelete={handleDeleteDocumentType}
          emptyMessage="No document types configured"
        />

        {/* Modals */}
        <DocumentTypeModal
          isOpen={createModal.isOpen || editModal.isOpen}
          onClose={() => {
            createModal.close();
            editModal.close();
          }}
          docType={editingDocType}
          onSave={handleSaveDocumentType}
          isEdit={editModal.isOpen}
          onOpenRulesModal={handleOpenRulesModal}
        />

        <SectionRulesModal
          isOpen={rulesModal.isOpen}
          onClose={rulesModal.close}
          docTypeId={editingDocType?.id}
          section={selectedSection}
          onSave={handleSaveSectionRules}
        />
      </div>
    </div>
  );
}
