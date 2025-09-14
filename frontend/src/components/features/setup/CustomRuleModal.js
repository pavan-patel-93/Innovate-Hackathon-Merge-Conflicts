"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Minus,
  AlertCircle,
  AlertTriangle,
  Info
} from "lucide-react";

export function CustomRuleModal({ 
  isOpen, 
  onClose, 
  onSave 
}) {
  const [rule, setRule] = useState({
    rule_id: `CUSTOM-${Date.now().toString().slice(-6)}`,
    name: "",
    description: "",
    severity: "major",
    parameters: {}
  });
  
  const [parameterType, setParameterType] = useState("text");
  const [newParamKey, setNewParamKey] = useState("");
  const [newParamValue, setNewParamValue] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setRule(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear any error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSeverityChange = (severity) => {
    setRule(prev => ({ ...prev, severity }));
  };

  const addParameter = () => {
    if (!newParamKey.trim()) {
      setErrors(prev => ({ ...prev, newParamKey: "Parameter name is required" }));
      return;
    }
    
    // Format based on parameter type
    let paramValue;
    
    if (parameterType === "array") {
      paramValue = newParamValue.split(",").map(item => item.trim()).filter(Boolean);
    } else if (parameterType === "number") {
      paramValue = Number(newParamValue) || 0;
    } else {
      paramValue = newParamValue;
    }
    
    setRule(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [newParamKey]: paramValue
      }
    }));
    
    // Reset inputs
    setNewParamKey("");
    setNewParamValue("");
    setErrors(prev => ({ ...prev, newParamKey: null }));
  };

  const removeParameter = (key) => {
    setRule(prev => {
      const newParams = { ...prev.parameters };
      delete newParams[key];
      return {
        ...prev,
        parameters: newParams
      };
    });
  };

  const validateRule = () => {
    const newErrors = {};
    
    if (!rule.name.trim()) {
      newErrors.name = "Rule name is required";
    }
    
    if (!rule.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateRule()) {
      onSave(rule);
      onClose();
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

  const getSeverityColorClass = (severity, isActive) => {
    if (!isActive) return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    
    switch (severity) {
      case 'critical':
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case 'major':
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 'minor':
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Rule"
      description="Define a new validation rule for this document section"
      size="lg"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rule Name*
            </label>
            <Input
              value={rule.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Document ID Format Check"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description*
            </label>
            <textarea
              value={rule.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this rule validates..."
              className={`w-full px-3 py-2 border ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <div className="flex space-x-2">
              {['critical', 'major', 'minor'].map((severity) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => handleSeverityChange(severity)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium ${getSeverityColorClass(severity, rule.severity === severity)}`}
                >
                  {getSeverityIcon(severity)}
                  <span className="capitalize">{severity}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Rule Parameters
            </h3>
            
            {/* Add new parameter */}
            <div className="flex space-x-2 mb-4">
              <div className="flex-1">
                <Input
                  value={newParamKey}
                  onChange={(e) => setNewParamKey(e.target.value)}
                  placeholder="Parameter name"
                  className={errors.newParamKey ? "border-red-500" : ""}
                />
                {errors.newParamKey && (
                  <p className="mt-1 text-xs text-red-500">{errors.newParamKey}</p>
                )}
              </div>
              
              <select
                value={parameterType}
                onChange={(e) => setParameterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="array">Array</option>
              </select>
              
              <div className="flex-1">
                <Input
                  value={newParamValue}
                  onChange={(e) => setNewParamValue(e.target.value)}
                  placeholder={parameterType === "array" ? "Value1, Value2, ..." : "Parameter value"}
                  type={parameterType === "number" ? "number" : "text"}
                />
              </div>
              
              <Button 
                type="button" 
                size="sm"
                onClick={addParameter}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Parameter list */}
            <div className="space-y-2">
              {Object.entries(rule.parameters).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No parameters defined yet. Add parameters to configure your rule.
                </p>
              ) : (
                Object.entries(rule.parameters).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {key}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Array.isArray(value) 
                          ? value.join(", ")
                          : value.toString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Create Rule
        </Button>
      </div>
    </Modal>
  );
}