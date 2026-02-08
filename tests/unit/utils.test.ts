import { describe, it, expect } from 'vitest'
import { clsx } from 'clsx'

/**
 * Test pour les utilitaires
 * Tests pour les fonctions helper du projet
 */

describe('Utility Functions', () => {
  describe('clsx - class merging', () => {
    it('should merge single class', () => {
      const result = clsx('px-4')
      expect(result).toBe('px-4')
    })

    it('should merge multiple classes', () => {
      const result = clsx('px-4', 'py-2', 'bg-blue-500')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = clsx('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should skip falsy conditional classes', () => {
      const isActive = false
      const result = clsx('base-class', isActive && 'active-class')
      expect(result).not.toContain('active-class')
    })

    it('should merge arrays of classes', () => {
      const classes = ['px-4', 'py-2']
      const result = clsx(classes)
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })
  })

  describe('String utilities', () => {
    it('should capitalize string', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('WORLD')
    })

    it('should truncate string', () => {
      const truncate = (str: string, length: number) =>
        str.length > length ? str.slice(0, length) + '...' : str
      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('should slugify string', () => {
      const slugify = (str: string) =>
        str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')

      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Cartes Scolaires')).toBe('cartes-scolaires')
    })
  })

  describe('Array utilities', () => {
    it('should remove duplicates', () => {
      const removeDuplicates = <T,>(arr: T[]) => [...new Set(arr)]
      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(removeDuplicates(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })

    it('should flatten nested arrays', () => {
      const flatten = <T,>(arr: (T | T[])[]): T[] => arr.flat(Infinity) as T[]
      expect(flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, 5])
    })

    it('should chunk array', () => {
      const chunk = <T,>(arr: T[], size: number) => {
        const chunks: T[][] = []
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size))
        }
        return chunks
      }
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })
  })

  describe('Object utilities', () => {
    it('should pick properties from object', () => {
      const pick = <T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]) => {
        const result = {} as Pick<T, K>
        keys.forEach((key) => {
          result[key] = obj[key]
        })
        return result
      }

      const obj = { a: 1, b: 2, c: 3 }
      expect(pick(obj, 'a', 'c')).toEqual({ a: 1, c: 3 })
    })

    it('should omit properties from object', () => {
      const omit = <T extends Record<string, unknown>, K extends keyof T>(obj: T, ...keys: K[]) => {
        const result = { ...obj }
        keys.forEach((key) => {
          delete result[key]
        })
        return result
      }

      const obj = { a: 1, b: 2, c: 3 }
      const result = omit(obj, 'b')
      expect(result).toEqual({ a: 1, c: 3 })
      expect('b' in result).toBe(false)
    })
  })
})
