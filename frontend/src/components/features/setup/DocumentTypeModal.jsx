"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  GripVertical, 
  Settings, 
  Trash2 
} from "lucide-react";

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType?: any;
  onSave: (docTypeData: any) => void;
  isEdit: boolean;
  onOpenRulesModal: (section: any) => void;
}

export function DocumentTypeModal({ 
  isOpen, 
  onClose, 
  docType, 
  onSave, 
  isEdit, 
  onOpenRulesModal 
}: DocumentTypeModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    id_format: '',
    sections: []
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docType) {
      setFormData({
        code: docType.code || '',
        name: docType.name || '',
        description: docType.description || '',
        id_format: docType.id_format || '',
        sections: docType.sections || []
      });
    }
  }, [docType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving document type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    const newSection = {
      name: '',
      description: '',
      order: formData.sections.length,
      is_required: true,
      rules: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleSectionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Document Type' : 'Create Document Type'}
      description="Configure document type settings and validation rules"
      size="2xl"
    >
      <div className="flex h-[70vh]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Document Sections
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Code *
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., SOP, PROTOCOL, MANUAL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Standard Operating Procedures"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this document type..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID Format
                  </label>
                  <Input
                    value={formData.id_format}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_format: e.target.value }))}
                    placeholder="e.g., SOP-###, PROTOCOL-YYYY-###"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use # for numbers, YYYY for year, etc.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Document Sections
                  </h3>
                  <Button
                    type="button"
                    onClick={handleAddSection}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </Button>
                </div>

                {formData.sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No sections defined yet</p>
                    <p className="text-sm">Add sections to define the structure of this document type</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {section.name || `Section ${index + 1}`}
                              </h4>
                              {section.is_required && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Required
                                </span>
                              )}
                              {section.rules && section.rules.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {section.rules.length} rules
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenRulesModal(section)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSection(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Section Name *
                              </label>
                              <Input
                                value={section.name}
                                onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                                placeholder="e.g., Introduction, Methodology"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Order
                              </label>
                              <Input
                                type="number"
                                value={section.order}
                                onChange={(e) => handleSectionChange(index, 'order', parseInt(e.target.value))}
                                min="0"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                              </label>
                              <textarea
                                value={section.description}
                                onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                                placeholder="Describe what this section should contain..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                rows={2}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={section.is_required}
                                  onChange={(e) => handleSectionChange(index, 'is_required', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Required section
                                </span>
                              </label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
