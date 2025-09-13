"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSetup } from "@/hooks/useSetup";
import { 
  Plus, 
  Trash2, 
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export function SectionRulesModal({ 
  isOpen, 
  onClose, 
  docTypeId, 
  section, 
  onSave 
}) {
  const { getPredefinedRules } = useSetup();
  const [predefinedRules, setPredefinedRules] = useState([]);
  const [sectionRules, setSectionRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRule, setExpandedRule] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPredefinedRules();
      setSectionRules(section?.rules || []);
    }
  }, [isOpen, section]);

  const loadPredefinedRules = async () => {
    try {
      const rules = await getPredefinedRules();
      setPredefinedRules(rules);
    } catch (error) {
      console.error('Error loading predefined rules:', error);
    }
  };

  const handleAddRule = (ruleTemplate) => {
    const newRule = {
      rule_id: ruleTemplate.rule_id,
      name: ruleTemplate.name,
      description: ruleTemplate.description,
      is_active: true,
      severity: ruleTemplate.severity,
      parameters: { ...ruleTemplate.parameters }
    };
    setSectionRules(prev => [...prev, newRule]);
  };

  const handleUpdateRule = (index, field, value) => {
    setSectionRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const handleUpdateRuleParameter = (index, paramKey, value) => {
    setSectionRules(prev => prev.map((rule, i) => 
      i === index ? { 
        ...rule, 
        parameters: { 
          ...rule.parameters, 
          [paramKey]: value 
        } 
      } : rule
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'minor':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
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
      description="Configure validation rules for this document section"
      size="2xl"
    >
      <div className="flex h-[70vh]">
        {/* Available Rules */}
        <div className="w-1/3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Available Rules</h3>
          <div className="space-y-2">
            {predefinedRules.map((rule) => (
              <Card key={rule.rule_id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {rule.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {rule.description}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleAddRule(rule)}
                    className="w-full"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Rule
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section Rules */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            Applied Rules ({sectionRules.length})
          </h3>
          
          {sectionRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No rules applied yet</p>
              <p className="text-sm">Select rules from the left panel to add them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sectionRules.map((rule, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(rule.severity)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {expandedRule === index ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rule.is_active}
                          onChange={(e) => handleUpdateRule(index, 'is_active', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

                    {expandedRule === index && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Rule Parameters
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(rule.parameters).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </label>
                              {typeof value === 'object' && value.type === 'array' ? (
                                <div className="space-y-2">
                                  {Array.isArray(rule.parameters[key]) ? (
                                    rule.parameters[key].map((item, itemIndex) => (
                                      <div key={itemIndex} className="flex items-center space-x-2">
                                        <Input
                                          value={item}
                                          onChange={(e) => {
                                            const newArray = [...rule.parameters[key]];
                                            newArray[itemIndex] = e.target.value;
                                            handleUpdateRuleParameter(index, key, newArray);
                                          }}
                                          className="flex-1"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newArray = rule.parameters[key].filter((_, i) => i !== itemIndex);
                                            handleUpdateRuleParameter(index, key, newArray);
                                          }}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))
                                  ) : null}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newArray = [...(rule.parameters[key] || []), ''];
                                      handleUpdateRuleParameter(index, key, newArray);
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Item
                                  </Button>
                                </div>
                              ) : (
                                <Input
                                  type={typeof value === 'number' ? 'number' : 'text'}
                                  value={rule.parameters[key] || ''}
                                  onChange={(e) => {
                                    const newValue = typeof value === 'number' ? 
                                      parseFloat(e.target.value) || 0 : 
                                      e.target.value;
                                    handleUpdateRuleParameter(index, key, newValue);
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
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
