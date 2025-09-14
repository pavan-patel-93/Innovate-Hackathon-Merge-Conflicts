"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Trash2
} from "lucide-react";

export function SectionRulesModal({ 
  isOpen, 
  onClose, 
  docTypeId, 
  section, 
  onSave 
}) {
  const [sectionRules, setSectionRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDescription, setNewRuleDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSectionRules(section?.rules || []);
    }
  }, [isOpen, section]);

  const handleAddRule = () => {
    if (!newRuleName.trim()) return;
    
    const newRule = {
      rule_id: `custom_${Date.now()}`,
      name: newRuleName.trim(),
      description: newRuleDescription.trim() || 'Custom validation rule',
      is_active: true,
      severity: 'minor',
      parameters: {}
    };
    setSectionRules(prev => [...prev, newRule]);
    setNewRuleName('');
    setNewRuleDescription('');
  };

  const handleUpdateRule = (index, field, value) => {
    setSectionRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const handleRemoveRule = (index) => {
    setSectionRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSection = {
        ...section,
        rules: sectionRules
      };
      await onSave(updatedSection);
      onClose();
    } catch (error) {
      console.error('Error saving section rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'major':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'minor':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Section Rules: ${section?.name}`}
      description="Add validation rules for this document section"
      size="lg"
    >
      <div className="space-y-6">
        {/* Add New Rule */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Add New Rule</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Name *
              </label>
              <Input
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g., Must contain introduction"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <Input
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                placeholder="Brief description of the rule"
                onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
              />
            </div>
            <Button 
              onClick={handleAddRule} 
              disabled={!newRuleName.trim()}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rule</span>
            </Button>
          </div>
        </div>

        {/* Current Rules */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            Current Rules ({sectionRules.length})
          </h3>
          
          {sectionRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No rules added yet</p>
              <p className="text-sm">Add your first rule above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sectionRules.map((rule, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                            {rule.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rule.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={rule.is_active}
                              onChange={(e) => handleUpdateRule(index, 'is_active', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Active
                            </span>
                          </label>
                          <select
                            value={rule.severity}
                            onChange={(e) => handleUpdateRule(index, 'severity', e.target.value)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          >
                            <option value="critical">Critical</option>
                            <option value="major">Major</option>
                            <option value="minor">Minor</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(index)}
                        className="text-red-600 hover:text-red-700 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Rules'}
        </Button>
      </div>
    </Modal>
  );
}