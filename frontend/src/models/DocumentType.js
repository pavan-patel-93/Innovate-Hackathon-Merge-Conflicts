// Document Type model for MongoDB
import mongoose from 'mongoose';

const SectionRuleSchema = new mongoose.Schema({
  rule_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  severity: {
    type: String,
    enum: ['critical', 'major', 'minor'],
    default: 'minor'
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const DocumentRuleSchema = new mongoose.Schema({
  rule_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  severity: {
    type: String,
    enum: ['critical', 'major', 'minor'],
    default: 'minor'
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const DocumentSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  is_required: {
    type: Boolean,
    default: true
  },
  rules: [SectionRuleSchema]
}, { _id: false });

const DocumentTypeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  id_format: {
    type: String,
    default: '',
    trim: true
  },
  sections: [DocumentSectionSchema],
  document_rules: [DocumentRuleSchema],
  created_by: {
    type: String,
    default: 'system'
  },
  updated_by: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      // Ensure document_rules are properly included and defaulted
      ret.document_rules = ret.document_rules || [];
      // Ensure sections are properly included and defaulted
      ret.sections = ret.sections || [];
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

// Ensure sections are ordered properly
DocumentTypeSchema.pre('save', function(next) {
  if (this.sections && this.sections.length > 0) {
    this.sections.forEach((section, index) => {
      section.order = index;
    });
  }
  next();
});

const DocumentType = mongoose.models.DocumentType || mongoose.model('DocumentType', DocumentTypeSchema, 'document_type_configuration');

export default DocumentType;
