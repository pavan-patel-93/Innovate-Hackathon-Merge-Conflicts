"use client";

import { useState, useEffect } from "react";
import  Modal  from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  GripVertical, 
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export function DocumentTypeModal({ 
  isOpen, 
  onClose, 
  docType, 
  onSave, 
  isEdit 
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    sections: []
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    if (docType) {
      setFormData({
        code: docType.code || '',
        name: docType.name || '',
        description: docType.description || '',
        sections: docType.sections || []
      });
      // Expand all sections when editing existing document type
      setExpandedSections(new Set(docType.sections?.map((_, index) => index) || []));
    } else {
      // Reset form data when creating new document type
      setFormData({
        code: '',
        name: '',
        description: '',
        sections: []
      });
      setExpandedSections(new Set());
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
    
    // Collapse all existing sections when adding a new one
    setExpandedSections(new Set([formData.sections.length])); // Only expand the new section
    
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
    // Remove the section from expanded sections
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for sections after the removed one
      const adjustedSet = new Set();
      newSet.forEach(sectionIndex => {
        if (sectionIndex < index) {
          adjustedSet.add(sectionIndex);
        } else if (sectionIndex > index) {
          adjustedSet.add(sectionIndex - 1);
        }
      });
      return adjustedSet;
    });
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const toggleSectionExpansion = (index) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddRule = (sectionIndex) => {
    const newRule = {
      rule_id: `custom_${Date.now()}`,
      name: '',
      description: '',
      is_active: true,
      severity: 'minor',
      parameters: {}
    };
    
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, rules: [...(section.rules || []), newRule] }
          : section
      )
    }));
  };

  const handleUpdateRule = (sectionIndex, ruleIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? {
              ...section,
              rules: section.rules.map((rule, j) => 
                j === ruleIndex ? { ...rule, [field]: value } : rule
              )
            }
          : section
      )
    }));
  };

  const handleRemoveRule = (sectionIndex, ruleIndex) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, rules: section.rules.filter((_, j) => j !== ruleIndex) }
          : section
      )
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
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSectionExpansion(index)}
                                className="p-1"
                              >
                                {expandedSections.has(index) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
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
                                onClick={() => handleRemoveSection(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {expandedSections.has(index) && (
                            <>
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

                          {/* Section Rules */}
                          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                Validation Rules
                              </h5>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddRule(index)}
                                className="flex items-center space-x-2"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Rule</span>
                              </Button>
                            </div>

                            {section.rules && section.rules.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rule Name
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Severity
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {section.rules.map((rule, ruleIndex) => (
                                      <tr key={ruleIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-3 py-2">
                                          <Input
                                            value={rule.name}
                                            onChange={(e) => handleUpdateRule(index, ruleIndex, 'name', e.target.value)}
                                            placeholder="Rule name"
                                            className="text-sm border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Input
                                            value={rule.description}
                                            onChange={(e) => handleUpdateRule(index, ruleIndex, 'description', e.target.value)}
                                            placeholder="Description"
                                            className="text-sm border-0 bg-transparent p-1 focus:ring-1 focus:ring-blue-500"
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <select
                                            value={rule.severity}
                                            onChange={(e) => handleUpdateRule(index, ruleIndex, 'severity', e.target.value)}
                                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                          >
                                            <option value="critical">Critical</option>
                                            <option value="major">Major</option>
                                            <option value="minor">Minor</option>
                                          </select>
                                        </td>
                                        <td className="px-3 py-2">
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              checked={rule.is_active}
                                              onChange={(e) => handleUpdateRule(index, ruleIndex, 'is_active', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              rule.is_active 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            }`}>
                                              {rule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveRule(index, ruleIndex)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <p className="text-sm">No validation rules added</p>
                                <p className="text-xs">Click "Add Rule" to create your first rule</p>
                              </div>
                            )}
                          </div>
                            </>
                          )}
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
