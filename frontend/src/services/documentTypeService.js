// Document Type service for CRUD operations
import connectToDatabase from '@/lib/mongodb';
import DocumentType from '@/models/DocumentType';

export class DocumentTypeService {
  
  // Create a new document type
  static async createDocumentType(documentTypeData, createdBy = 'system') {
    try {
      await connectToDatabase();
      
      const documentType = new DocumentType({
        ...documentTypeData,
        created_by: createdBy,
        updated_by: createdBy
      });
      
      const savedDocumentType = await documentType.save();
      return savedDocumentType.toJSON();
    } catch (error) {
      console.error('Error creating document type:', error);
      if (error.code === 11000) {
        throw new Error(`Document type with code '${documentTypeData.code}' already exists`);
      }
      throw new Error(`Failed to create document type: ${error.message}`);
    }
  }
  
  // Get all document types with pagination
  static async getDocumentTypes(skip = 0, limit = 100) {
    try {
      await connectToDatabase();
      
      const documentTypes = await DocumentType
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      return documentTypes.map(docType => ({
        ...docType,
        id: docType._id.toString(),
        created_at: docType.createdAt,
        updated_at: docType.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw new Error(`Failed to fetch document types: ${error.message}`);
    }
  }
  
  // Get document type by ID
  static async getDocumentTypeById(id) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findById(id).lean();
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      return {
        ...documentType,
        id: documentType._id.toString(),
        created_at: documentType.createdAt,
        updated_at: documentType.updatedAt
      };
    } catch (error) {
      console.error('Error fetching document type by ID:', error);
      throw new Error(`Failed to fetch document type: ${error.message}`);
    }
  }
  
  // Get document type by code
  static async getDocumentTypeByCode(code) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findOne({ 
        code: code.toUpperCase() 
      }).lean();
      
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      return {
        ...documentType,
        id: documentType._id.toString(),
        created_at: documentType.createdAt,
        updated_at: documentType.updatedAt
      };
    } catch (error) {
      console.error('Error fetching document type by code:', error);
      throw new Error(`Failed to fetch document type: ${error.message}`);
    }
  }
  
  // Update document type
  static async updateDocumentType(id, updateData, updatedBy = 'system') {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findByIdAndUpdate(
        id,
        {
          ...updateData,
          updated_by: updatedBy
        },
        { 
          new: true,
          runValidators: true
        }
      );
      
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      return documentType.toJSON();
    } catch (error) {
      console.error('Error updating document type:', error);
      if (error.code === 11000) {
        throw new Error(`Document type with code '${updateData.code}' already exists`);
      }
      throw new Error(`Failed to update document type: ${error.message}`);
    }
  }
  
  // Delete document type
  static async deleteDocumentType(id) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findByIdAndDelete(id);
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      return { message: 'Document type deleted successfully' };
    } catch (error) {
      console.error('Error deleting document type:', error);
      throw new Error(`Failed to delete document type: ${error.message}`);
    }
  }
  
  // Add section rule
  static async addSectionRule(docTypeId, sectionName, ruleData) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findById(docTypeId);
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      const section = documentType.sections.find(s => s.name === sectionName);
      if (!section) {
        throw new Error('Section not found');
      }
      
      section.rules.push(ruleData);
      await documentType.save();
      
      return documentType.toJSON();
    } catch (error) {
      console.error('Error adding section rule:', error);
      throw new Error(`Failed to add section rule: ${error.message}`);
    }
  }
  
  // Update section rule
  static async updateSectionRule(docTypeId, sectionName, ruleId, ruleData) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findById(docTypeId);
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      const section = documentType.sections.find(s => s.name === sectionName);
      if (!section) {
        throw new Error('Section not found');
      }
      
      const ruleIndex = section.rules.findIndex(r => r.rule_id === ruleId);
      if (ruleIndex === -1) {
        throw new Error('Rule not found');
      }
      
      section.rules[ruleIndex] = { ...section.rules[ruleIndex], ...ruleData };
      await documentType.save();
      
      return documentType.toJSON();
    } catch (error) {
      console.error('Error updating section rule:', error);
      throw new Error(`Failed to update section rule: ${error.message}`);
    }
  }
  
  // Delete section rule
  static async deleteSectionRule(docTypeId, sectionName, ruleId) {
    try {
      await connectToDatabase();
      
      const documentType = await DocumentType.findById(docTypeId);
      if (!documentType) {
        throw new Error('Document type not found');
      }
      
      const section = documentType.sections.find(s => s.name === sectionName);
      if (!section) {
        throw new Error('Section not found');
      }
      
      section.rules = section.rules.filter(r => r.rule_id !== ruleId);
      await documentType.save();
      
      return documentType.toJSON();
    } catch (error) {
      console.error('Error deleting section rule:', error);
      throw new Error(`Failed to delete section rule: ${error.message}`);
    }
  }
  
  // Get document type statistics
  static async getDocumentTypeStats() {
    try {
      await connectToDatabase();
      
      const totalTypes = await DocumentType.countDocuments();
      
      const avgSectionsResult = await DocumentType.aggregate([
        {
          $project: {
            sectionsCount: { $size: '$sections' }
          }
        },
        {
          $group: {
            _id: null,
            avgSections: { $avg: '$sectionsCount' }
          }
        }
      ]);
      
      const avgSections = avgSectionsResult.length > 0 
        ? Math.round(avgSectionsResult[0].avgSections * 100) / 100 
        : 0;
      
      return {
        total_document_types: totalTypes,
        average_sections_per_type: avgSections
      };
    } catch (error) {
      console.error('Error fetching document type stats:', error);
      throw new Error(`Failed to fetch document type stats: ${error.message}`);
    }
  }
}
