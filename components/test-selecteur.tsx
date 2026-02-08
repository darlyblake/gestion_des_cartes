/**
 * Composant de test pour vérifier l'affichage des sélecteurs
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { recupererEtablissementsList } from '@/lib/services/api'
import type { Etablissement } from '@/lib/types'

export function TestSelecteur() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    recupererEtablissementsList({ projection: 'light' }).then((etabs) => {
      setEtablissements(etabs)
      if (etabs.length > 0) {
        setSelectedId(etabs[0].id || '')
      }
    })
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Test Sélecteur</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Établissements ({etablissements.length} disponibles)
        </label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un établissement" />
          </SelectTrigger>
          <SelectContent>
            {etablissements.map((etab) => (
              <SelectItem key={etab.id} value={etab.id ?? ''}>
                {etab.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm">Valeur sélectionnée: <strong>{selectedId}</strong></p>
      </div>
    </div>
  )
}
