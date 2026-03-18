/**
 * Page de test pour la carte moderne
 * Affiche toutes les données de l'élève pour vérifier l'affichage
 */

'use client'

import { CarteModerneRectoVerso } from '@/components/cartes/carte-moderne'

// Données de test complètes
const eleveTest = {
  id: '1',
  nom: 'DUPONT',
  prenom: 'Marie',
  matricule: '2024001',
  photo: '/placeholder.svg?height=89&width=69',
  dateNaissance: new Date('2008-05-15'),
  lieuNaissance: 'Paris',
  sexe: 'F' as const,
  nationalite: 'Française',
  classeId: '1',
  etablissementId: '1'
}

const classeTest = {
  id: '1',
  nom: '3ème A',
  niveau: 'Collège',
  effectif: 25,
  etablissementId: '1'
}

const etablissementTest = {
  id: '1',
  nom: 'Lycée Victor Hugo',
  adresse: '15 Rue de la République, 75001 Paris',
  telephone: '01 42 34 56 78',
  email: 'contact@lycee-victor-hugo.fr',
  anneeScolaire: '2024-2025',
  couleur: '#1e40af',
  police: 'Arial',
  signature: '/placeholder.svg?height=30&width=60',
  logo: '/placeholder.svg?height=40&width=40'
}

export default function TestCarteModernePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Carte Moderne</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carte complète */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Carte Complète (Recto-Verso)</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Recto</h3>
                <CarteModerneRectoVerso 
                  eleve={eleveTest}
                  classe={classeTest}
                  etablissement={etablissementTest}
                  face="recto"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Verso</h3>
                <CarteModerneRectoVerso 
                  eleve={eleveTest}
                  classe={classeTest}
                  etablissement={etablissementTest}
                  face="verso"
                />
              </div>
            </div>
          </div>

          {/* Données de l'élève */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Données de l'élève</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium mb-4">Informations personnelles</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Nom :</dt>
                  <dd>{eleveTest.nom}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Prénom :</dt>
                  <dd>{eleveTest.prenom}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Matricule :</dt>
                  <dd>{eleveTest.matricule}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Date de naissance :</dt>
                  <dd>{eleveTest.dateNaissance?.toLocaleDateString('fr-FR')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Lieu de naissance :</dt>
                  <dd>{eleveTest.lieuNaissance}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Sexe :</dt>
                  <dd>{eleveTest.sexe}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Nationalité :</dt>
                  <dd>{eleveTest.nationalite}</dd>
                </div>
              </dl>
              
              <h3 className="font-medium mt-6 mb-4">Classe</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Nom :</dt>
                  <dd>{classeTest.nom}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Niveau :</dt>
                  <dd>{classeTest.niveau}</dd>
                </div>
              </dl>
              
              <h3 className="font-medium mt-6 mb-4">Établissement</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Nom :</dt>
                  <dd>{etablissementTest.nom}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Adresse :</dt>
                  <dd>{etablissementTest.adresse}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Téléphone :</dt>
                  <dd>{etablissementTest.telephone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Email :</dt>
                  <dd>{etablissementTest.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Année scolaire :</dt>
                  <dd>{etablissementTest.anneeScolaire}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Tests avec données manquantes */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Tests avec données manquantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sans lieu de naissance */}
            <div>
              <h3 className="text-sm font-medium mb-2">Sans lieu de naissance</h3>
              <CarteModerneRectoVerso 
                eleve={{...eleveTest, lieuNaissance: 'Non spécifié'}}
                classe={classeTest}
                etablissement={etablissementTest}
                face="recto"
              />
            </div>
            
            {/* Sans nationalité */}
            <div>
              <h3 className="text-sm font-medium mb-2">Sans nationalité</h3>
              <CarteModerneRectoVerso 
                eleve={{...eleveTest, nationalite: undefined}}
                classe={classeTest}
                etablissement={etablissementTest}
                face="recto"
              />
            </div>
            
            {/* Sans sexe */}
            <div>
              <h3 className="text-sm font-medium mb-2">Sans sexe</h3>
              <CarteModerneRectoVerso 
                eleve={{...eleveTest, sexe: 'M' as const}}
                classe={classeTest}
                etablissement={etablissementTest}
                face="recto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
