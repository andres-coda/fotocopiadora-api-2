import { Base } from "@src/base/entity/base.entity";
import { NestedRelations, RelationKeys, RelationsKey, SelectedDeep } from "@src/base/interface/base.interface";

export const BASE_RELATIONS: RelationsKey<any> = {
  relations: ['user'],
  nestedRelations: {}
};

export const SELECTED_BASE: SelectedDeep<Base> = {
  id:true,
  deleted:true,
  'user': {
    id: true,
  },
}

export function mergeSimpleRelations<T>(
  base: Array<RelationKeys<T>> | undefined,
  input: Array<RelationKeys<T>> | undefined
): Array<RelationKeys<T>> {
  const baseRels = base || [];
  const inputRels = input || [];
  return Array.from(new Set([...baseRels, ...inputRels]));
}

export function mergeNestedRelations<T>(
  base: NestedRelations<T> | undefined,
  input: NestedRelations<T> | undefined
): NestedRelations<T> | undefined {
  if (!base && !input) return undefined;
  if (!base) return input;
  if (!input) return base;

  const result: any = { ...base };

  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const baseValue = base[key as keyof typeof base];
      const inputValue = input[key as keyof typeof input];

      if (baseValue && inputValue && typeof baseValue === 'object' && typeof inputValue === 'object') {
        // Mergear recursivamente
        result[key] = mergeNestedRelations(baseValue as any, inputValue as any);
      } else {
        // Si no existe en base o no es objeto, usar el valor de input
        result[key] = inputValue;
      }
    }
  }

  return result;
}

export function mergeRelationsBase<T extends Base>(
  input?: RelationsKey<T> | readonly RelationsKey<T>[]
): RelationsKey<T> {
  if (!input) return BASE_RELATIONS;

  const inputArray = Array.isArray(input) ? input : [input];

  let mergedRelations: RelationKeys<T>[] = [];
  let mergedNestedRelations: NestedRelations<T> | undefined = undefined;

  for (const item of inputArray) {
    mergedRelations = mergeSimpleRelations(mergedRelations, item.relations);
    mergedNestedRelations = mergeNestedRelations(mergedNestedRelations, item.nestedRelations);
  }
  return {
    relations: mergedRelations,
    nestedRelations: mergedNestedRelations
  };
}

export function relacionesAString<T extends Base>(
  relationsKey?: RelationsKey<T>
): string[] {
  if (!relationsKey) return [];

  const result: string[] = [];

  // 1. Agregar las relaciones simples
  if (relationsKey.relations) {
    result.push(...relationsKey.relations as string[]);
  }

  // 2. Procesar y agregar las relaciones anidadas
  if (relationsKey.nestedRelations) {
    const nestedFlattened = flattenNestedRelations(relationsKey.nestedRelations);
    result.push(...nestedFlattened);
  }

  // 3. Eliminar duplicados y retornar
  return Array.from(new Set(result));
}

// Función auxiliar para aplanar las relaciones anidadas
function flattenNestedRelations<T>(
  nested?: NestedRelations<T>,
  prefix: string = ''
): string[] {
  if (!nested) return [];

  const result: string[] = [];

  for (const key in nested) {
    if (Object.prototype.hasOwnProperty.call(nested, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      result.push(currentPath);

      const nestedValue = nested[key as keyof NestedRelations<T>];

      if (nestedValue && typeof nestedValue === 'object') {
        result.push(
          ...flattenNestedRelations<unknown>(
            nestedValue as NestedRelations<unknown>,
            currentPath
          )
        );
      }
    }
  }

  return result;
}