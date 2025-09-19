/**
 * Base Entity Class
 * Provides standardized CRUD operations and data management for all entities
 */

import { apiClient, ApiResponse, ValidationSchema, ValidationError } from './StandardApiClient';

export class BaseEntity {
  constructor(data = {}, entityConfig = {}) {
    // Entity configuration
    this.entityName = entityConfig.entityName || this.constructor.name.toLowerCase();
    this.endpoint = entityConfig.endpoint || `/${this.entityName}s`;
    this.primaryKey = entityConfig.primaryKey || 'id';
    this.timestamps = entityConfig.timestamps !== false; // Default to true
    
    // Validation schema
    this.validationSchema = entityConfig.validationSchema || new ValidationSchema({});
    
    // Set data properties
    this.setData(data);
    
    // Track changes
    this._originalData = { ...data };
    this._isDirty = false;
  }

  /**
   * Set entity data
   */
  setData(data) {
    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
    
    if (this.timestamps && !this.created_at && !data.id) {
      this.created_at = new Date().toISOString();
    }
    
    if (this.timestamps) {
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Get entity data as plain object
   */
  getData(includeTimestamps = true) {
    const data = {};
    
    Object.keys(this).forEach(key => {
      if (!key.startsWith('_') && 
          key !== 'entityName' && 
          key !== 'endpoint' && 
          key !== 'primaryKey' && 
          key !== 'timestamps' && 
          key !== 'validationSchema') {
        
        if (!includeTimestamps && (key === 'created_at' || key === 'updated_at')) {
          return;
        }
        
        data[key] = this[key];
      }
    });
    
    return data;
  }

  /**
   * Get only changed data
   */
  getChanges() {
    const changes = {};
    const currentData = this.getData();
    
    Object.keys(currentData).forEach(key => {
      if (currentData[key] !== this._originalData[key]) {
        changes[key] = currentData[key];
      }
    });
    
    return changes;
  }

  /**
   * Check if entity has unsaved changes
   */
  isDirty() {
    return this._isDirty || Object.keys(this.getChanges()).length > 0;
  }

  /**
   * Mark entity as clean (no unsaved changes)
   */
  markClean() {
    this._isDirty = false;
    this._originalData = { ...this.getData() };
  }

  /**
   * Validate entity data
   */
  validate() {
    try {
      this.validationSchema.validate(this.getData());
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { valid: false, errors: error.errors };
      }
      throw error;
    }
  }

  /**
   * Save entity (create or update)
   */
  async save() {
    // Validate before saving
    const validation = this.validate();
    if (!validation.valid) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    try {
      if (this[this.primaryKey]) {
        return await this.update();
      } else {
        return await this.create();
      }
    } catch (error) {
      console.error(`Failed to save ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async create() {
    const data = this.getData(false); // Exclude timestamps, let server handle them
    
    try {
      const response = await apiClient.post(this.endpoint, data);
      
      if (response.success) {
        this.setData(response.data);
        this.markClean();
        return ApiResponse.success(this, 'Entity created successfully');
      }
      
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'create');
    }
  }

  /**
   * Update existing entity
   */
  async update() {
    if (!this[this.primaryKey]) {
      throw new Error(`Cannot update ${this.entityName} without ${this.primaryKey}`);
    }

    const changes = this.getChanges();
    if (Object.keys(changes).length === 0) {
      return ApiResponse.success(this, 'No changes to save');
    }

    // Always include updated_at if timestamps are enabled
    if (this.timestamps) {
      changes.updated_at = new Date().toISOString();
    }

    try {
      const url = `${this.endpoint}/${this[this.primaryKey]}`;
      const response = await apiClient.patch(url, changes);
      
      if (response.success) {
        this.setData(response.data);
        this.markClean();
        return ApiResponse.success(this, 'Entity updated successfully');
      }
      
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'update');
    }
  }

  /**
   * Delete entity
   */
  async delete() {
    if (!this[this.primaryKey]) {
      throw new Error(`Cannot delete ${this.entityName} without ${this.primaryKey}`);
    }

    try {
      const url = `${this.endpoint}/${this[this.primaryKey]}`;
      const response = await apiClient.delete(url);
      
      if (response.success) {
        return ApiResponse.success(null, 'Entity deleted successfully');
      }
      
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'delete');
    }
  }

  /**
   * Reload entity from server
   */
  async reload() {
    if (!this[this.primaryKey]) {
      throw new Error(`Cannot reload ${this.entityName} without ${this.primaryKey}`);
    }

    try {
      const response = await this.constructor.find(this[this.primaryKey]);
      if (response.success) {
        this.setData(response.data.getData());
        this.markClean();
        return ApiResponse.success(this, 'Entity reloaded successfully');
      }
      return response;
    } catch (error) {
      throw this.handleApiError(error, 'reload');
    }
  }

  /**
   * Handle API errors consistently
   */
  handleApiError(error, operation) {
    const context = {
      entity: this.entityName,
      operation,
      id: this[this.primaryKey]
    };

    if (error.status === 422) {
      return new ValidationError(`Validation failed during ${operation}`, error.details?.errors || []);
    }

    console.error(`API error during ${operation} for ${this.entityName}:`, error);
    return error;
  }

  /**
   * Static methods for entity operations
   */

  /**
   * Find entity by ID
   */
  static async find(id) {
    const instance = new this();
    
    try {
      const url = `${instance.endpoint}/${id}`;
      const response = await apiClient.get(url);
      
      if (response.success) {
        const entity = new this(response.data);
        entity.markClean();
        return ApiResponse.success(entity);
      }
      
      return response;
    } catch (error) {
      if (error.status === 404) {
        return ApiResponse.notFound(instance.entityName, id);
      }
      throw error;
    }
  }

  /**
   * Find all entities with optional filtering
   */
  static async findAll(params = {}) {
    const instance = new this();
    
    try {
      const response = await apiClient.get(instance.endpoint, { params });
      
      if (response.success) {
        const entities = response.data.map(data => {
          const entity = new this(data);
          entity.markClean();
          return entity;
        });
        
        return ApiResponse.success(entities, 'Entities retrieved successfully', {
          count: entities.length,
          params
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find entities with pagination
   */
  static async paginate(page = 1, limit = 10, params = {}) {
    const instance = new this();
    
    const paginationParams = {
      page,
      limit,
      ...params
    };
    
    try {
      const response = await apiClient.get(instance.endpoint, { params: paginationParams });
      
      if (response.success) {
        const entities = response.data.items?.map(data => {
          const entity = new this(data);
          entity.markClean();
          return entity;
        }) || [];
        
        return ApiResponse.success(entities, 'Entities retrieved successfully', {
          pagination: {
            page: response.data.page || page,
            limit: response.data.limit || limit,
            total: response.data.total || entities.length,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || entities.length) / limit)
          },
          params
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find entities by specific criteria
   */
  static async findBy(criteria = {}) {
    return this.findAll(criteria);
  }

  /**
   * Find first entity matching criteria
   */
  static async findFirst(criteria = {}) {
    const response = await this.findAll({ ...criteria, limit: 1 });
    
    if (response.success && response.data.length > 0) {
      return ApiResponse.success(response.data[0]);
    }
    
    return ApiResponse.notFound(new this().entityName);
  }

  /**
   * Create new entity
   */
  static async create(data) {
    const entity = new this(data);
    return entity.save();
  }

  /**
   * Update entity by ID
   */
  static async update(id, data) {
    const response = await this.find(id);
    
    if (response.success) {
      const entity = response.data;
      entity.setData(data);
      return entity.save();
    }
    
    return response;
  }

  /**
   * Delete entity by ID
   */
  static async destroy(id) {
    const response = await this.find(id);
    
    if (response.success) {
      return response.data.delete();
    }
    
    return response;
  }

  /**
   * Batch operations
   */
  static async createMany(dataArray) {
    const results = [];
    
    for (const data of dataArray) {
      try {
        const result = await this.create(data);
        results.push(result);
      } catch (error) {
        results.push(ApiResponse.error(`Failed to create entity: ${error.message}`, error.status));
      }
    }
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return ApiResponse.success(successful, `Created ${successful.length} entities`, {
      successful: successful.length,
      failed: failed.length,
      failures: failed
    });
  }

  /**
   * Search entities
   */
  static async search(query, params = {}) {
    const instance = new this();
    
    const searchParams = {
      q: query,
      ...params
    };
    
    try {
      const url = `${instance.endpoint}/search`;
      const response = await apiClient.get(url, { params: searchParams });
      
      if (response.success) {
        const entities = response.data.map(data => {
          const entity = new this(data);
          entity.markClean();
          return entity;
        });
        
        return ApiResponse.success(entities, 'Search completed successfully', {
          query,
          count: entities.length,
          params: searchParams
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get entity count
   */
  static async count(params = {}) {
    const instance = new this();
    
    try {
      const url = `${instance.endpoint}/count`;
      const response = await apiClient.get(url, { params });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if entity exists
   */
  static async exists(id) {
    try {
      const response = await this.find(id);
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Utility methods
   */

  /**
   * Convert to JSON
   */
  toJSON() {
    return this.getData();
  }

  /**
   * Convert to string
   */
  toString() {
    return `${this.constructor.name}(${this[this.primaryKey] || 'new'})`;
  }

  /**
   * Clone entity
   */
  clone() {
    const data = this.getData();
    delete data[this.primaryKey]; // Remove ID so it creates a new entity
    return new this.constructor(data);
  }
}

export default BaseEntity;
