#!/usr/bin/env node
/**
 * OpenAPI Schema Transformer
 * 
 * This script transforms OpenAPI schemas with discriminated unions (oneOf + allOf + discriminator)
 * into a flattened format that renders better in API documentation tools like Scalar.
 * 
 * The problem:
 * Rust enums with #[serde(tag = "type")] generate schemas like:
 * 
 *   "Format": {
 *     "oneOf": [
 *       {
 *         "allOf": [
 *           { "$ref": "#/components/schemas/JsonFormat" },
 *           { "type": "object", "properties": { "type": { "enum": ["json"] } } }
 *         ],
 *         "title": "Json"
 *       }
 *     ],
 *     "discriminator": { "propertyName": "type" }
 *   }
 * 
 * This allOf composition isn't rendered well by many viewers. This script flattens it to:
 * 
 *   "Format": {
 *     "oneOf": [
 *       { "$ref": "#/components/schemas/Format_Json" }
 *     ],
 *     "discriminator": { 
 *       "propertyName": "type",
 *       "mapping": { "json": "#/components/schemas/Format_Json" }
 *     }
 *   }
 * 
 *   "Format_Json": {
 *     "type": "object",
 *     "title": "Json",
 *     "required": ["type", ...],
 *     "properties": {
 *       "type": { "type": "string", "enum": ["json"] },
 *       ...JsonFormat properties...
 *     }
 *   }
 * 
 * Usage:
 *   node scripts/transform-openapi.js [input.json] [output.json]
 *   node scripts/transform-openapi.js  # uses api-spec.json -> public/api-spec.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default paths
const defaultInput = path.join(__dirname, '..', 'api-spec.json');
const defaultOutput = path.join(__dirname, '..', 'public', 'api-spec.json');

const inputPath = process.argv[2] || defaultInput;
const outputPath = process.argv[3] || defaultOutput;

/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Resolve a $ref to its schema
 */
function resolveRef(spec, ref) {
  if (!ref.startsWith('#/components/schemas/')) {
    return null;
  }
  const schemaName = ref.replace('#/components/schemas/', '');
  return spec.components?.schemas?.[schemaName];
}

/**
 * Extract the schema name from a $ref
 */
function getRefName(ref) {
  return ref.replace('#/components/schemas/', '');
}

/**
 * Merge two objects, with the second taking precedence
 */
function mergeObjects(base, overlay) {
  const result = deepClone(base);
  
  for (const key of Object.keys(overlay)) {
    if (key === 'properties' && result.properties) {
      result.properties = { ...result.properties, ...overlay.properties };
    } else if (key === 'required' && result.required) {
      result.required = [...new Set([...result.required, ...overlay.required])];
    } else {
      result[key] = overlay[key];
    }
  }
  
  return result;
}

/**
 * Check if a oneOf variant uses allOf with a $ref
 */
function isAllOfVariant(variant) {
  return variant.allOf && 
         Array.isArray(variant.allOf) && 
         variant.allOf.some(item => item.$ref) &&
         variant.allOf.some(item => item.properties);
}

/**
 * Flatten an allOf variant by merging the referenced schema with the discriminator properties
 */
function flattenAllOfVariant(spec, variant, discriminatorProp) {
  const allOf = variant.allOf;
  
  // Find the $ref and the inline object with discriminator
  const refItem = allOf.find(item => item.$ref);
  const inlineItems = allOf.filter(item => !item.$ref);
  
  if (!refItem) {
    return null;
  }
  
  // Resolve the referenced schema
  const refSchema = resolveRef(spec, refItem.$ref);
  if (!refSchema) {
    console.warn(`Could not resolve ref: ${refItem.$ref}`);
    return null;
  }
  
  // Start with the referenced schema
  let flattened = deepClone(refSchema);
  
  // Merge in all inline items
  for (const inlineItem of inlineItems) {
    flattened = mergeObjects(flattened, inlineItem);
  }
  
  // Preserve the title from the variant
  if (variant.title) {
    flattened.title = variant.title;
  }
  
  // Extract the discriminator value for the mapping
  let discriminatorValue = null;
  for (const inlineItem of inlineItems) {
    if (inlineItem.properties?.[discriminatorProp]?.enum?.[0]) {
      discriminatorValue = inlineItem.properties[discriminatorProp].enum[0];
      break;
    }
  }
  
  return {
    schema: flattened,
    discriminatorValue,
    originalRef: getRefName(refItem.$ref)
  };
}

/**
 * Check if a schema has inline variants that should be extracted
 */
function hasInlineVariants(schema) {
  return schema.oneOf?.some(variant => 
    // Has allOf with $ref (complex variant)
    isAllOfVariant(variant) ||
    // Or is an inline object with a title (simple variant)
    (variant.type === 'object' && variant.title)
  );
}

/**
 * Transform a schema with discriminated oneOf into inline variants
 * This creates fully inlined oneOf without $ref for better Scalar rendering
 */
function transformDiscriminatedSchema(spec, schemaName, schema, newSchemas) {
  if (!schema.oneOf || !schema.discriminator) {
    return schema;
  }
  
  const discriminatorProp = schema.discriminator.propertyName;
  
  console.log(`Transforming schema: ${schemaName}`);
  
  const newOneOf = [];
  const mapping = {};
  
  for (const variant of schema.oneOf) {
    if (isAllOfVariant(variant)) {
      // Flatten this variant by merging $ref with discriminator
      const result = flattenAllOfVariant(spec, variant, discriminatorProp);
      
      if (result) {
        // Also create a named schema for the Models section
        const variantName = `${schemaName}_${variant.title || result.originalRef}`;
        newSchemas[variantName] = result.schema;
        
        // Inline the full schema in oneOf for better rendering
        newOneOf.push(result.schema);
        
        // Add to discriminator mapping
        if (result.discriminatorValue) {
          mapping[result.discriminatorValue] = `#/components/schemas/${variantName}`;
        }
      } else {
        // Keep original if flattening failed
        newOneOf.push(variant);
      }
    } else {
      // Simple variant (already inline object)
      const discriminatorValue = variant.properties?.[discriminatorProp]?.enum?.[0];
      
      if (variant.title && discriminatorValue) {
        // Create a named schema for the Models section
        const variantName = `${schemaName}_${variant.title}`;
        newSchemas[variantName] = deepClone(variant);
        mapping[discriminatorValue] = `#/components/schemas/${variantName}`;
      }
      
      // Keep inline in oneOf
      newOneOf.push(deepClone(variant));
    }
  }
  
  // Build the transformed schema with inline variants
  const transformed = {
    oneOf: newOneOf,
    discriminator: {
      propertyName: discriminatorProp
    }
  };
  
  // Add mapping if we have entries
  if (Object.keys(mapping).length > 0) {
    transformed.discriminator.mapping = mapping;
  }
  
  // Preserve description if present
  if (schema.description) {
    transformed.description = schema.description;
  }
  
  return transformed;
}

/**
 * Simplify allOf wrappers that just contain a single $ref
 * These are generated by utoipa for nullable fields: { "allOf": [{ "$ref": "..." }], "nullable": true }
 * Transform to: { "$ref": "...", "nullable": true }
 */
function simplifyAllOfRef(obj) {
  if (obj.allOf && 
      Array.isArray(obj.allOf) && 
      obj.allOf.length === 1 && 
      obj.allOf[0].$ref) {
    const simplified = { $ref: obj.allOf[0].$ref };
    // Preserve other properties like nullable
    for (const key of Object.keys(obj)) {
      if (key !== 'allOf') {
        simplified[key] = obj[key];
      }
    }
    return simplified;
  }
  return obj;
}

/**
 * Recursively simplify allOf wrappers throughout the spec
 */
function simplifyAllOfRefs(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => simplifyAllOfRefs(item));
  }
  
  // First simplify this object if it's an allOf wrapper
  let simplified = simplifyAllOfRef(obj);
  
  // Then recursively process all properties
  const result = {};
  for (const [key, value] of Object.entries(simplified)) {
    result[key] = simplifyAllOfRefs(value);
  }
  
  return result;
}

/**
 * Main transformation function
 */
function transformSpec(spec) {
  const result = deepClone(spec);
  const newSchemas = {};
  
  // First pass: identify and transform schemas with discriminators
  const schemasToTransform = [];
  
  for (const [name, schema] of Object.entries(result.components?.schemas || {})) {
    if (schema.oneOf && schema.discriminator) {
      schemasToTransform.push(name);
    }
  }
  
  // Transform each schema
  for (const name of schemasToTransform) {
    const schema = result.components.schemas[name];
    result.components.schemas[name] = transformDiscriminatedSchema(
      result, 
      name, 
      schema, 
      newSchemas
    );
  }
  
  // Add all new schemas
  for (const [name, schema] of Object.entries(newSchemas)) {
    result.components.schemas[name] = schema;
  }
  
  // Second pass: simplify allOf wrappers around single $refs throughout the spec
  console.log('Simplifying allOf wrappers...');
  const simplified = simplifyAllOfRefs(result);
  
  // Sort schemas alphabetically for cleaner output
  const sortedSchemas = {};
  for (const key of Object.keys(simplified.components.schemas).sort()) {
    sortedSchemas[key] = simplified.components.schemas[key];
  }
  simplified.components.schemas = sortedSchemas;
  
  return simplified;
}

/**
 * Main entry point
 */
function main() {
  console.log(`Reading: ${inputPath}`);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }
  
  const inputContent = fs.readFileSync(inputPath, 'utf8');
  const spec = JSON.parse(inputContent);
  
  console.log('Transforming OpenAPI spec...');
  const transformed = transformSpec(spec);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Writing: ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2) + '\n');
  
  // Count transformations
  const originalSchemaCount = Object.keys(spec.components?.schemas || {}).length;
  const newSchemaCount = Object.keys(transformed.components?.schemas || {}).length;
  const addedSchemas = newSchemaCount - originalSchemaCount;
  
  console.log(`Done! Added ${addedSchemas} flattened variant schemas.`);
}

main();
