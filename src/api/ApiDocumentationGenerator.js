/**
 * API Documentation Generator
 * Automatically generates comprehensive API documentation from entity definitions
 */

import { EntityRegistry } from './StandardEntities';

export class ApiDocumentationGenerator {
  constructor() {
    this.entities = EntityRegistry;
    this.documentation = {};
  }

  /**
   * Generate complete API documentation
   */
  generateDocumentation() {
    this.documentation = {
      title: 'RedScan Security Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for RedScan security platform',
      baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
      authentication: {
        type: 'Bearer Token',
        description: 'All requests require a valid JWT token in the Authorization header',
        example: 'Authorization: Bearer <your-jwt-token>'
      },
      standardResponses: this.getStandardResponses(),
      entities: this.generateEntityDocumentation(),
      endpoints: this.generateEndpointDocumentation(),
      errorCodes: this.getErrorCodes(),
      examples: this.generateExamples()
    };

    return this.documentation;
  }

  /**
   * Generate documentation for all entities
   */
  generateEntityDocumentation() {
    const entityDocs = {};

    Object.entries(this.entities).forEach(([name, EntityClass]) => {
      const instance = new EntityClass();
      
      entityDocs[name] = {
        name: instance.entityName,
        endpoint: instance.endpoint,
        primaryKey: instance.primaryKey,
        description: this.getEntityDescription(name),
        schema: this.generateEntitySchema(instance),
        validationRules: this.generateValidationDocumentation(instance.validationSchema),
        relationships: this.getEntityRelationships(name),
        examples: this.generateEntityExamples(instance)
      };
    });

    return entityDocs;
  }

  /**
   * Generate endpoint documentation
   */
  generateEndpointDocumentation() {
    const endpoints = {};

    Object.entries(this.entities).forEach(([name, EntityClass]) => {
      const instance = new EntityClass();
      const entityEndpoints = this.generateCrudEndpoints(instance, name);
      
      Object.assign(endpoints, entityEndpoints);
    });

    // Add custom endpoints
    Object.assign(endpoints, this.getCustomEndpoints());

    return endpoints;
  }

  /**
   * Generate CRUD endpoints for an entity
   */
  generateCrudEndpoints(instance, entityName) {
    const endpoints = {};
    const basePath = instance.endpoint;
    
    // List entities
    endpoints[`GET ${basePath}`] = {
      summary: `List all ${entityName.toLowerCase()}s`,
      description: `Retrieve a list of all ${entityName.toLowerCase()}s with optional filtering and pagination`,
      parameters: [
        {
          name: 'page',
          in: 'query',
          type: 'integer',
          description: 'Page number for pagination (default: 1)'
        },
        {
          name: 'limit',
          in: 'query',
          type: 'integer',
          description: 'Number of items per page (default: 10, max: 100)'
        },
        {
          name: 'sort',
          in: 'query',
          type: 'string',
          description: 'Sort field and direction (e.g., "created_at:desc")'
        },
        ...this.getEntityFilterParameters(instance)
      ],
      responses: {
        200: {
          description: 'Successfully retrieved entities',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: this.generateEntitySchema(instance)
              },
              metadata: {
                type: 'object',
                properties: {
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    // Get single entity
    endpoints[`GET ${basePath}/{id}`] = {
      summary: `Get ${entityName.toLowerCase()} by ID`,
      description: `Retrieve a specific ${entityName.toLowerCase()} by its ID`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          type: 'string',
          description: `${entityName} ID`
        }
      ],
      responses: {
        200: {
          description: 'Successfully retrieved entity',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: this.generateEntitySchema(instance)
            }
          }
        },
        404: {
          description: 'Entity not found',
          schema: this.getErrorResponseSchema()
        }
      }
    };

    // Create entity
    endpoints[`POST ${basePath}`] = {
      summary: `Create new ${entityName.toLowerCase()}`,
      description: `Create a new ${entityName.toLowerCase()}`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: this.generateEntitySchema(instance, true) // exclude read-only fields
          }
        }
      },
      responses: {
        201: {
          description: 'Successfully created entity',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: this.generateEntitySchema(instance)
            }
          }
        },
        422: {
          description: 'Validation error',
          schema: this.getValidationErrorSchema()
        }
      }
    };

    // Update entity
    endpoints[`PATCH ${basePath}/{id}`] = {
      summary: `Update ${entityName.toLowerCase()}`,
      description: `Update an existing ${entityName.toLowerCase()}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          type: 'string',
          description: `${entityName} ID`
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: this.generateEntitySchema(instance, true, true) // partial update
          }
        }
      },
      responses: {
        200: {
          description: 'Successfully updated entity',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: this.generateEntitySchema(instance)
            }
          }
        },
        404: {
          description: 'Entity not found',
          schema: this.getErrorResponseSchema()
        },
        422: {
          description: 'Validation error',
          schema: this.getValidationErrorSchema()
        }
      }
    };

    // Delete entity
    endpoints[`DELETE ${basePath}/{id}`] = {
      summary: `Delete ${entityName.toLowerCase()}`,
      description: `Delete an existing ${entityName.toLowerCase()}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          type: 'string',
          description: `${entityName} ID`
        }
      ],
      responses: {
        200: {
          description: 'Successfully deleted entity',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Entity deleted successfully' }
            }
          }
        },
        404: {
          description: 'Entity not found',
          schema: this.getErrorResponseSchema()
        }
      }
    };

    // Search entities
    endpoints[`GET ${basePath}/search`] = {
      summary: `Search ${entityName.toLowerCase()}s`,
      description: `Search ${entityName.toLowerCase()}s by query`,
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: true,
          type: 'string',
          description: 'Search query'
        },
        {
          name: 'limit',
          in: 'query',
          type: 'integer',
          description: 'Maximum number of results (default: 10)'
        }
      ],
      responses: {
        200: {
          description: 'Search results',
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: this.generateEntitySchema(instance)
              },
              metadata: {
                type: 'object',
                properties: {
                  query: { type: 'string' },
                  count: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    };

    return endpoints;
  }

  /**
   * Generate entity schema
   */
  generateEntitySchema(instance, excludeReadOnly = false, partial = false) {
    const schema = {
      type: 'object',
      properties: {}
    };

    // Get sample data to infer schema
    const sampleData = this.generateSampleData(instance);
    
    Object.entries(sampleData).forEach(([key, value]) => {
      if (excludeReadOnly && this.isReadOnlyField(key)) {
        return;
      }

      schema.properties[key] = this.inferFieldSchema(key, value);
    });

    if (!partial) {
      const validationRules = instance.validationSchema?.rules || {};
      schema.required = Object.keys(validationRules).filter(field => 
        validationRules[field].required && !this.isReadOnlyField(field)
      );
    }

    return schema;
  }

  /**
   * Generate validation documentation
   */
  generateValidationDocumentation(validationSchema) {
    if (!validationSchema?.rules) return {};

    const validationDocs = {};

    Object.entries(validationSchema.rules).forEach(([field, rules]) => {
      validationDocs[field] = {
        required: rules.required || false,
        type: rules.type,
        constraints: {}
      };

      if (rules.minLength) validationDocs[field].constraints.minLength = rules.minLength;
      if (rules.maxLength) validationDocs[field].constraints.maxLength = rules.maxLength;
      if (rules.pattern) validationDocs[field].constraints.pattern = rules.pattern.toString();
      if (rules.enum) validationDocs[field].constraints.allowedValues = rules.enum;
      if (rules.custom) validationDocs[field].constraints.customValidation = 'Custom validation function applied';
    });

    return validationDocs;
  }

  /**
   * Generate examples
   */
  generateExamples() {
    const examples = {};

    Object.entries(this.entities).forEach(([name, EntityClass]) => {
      const instance = new EntityClass();
      examples[name] = {
        create: this.generateCreateExample(instance),
        update: this.generateUpdateExample(instance),
        response: this.generateResponseExample(instance)
      };
    });

    return examples;
  }

  /**
   * Generate sample data for an entity
   */
  generateSampleData(instance) {
    const entityName = instance.entityName;
    
    const samples = {
      user: {
        id: 'usr_1234567890',
        email: 'john.doe@example.com',
        full_name: 'John Doe',
        role: 'admin',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      },
      asset: {
        id: 'ast_1234567890',
        name: 'Web Server 01',
        type: 'server',
        ip_address: '192.168.1.100',
        os: 'Ubuntu 20.04',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      },
      finding: {
        id: 'fnd_1234567890',
        title: 'SQL Injection Vulnerability',
        description: 'SQL injection vulnerability found in login form',
        severity: 'high',
        status: 'open',
        asset_id: 'ast_1234567890',
        cvss_score: 7.5,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      }
    };

    return samples[entityName] || {
      id: `${entityName}_1234567890`,
      name: `Sample ${entityName}`,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z'
    };
  }

  /**
   * Helper methods
   */
  isReadOnlyField(field) {
    return ['id', 'created_at', 'updated_at'].includes(field);
  }

  inferFieldSchema(key, value) {
    const schema = {};

    if (typeof value === 'string') {
      schema.type = 'string';
      if (key.includes('email')) {
        schema.format = 'email';
      } else if (key.includes('date') || key.includes('_at')) {
        schema.format = 'date-time';
      } else if (key.includes('url')) {
        schema.format = 'uri';
      }
    } else if (typeof value === 'number') {
      schema.type = Number.isInteger(value) ? 'integer' : 'number';
    } else if (typeof value === 'boolean') {
      schema.type = 'boolean';
    } else if (Array.isArray(value)) {
      schema.type = 'array';
      schema.items = { type: 'string' }; // Default to string items
    } else if (typeof value === 'object' && value !== null) {
      schema.type = 'object';
    }

    schema.example = value;
    return schema;
  }

  getEntityDescription(entityName) {
    const descriptions = {
      User: 'Platform user with role-based access control',
      Organization: 'Organization or tenant in the platform',
      Asset: 'IT asset including servers, workstations, and network devices',
      Finding: 'Security finding or vulnerability discovered during scans',
      Vulnerability: 'Known vulnerability with CVE information',
      Incident: 'Security incident requiring investigation and response',
      Workflow: 'Automated security workflow for SOAR platform',
      Playbook: 'Security playbook with predefined response procedures',
      NetworkDevice: 'Network infrastructure device',
      Partner: 'External security partner for penetration testing',
      ComplianceCheck: 'Compliance framework check and validation',
      Policy: 'Security or operational policy'
    };

    return descriptions[entityName] || `${entityName} entity`;
  }

  getEntityRelationships(entityName) {
    const relationships = {
      User: {
        belongsTo: ['Organization'],
        hasMany: ['Finding', 'Incident']
      },
      Asset: {
        belongsTo: ['Organization'],
        hasMany: ['Finding', 'Vulnerability', 'ComplianceCheck']
      },
      Finding: {
        belongsTo: ['Asset', 'User'],
        hasMany: []
      },
      Incident: {
        belongsTo: ['User'],
        hasMany: ['Finding']
      }
    };

    return relationships[entityName] || {};
  }

  getEntityFilterParameters(instance) {
    const commonFilters = [
      {
        name: 'created_after',
        in: 'query',
        type: 'string',
        format: 'date-time',
        description: 'Filter entities created after this date'
      },
      {
        name: 'created_before',
        in: 'query',
        type: 'string',
        format: 'date-time',
        description: 'Filter entities created before this date'
      }
    ];

    // Add entity-specific filters based on validation schema
    const entityFilters = [];
    const rules = instance.validationSchema?.rules || {};
    
    Object.entries(rules).forEach(([field, rule]) => {
      if (rule.enum) {
        entityFilters.push({
          name: field,
          in: 'query',
          type: 'string',
          enum: rule.enum,
          description: `Filter by ${field}`
        });
      }
    });

    return [...commonFilters, ...entityFilters];
  }

  getStandardResponses() {
    return {
      success: {
        description: 'Standard success response format',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object', description: 'Response data' },
            metadata: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                requestId: { type: 'string' }
              }
            }
          }
        }
      },
      error: {
        description: 'Standard error response format',
        schema: this.getErrorResponseSchema()
      },
      validationError: {
        description: 'Validation error response format',
        schema: this.getValidationErrorSchema()
      }
    };
  }

  getErrorResponseSchema() {
    return {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        status: { type: 'integer', example: 500 },
        message: { type: 'string', example: 'An error occurred' },
        data: { type: 'null' },
        errors: {
          type: 'array',
          items: { type: 'string' }
        },
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' }
          }
        }
      }
    };
  }

  getValidationErrorSchema() {
    return {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        status: { type: 'integer', example: 422 },
        message: { type: 'string', example: 'Validation failed' },
        data: { type: 'null' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' }
            }
          }
        }
      }
    };
  }

  getErrorCodes() {
    return {
      'VALIDATION_ERROR': 'Request data validation failed',
      'AUTHENTICATION_ERROR': 'Authentication failed or token invalid',
      'AUTHORIZATION_ERROR': 'Insufficient permissions',
      'NOT_FOUND': 'Requested resource not found',
      'CONFLICT': 'Resource already exists or conflict detected',
      'RATE_LIMIT': 'Rate limit exceeded',
      'NETWORK_ERROR': 'Network connection failed',
      'TIMEOUT_ERROR': 'Request timeout',
      'SERVER_ERROR': 'Internal server error'
    };
  }

  getCustomEndpoints() {
    return {
      'POST /auth/login': {
        summary: 'User authentication',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { type: 'object' },
                    expires_at: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentication failed',
            schema: this.getErrorResponseSchema()
          }
        }
      },
      'POST /auth/logout': {
        summary: 'User logout',
        description: 'Invalidate current session token',
        responses: {
          200: {
            description: 'Logout successful',
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Logged out successfully' }
              }
            }
          }
        }
      }
    };
  }

  generateCreateExample(instance) {
    const sampleData = this.generateSampleData(instance);
    // Remove read-only fields for create example
    const createData = { ...sampleData };
    delete createData.id;
    delete createData.created_at;
    delete createData.updated_at;
    return createData;
  }

  generateUpdateExample(instance) {
    const createData = this.generateCreateExample(instance);
    // Return partial update example
    const fields = Object.keys(createData);
    const updateFields = fields.slice(0, Math.ceil(fields.length / 2));
    
    const updateData = {};
    updateFields.forEach(field => {
      updateData[field] = createData[field];
    });
    
    return updateData;
  }

  generateResponseExample(instance) {
    return {
      success: true,
      status: 200,
      message: 'Success',
      data: this.generateSampleData(instance),
      metadata: {
        timestamp: '2025-01-01T00:00:00.000Z',
        requestId: 'req_1234567890'
      }
    };
  }

  /**
   * Export documentation as JSON
   */
  exportJson() {
    return JSON.stringify(this.generateDocumentation(), null, 2);
  }

  /**
   * Export documentation as Markdown
   */
  exportMarkdown() {
    const docs = this.generateDocumentation();
    let markdown = `# ${docs.title}\n\n`;
    markdown += `Version: ${docs.version}\n\n`;
    markdown += `${docs.description}\n\n`;
    
    markdown += `## Base URL\n\`\`\`\n${docs.baseUrl}\n\`\`\`\n\n`;
    
    markdown += `## Authentication\n`;
    markdown += `${docs.authentication.description}\n\n`;
    markdown += `**Example:**\n\`\`\`\n${docs.authentication.example}\n\`\`\`\n\n`;
    
    markdown += `## Entities\n\n`;
    Object.entries(docs.entities).forEach(([name, entity]) => {
      markdown += `### ${name}\n`;
      markdown += `${entity.description}\n\n`;
      markdown += `**Endpoint:** \`${entity.endpoint}\`\n\n`;
      markdown += `**Primary Key:** \`${entity.primaryKey}\`\n\n`;
      
      if (Object.keys(entity.validationRules).length > 0) {
        markdown += `**Validation Rules:**\n`;
        Object.entries(entity.validationRules).forEach(([field, rules]) => {
          markdown += `- \`${field}\`: ${rules.required ? 'Required' : 'Optional'} (${rules.type})\n`;
        });
        markdown += `\n`;
      }
    });
    
    return markdown;
  }
}

// Create singleton instance
export const apiDocGenerator = new ApiDocumentationGenerator();

export default apiDocGenerator;
