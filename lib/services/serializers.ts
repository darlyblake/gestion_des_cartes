import { ObjectId } from 'mongodb'

/**
 * Convertit une valeur (string | ObjectId) en ObjectId MongoDB
 */
export function toObjectId(id: string | ObjectId | undefined | null): ObjectId {
  if (id instanceof ObjectId) {
    return id
  }

  if (!id) {
    throw new Error('Identifiant MongoDB manquant ou invalide')
  }

  return new ObjectId(id)
}

/**
 * Type retourné après sérialisation d'un document Mongo
 */
export type SerializedDocument<T> = Omit<T, '_id'> & { id: string }

/**
 * Convertit un document Mongo afin de toujours exposer une propriété `id`
 * côté frontend et éviter l'utilisation directe de `_id`
 */
export function serializeDocument<T extends { _id?: ObjectId }>(
  doc: T | null | undefined
): SerializedDocument<T> | null {
  if (!doc) {
    return null
  }

  const { _id, ...rest } = doc as Record<string, unknown>
  const id =
    _id instanceof ObjectId
      ? _id.toString()
      : typeof _id === 'string'
        ? _id
        : ''

  return {
    id,
    ...rest,
  } as SerializedDocument<T>
}

/**
 * Convertit un document optionnel en ignorant les valeurs nulles
 */
export function serializeOptionalDocument<T extends { _id?: ObjectId }>(
  doc: T | null | undefined
): SerializedDocument<T> | undefined {
  const resultat = serializeDocument(doc)
  return resultat ?? undefined
}

/**
 * Convertit un tableau de documents Mongo en leur équivalent sérialisé
 */
export function serializeDocuments<T extends { _id?: ObjectId }>(docs: T[]): Array<SerializedDocument<T>> {
  return docs
    .map((doc) => serializeDocument(doc))
    .filter((doc): doc is SerializedDocument<T> => Boolean(doc))
}

/**
 * Convertit un champ (référence) ObjectId en string utilisable côté frontend
 */
export function serializeReference(value: ObjectId | string | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value instanceof ObjectId ? value.toString() : value
}
