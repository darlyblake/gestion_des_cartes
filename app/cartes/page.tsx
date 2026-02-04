/**
 * Page de génération des cartes scolaires
 * Permet de :
 * - Sélectionner un élève ou une classe entière
 * - Choisir un template (classique, moderne, examen, recto-verso)
 * - Générer/exporter les cartes en PNG ou PDF
 * - Imprimer les cartes
 */

'use client'

import '@/styles/page-cartes.css'
import type { ComponentType, SVGProps } from 'react'
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { useNotification } from '@/components/notification'
import { Download, Printer, CreditCard, RefreshCw, FileText, Users, IdCard } from 'lucide-react'
import {
  recupererEleves,
  recupererClasses,
  recupererEtablissementsOptions,
  recupererPersonnel,
} from '@/lib/services/api'
import {
  CarteClassique,
  CarteModerne,
  CarteRectoVerso,
  CartePersonnel,
  TEMPLATES_CARTES,
  type TypeTemplate,
} from '@/components/cartes'
import type { Eleve, Classe, Etablissement, Personnel, RolePersonnel } from '@/lib/types'

/**
 * Type étendu pour élève avec classe et établissement
 */
interface EleveComplet extends Eleve {
  classe?: Classe
  etablissement?: Etablissement
}

const ROLE_LABELS: Record<RolePersonnel, string> = {
  directeur: 'Directeur',
  enseignant: 'Enseignant',
  censeur: 'Censeur',
  surveillant: 'Surveillant Général',
  informaticien: 'Informaticien',
  secretaire: 'Secrétaire',
  gestionnaire: 'Gestionnaire',
  infirmier: 'Infirmier',
  bibliothecaire: 'Bibliothécaire',
  autre: 'Autre',
}

type EntityWithMongoId = {
  id?: string | null
  _id?: string | { toString(): string }
}

const resolveId = (entity?: EntityWithMongoId | null): string => {
  if (!entity) return ''

  const rawId = entity._id
  if (typeof rawId === 'string') {
    return rawId
  }

  if (rawId && typeof rawId.toString === 'function') {
    return rawId.toString()
  }

  return entity.id ?? ''
}

/**
 * Composant interne avec useSearchParams
 */
function ContenuPageCartes() {
  const parametres = useSearchParams()
  const eleveIdDefaut = parametres.get('eleveId') || ''
  const classeIdDefaut = parametres.get('classeId') || ''
  const personnelIdDefaut = parametres.get('personnelId') || ''
  const modeDefaut = (parametres.get('mode') as 'eleve' | 'classe' | 'personnel' | null) || 'eleve'
  const { afficherNotification } = useNotification()
  const carteRef = useRef<HTMLDivElement>(null)
  const cartesClasseRef = useRef<HTMLDivElement>(null)

  // États
  const [eleves, setEleves] = useState<EleveComplet[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [personnels, setPersonnels] = useState<Personnel[]>([])
  const [eleveSelectionne, setEleveSelectionne] = useState<string>(eleveIdDefaut)
  const [classeSelectionnee, setClasseSelectionnee] = useState<string>(classeIdDefaut)
  const [personnelSelectionne, setPersonnelSelectionne] = useState<string>(personnelIdDefaut)
  const [etablissementSelectionne, setEtablissementSelectionne] = useState<string>('all')
  const [templateSelectionne, setTemplateSelectionne] = useState<TypeTemplate>('recto-verso')
  const [avecQrCode, setAvecQrCode] = useState(true)
  const [enChargement, setEnChargement] = useState(true)
  const [enExport, setEnExport] = useState(false)
  const [modeAffichage, setModeAffichage] = useState<'eleve' | 'classe' | 'personnel'>(modeDefaut)
  const [selectOuvert, setSelectOuvert] = useState<'eleve' | 'classe' | 'etablissement' | 'personnel' | null>(null)

  // Chargement des données initiales
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [repEleves, repClasses, repEtab, repPersonnel] = await Promise.all([
          recupererEleves(),
          recupererClasses(),
          recupererEtablissementsOptions({ projection: 'light' }),
          recupererPersonnel(),
        ])

        if (repEleves.succes && repEleves.donnees) {
          setEleves(repEleves.donnees as EleveComplet[])
        }

        if (repClasses.succes && repClasses.donnees) {
          setClasses(repClasses.donnees)
        }

        if (repEtab.succes && repEtab.donnees) {
          setEtablissements(repEtab.donnees)
        }

        if (repPersonnel.succes && repPersonnel.donnees) {
          setPersonnels(repPersonnel.donnees)
        }
      } catch (erreur) {
        console.error('Erreur:', erreur)
        afficherNotification('erreur', 'Erreur lors du chargement des données')
      } finally {
        setEnChargement(false)
      }
    }

    chargerDonnees()
  }, [afficherNotification])

  // Récupération de l'élève sélectionné avec ses détails
  const eleve = useMemo(
    () => eleves.find((e) => resolveId(e) === eleveSelectionne),
    [eleveSelectionne, eleves],
  )

  const classe = useMemo(() => {
    if (eleve) {
      return classes.find((c) => resolveId(c) === eleve.classeId)
    }
    if (!classeSelectionnee) return undefined
    return classes.find((c) => resolveId(c) === classeSelectionnee)
  }, [classeSelectionnee, classes, eleve])

  const etablissement = useMemo(() => {
    if (!classe) return undefined
    return etablissements.find((e) => resolveId(e) === classe.etablissementId)
  }, [classe, etablissements])

  const membrePersonnel = useMemo(
    () => personnels.find((p) => resolveId(p) === personnelSelectionne),
    [personnelSelectionne, personnels],
  )

  const etablissementPersonnel = useMemo(() => {
    if (!membrePersonnel) return undefined
    const etabId = membrePersonnel.etablissementId || resolveId(membrePersonnel.etablissement)
    if (!etabId) return undefined
    return etablissements.find((e) => resolveId(e) === etabId) || membrePersonnel.etablissement
  }, [etablissements, membrePersonnel])

  // Élèves de la classe sélectionnée
  const elevesClasse = useMemo(() => {
    if (!classeSelectionnee) return []
    return eleves.filter((e) => e.classeId === classeSelectionnee)
  }, [classeSelectionnee, eleves])

  const classesFiltrees = useMemo(() => {
    if (etablissementSelectionne === 'all') return classes
    return classes.filter((c) => c.etablissementId === etablissementSelectionne)
  }, [classes, etablissementSelectionne])

  useEffect(() => {
    if (etablissementSelectionne === 'all' || !classeSelectionnee) return
    const classeToujoursValide = classes.some(
      (c) =>
        c.etablissementId === etablissementSelectionne &&
        resolveId(c) === classeSelectionnee,
    )
    if (!classeToujoursValide) {
      setClasseSelectionnee('')
    }
  }, [classes, classeSelectionnee, etablissementSelectionne])

  useEffect(() => {
    const fermerSelects = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') {
          setSelectOuvert(null)
        }
        return
      }

      const cible = event.target as HTMLElement | null
      if (!cible?.closest('.cards-select')) {
        setSelectOuvert(null)
      }
    }

    document.addEventListener('click', fermerSelects)
    document.addEventListener('touchstart', fermerSelects)
    document.addEventListener('keydown', fermerSelects)

    return () => {
      document.removeEventListener('click', fermerSelects)
      document.removeEventListener('touchstart', fermerSelects)
      document.removeEventListener('keydown', fermerSelects)
    }
  }, [])

  const handleSelectButtonClick = (
    cle: 'eleve' | 'classe' | 'etablissement' | 'personnel',
  ) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setSelectOuvert((prev) => (prev === cle ? null : cle))
    }

  const handleSelectItemClick = (
    setter: (valeur: string) => void,
    valeur: string,
  ) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      setter(valeur)
      setSelectOuvert(null)
    }

  /**
   * Télécharge la carte en image PNG
   */
  const telechargerCarte = async (nomFichier: string) => {
    if (!carteRef.current) return

    try {
      setEnExport(true)
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(carteRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (doc) => {
          try {
            const win = (doc.defaultView || window) as Window
            const root = doc.querySelector('.carte-scolaire') || doc.body
            const elements = root.querySelectorAll('*')

            const propsToCheck = [
              'background-color',
              'background',
              'color',
              'border-color',
              'box-shadow',
              'outline-color',
              'fill',
              'stroke',
            ]

            elements.forEach((el) => {
              const cs = win.getComputedStyle(el as Element)
              if (!cs) return

              for (const prop of propsToCheck) {
                try {
                  const val = cs.getPropertyValue(prop)
                  if (val && (val.includes('lab(') || val.includes('lch(') || val.includes('color('))) {
                    // override with safe fallbacks
                    if (prop.includes('background')) {
                      ;(el as HTMLElement).style.setProperty('background-color', '#ffffff')
                    } else if (prop === 'color' || prop === 'fill' || prop === 'stroke') {
                      ;(el as HTMLElement).style.setProperty('color', '#121318')
                    } else if (prop.includes('border') || prop === 'outline-color') {
                      ;(el as HTMLElement).style.setProperty('border-color', '#e5e7eb')
                    } else if (prop === 'box-shadow') {
                      ;(el as HTMLElement).style.setProperty('box-shadow', 'none')
                    }
                  }
                } catch {
                  // ignore inaccessible properties
                }
              }
            })

            // Add a fallback stylesheet to override any remaining lab() usages
            try {
              const style = doc.createElement('style')
              style.textContent = `
                .carte-scolaire, .carte-scolaire * {
                  background-color: #ffffff !important;
                  color: #121318 !important;
                  border-color: #e5e7eb !important;
                  box-shadow: none !important;
                }
              `
              ;(doc.head || doc.body).appendChild(style)
            } catch {
              // ignore
            }
          } catch (e) {
            // Ne pas bloquer le rendu si l'opération échoue
            console.warn('onclone color sanitize failed', e)
          }
        },
      })

      const lien = document.createElement('a')
      const safeName = nomFichier.replace(/\s+/g, '-').toLowerCase()
      lien.download = `${safeName || 'carte'}.png`
      lien.href = canvas.toDataURL('image/png')
      lien.click()

      afficherNotification('succes', 'Carte téléchargée avec succès')
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors du téléchargement')
    } finally {
      setEnExport(false)
    }
  }

  /**
   * Génère un PDF avec toutes les cartes d'une classe
   */
  const genererPdfClasse = useCallback(async () => {
    if (!cartesClasseRef.current || elevesClasse.length === 0) return

    try {
      setEnExport(true)
      afficherNotification('info', `Génération du PDF pour ${elevesClasse.length} élèves...`)

      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      // Créer un nouveau document PDF
      // Format A4 : 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Dimensions de la carte en mm (CR80)
      const largeurCarte = 85.6
      const hauteurCarte = templateSelectionne === 'recto-verso' ? 108 : 54
      const marge = 10
      const espacementX = 5
      const espacementY = 8

      // Calcul du nombre de cartes par page
      const cartesParLigne = 2
      let posX = marge
      let posY = marge
      let carteIndex = 0

      // Récupérer tous les éléments de carte
      const cartesElements = cartesClasseRef.current.querySelectorAll('.carte-eleve-container')

      for (let i = 0; i < cartesElements.length; i++) {
        const carteElement = cartesElements[i] as HTMLElement

        // Convertir la carte en canvas
        const canvas = await html2canvas(carteElement, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (doc) => {
            try {
              const win = (doc.defaultView || window) as Window
              const root = doc.querySelector('.carte-scolaire') || doc.body
              const elements = root.querySelectorAll('*')

              const propsToCheck = [
                'background-color',
                'background',
                'color',
                'border-color',
                'box-shadow',
                'outline-color',
                'fill',
                'stroke',
              ]

              elements.forEach((el) => {
                const cs = win.getComputedStyle(el as Element)
                if (!cs) return

                for (const prop of propsToCheck) {
                  try {
                    const val = cs.getPropertyValue(prop)
                    if (val && (val.includes('lab(') || val.includes('lch(') || val.includes('color('))) {
                      // override with safe fallbacks
                      if (prop.includes('background')) {
                        ;(el as HTMLElement).style.setProperty('background-color', '#ffffff')
                      } else if (prop === 'color' || prop === 'fill' || prop === 'stroke') {
                        ;(el as HTMLElement).style.setProperty('color', '#121318')
                      } else if (prop.includes('border') || prop === 'outline-color') {
                        ;(el as HTMLElement).style.setProperty('border-color', '#e5e7eb')
                      } else if (prop === 'box-shadow') {
                        ;(el as HTMLElement).style.setProperty('box-shadow', 'none')
                      }
                    }
                  } catch {
                    // ignore inaccessible properties
                  }
                }
              })

              // Add a fallback stylesheet to override any remaining lab() usages
              try {
                const style = doc.createElement('style')
                style.textContent = `
                  .carte-scolaire, .carte-scolaire * {
                    background-color: #ffffff !important;
                    color: #121318 !important;
                    border-color: #e5e7eb !important;
                    box-shadow: none !important;
                  }
                `
                ;(doc.head || doc.body).appendChild(style)
              } catch {
                // ignore
              }
            } catch (e) {
              console.warn('onclone color sanitize failed', e)
            }
          },
        })

        // Ajouter l'image au PDF
        const imgData = canvas.toDataURL('image/png')
        
        // Nouvelle page si nécessaire
        if (posY + hauteurCarte > 297 - marge) {
          pdf.addPage()
          posX = marge
          posY = marge
          carteIndex = 0
        }

        pdf.addImage(imgData, 'PNG', posX, posY, largeurCarte, hauteurCarte)

        // Passer à la position suivante
        carteIndex++
        if (carteIndex % cartesParLigne === 0) {
          posX = marge
          posY += hauteurCarte + espacementY
        } else {
          posX += largeurCarte + espacementX
        }
      }

      // Télécharger le PDF
      const nomClasse = classe?.nom.replace(/[^a-zA-Z0-9]/g, '_') || 'classe'
      pdf.save(`cartes-${nomClasse}-${etablissement?.anneeScolaire || ''}.pdf`)

      afficherNotification('succes', `PDF généré avec ${elevesClasse.length} cartes`)
    } catch (erreur) {
      console.error('Erreur génération PDF:', erreur)
      afficherNotification('erreur', 'Erreur lors de la génération du PDF')
    } finally {
      setEnExport(false)
    }
  }, [elevesClasse, classe, etablissement, templateSelectionne, afficherNotification])

  /**
   * Imprime la carte
   */
  const imprimerCarte = () => {
    const ref = modeAffichage === 'classe' ? cartesClasseRef.current : carteRef.current
    if (!ref) return

    const contenuOriginal = document.body.innerHTML
    const contenuCarte = ref.outerHTML

    const styleImpression = `
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .carte-scolaire, .carte-eleve-container { 
            margin: 10px auto;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            page-break-inside: avoid;
          }
        }
      </style>
    `

    document.body.innerHTML = styleImpression + contenuCarte
    window.print()
    document.body.innerHTML = contenuOriginal
    window.location.reload()
  }

  /**
   * Rendu d'une carte selon le template
   */
  const rendreCarte = (eleveData: Eleve, classeData: Classe, etabData: Etablissement) => {
    const props = {
      eleve: eleveData,
      classe: classeData,
      etablissement: etabData,
      avecQrCode,
    }

    switch (templateSelectionne) {
      case 'classique':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <CarteClassique {...props} />
              <div className="text-center mt-2 text-xs text-gray-400">RECTO</div>
            </div>
            <div>
              <CarteRectoVerso {...props} face="verso" />
              <div className="text-center mt-2 text-xs text-gray-400">VERSO</div>
            </div>
          </div>
        )
      case 'moderne':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <CarteModerne {...props} />
              <div className="text-center mt-2 text-xs text-gray-400">RECTO</div>
            </div>
          </div>
        )
      case 'recto-verso':
        return <CarteRectoVerso {...props} face="les-deux" />
      default:
        return (
          <div className="flex flex-col gap-4">
            <div>
              <CarteClassique {...props} />
              <div className="text-center mt-2 text-xs text-gray-400">RECTO</div>
            </div>
            <div>
              <CarteRectoVerso {...props} face="verso" />
              <div className="text-center mt-2 text-xs text-gray-400">VERSO</div>
            </div>
          </div>
        )
    }
  }

  if (enChargement) {
    return <ChargementPage message="Chargement des données..." />
  }

  const ModeButton = (
    valeur: 'eleve' | 'classe' | 'personnel',
    label: string,
    Icone: ComponentType<SVGProps<SVGSVGElement>>,
  ) => (
    <button
      type="button"
      className={`cards-mode-button ${modeAffichage === valeur ? 'active' : ''}`}
      onClick={() => setModeAffichage(valeur)}
    >
      <Icone />
      {label}
    </button>
  )

  const SelectTrigger = (
    cle: 'eleve' | 'classe' | 'etablissement' | 'personnel',
    affichage: string,
  ) => (
    <button
      type="button"
      className="cards-select-trigger"
      onClick={handleSelectButtonClick(cle)}
      aria-expanded={selectOuvert === cle}
      aria-haspopup="listbox"
    >
      <span>{affichage}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )

  return (
    <div className="cards-generation-container">
      <div className="cards-generation-content">
        <header className="cards-generation-header">
          <h1 className="cards-generation-title">Génération de cartes</h1>
          <p className="cards-generation-subtitle">
            Créez et exportez des cartes scolaires personnalisées
          </p>
        </header>

        <div className="cards-generation-grid">
          <section className="cards-generation-card">
            <div className="cards-generation-card-header">
              <h2 className="cards-generation-card-title">
                <CreditCard />
                Configuration
              </h2>
            </div>
            <div className="cards-generation-card-content">
              <div className="cards-mode-selection">
                <span className="cards-mode-label">Mode de génération</span>
                <div className="cards-mode-buttons">
                  {ModeButton('eleve', 'Un élève', CreditCard)}
                  {ModeButton('classe', 'Une classe', Users)}
                  {ModeButton('personnel', 'Personnel', IdCard)}
                </div>
              </div>

              {modeAffichage === 'eleve' && (
                <div className="cards-select-group">
                  <label className="cards-select-label">Élève</label>
                  <div className="cards-select">
                    {SelectTrigger(
                      'eleve',
                      eleve
                        ? `${eleve.prenom} ${eleve.nom} - ${eleve.matricule}`
                        : 'Sélectionner un élève',
                    )}
                    {selectOuvert === 'eleve' && (
                      <div className="cards-select-content" role="listbox">
                        {eleves.map((e, idx) => {
                          const valeur = resolveId(e) || e.matricule || `eleve-${idx}`
                          const actif = eleveSelectionne === valeur
                          return (
                            <button
                              key={valeur}
                              type="button"
                              className={`cards-select-item ${actif ? 'active' : ''}`}
                              onClick={handleSelectItemClick(setEleveSelectionne, valeur)}
                            >
                              {e.prenom} {e.nom} - {e.matricule}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modeAffichage === 'classe' && (
                <>
                  <div className="cards-select-group">
                    <label className="cards-select-label">Établissement</label>
                    <div className="cards-select">
                      {SelectTrigger(
                        'etablissement',
                        etablissementSelectionne === 'all'
                          ? 'Tous les établissements'
                          : etablissements.find((e) => resolveId(e) === etablissementSelectionne)?.nom ||
                              'Établissement',
                      )}
                      {selectOuvert === 'etablissement' && (
                        <div className="cards-select-content" role="listbox">
                          <button
                            type="button"
                            className={`cards-select-item ${etablissementSelectionne === 'all' ? 'active' : ''}`}
                            onClick={handleSelectItemClick(setEtablissementSelectionne, 'all')}
                          >
                            Tous les établissements
                          </button>
                          {etablissements.map((etab, idx) => {
                            const valeur = resolveId(etab) || etab.nom || `etab-${idx}`
                            const actif = etablissementSelectionne === valeur
                            return (
                              <button
                                key={valeur}
                                type="button"
                                className={`cards-select-item ${actif ? 'active' : ''}`}
                                onClick={handleSelectItemClick(setEtablissementSelectionne, valeur)}
                              >
                                {etab.nom}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cards-select-group">
                    <label className="cards-select-label">Classe</label>
                    <div className="cards-select">
                      {SelectTrigger(
                        'classe',
                        classeSelectionnee
                          ? classes.find((c) => resolveId(c) === classeSelectionnee)?.nom || 'Classe'
                          : 'Sélectionner une classe',
                      )}
                      {selectOuvert === 'classe' && (
                        <div className="cards-select-content" role="listbox">
                          {classesFiltrees.map((c, idx) => {
                            const valeur = resolveId(c) || `${c.nom}-${c.niveau}-${idx}`
                            const actif = classeSelectionnee === valeur
                            return (
                              <button
                                key={valeur}
                                type="button"
                                className={`cards-select-item ${actif ? 'active' : ''}`}
                                onClick={handleSelectItemClick(setClasseSelectionnee, valeur)}
                              >
                                {c.nom} - {c.niveau}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {classeSelectionnee && (
                    <div className="cards-students-count">
                      {elevesClasse.length} élève{elevesClasse.length > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              )}

              {modeAffichage === 'personnel' && (
                <div className="cards-select-group">
                  <label className="cards-select-label">Personnel</label>
                  <div className="cards-select">
                    {SelectTrigger(
                      'personnel',
                      membrePersonnel
                        ? `${membrePersonnel.prenom} ${membrePersonnel.nom} · ${ROLE_LABELS[membrePersonnel.role]}`
                        : 'Sélectionner un membre du personnel',
                    )}
                    {selectOuvert === 'personnel' && (
                      <div className="cards-select-content" role="listbox">
                        {personnels.map((p, idx) => {
                          const valeur = resolveId(p) || p.id || `personnel-${idx}`
                          const actif = personnelSelectionne === valeur
                          return (
                            <button
                              key={valeur}
                              type="button"
                              className={`cards-select-item ${actif ? 'active' : ''}`}
                              onClick={handleSelectItemClick(setPersonnelSelectionne, valeur)}
                            >
                              {p.prenom} {p.nom} · {ROLE_LABELS[p.role] || p.role}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {modeAffichage !== 'personnel' && (
                <div className="cards-select-group">
                  <label className="cards-select-label">Template</label>
                  <div className="cards-templates-grid">
                    {TEMPLATES_CARTES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={`cards-template-option ${templateSelectionne === template.id ? 'selected' : ''}`}
                        onClick={() => setTemplateSelectionne(template.id)}
                      >
                        <span className="cards-template-indicator" />
                        <div className="cards-template-info">
                          <div className="cards-template-name">{template.nom}</div>
                          <div className="cards-template-description">{template.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="cards-qrcode-option">
                <div className="cards-qrcode-info">
                  <span className="cards-qrcode-label">QR Code</span>
                  <span className="cards-qrcode-description">
                    Ajouter un QR Code de vérification
                  </span>
                </div>
                <button
                  type="button"
                  className={`cards-qrcode-toggle ${avecQrCode ? 'active' : ''}`}
                  onClick={() => setAvecQrCode((etat) => !etat)}
                  aria-pressed={avecQrCode}
                />
              </div>

              <div className="cards-action-buttons">
                {modeAffichage === 'eleve' && (
                  <>
                    <button
                      type="button"
                      className="cards-action-button primary"
                      onClick={() => telechargerCarte(`carte-${eleve?.matricule || 'eleve'}`)}
                      disabled={!eleve || !classe || !etablissement || enExport}
                    >
                      <Download />
                      {enExport ? 'Téléchargement...' : 'Télécharger (PNG)'}
                    </button>
                    <button
                      type="button"
                      className="cards-action-button secondary"
                      onClick={imprimerCarte}
                      disabled={!eleve || !classe || !etablissement}
                    >
                      <Printer />
                      Imprimer
                    </button>
                  </>
                )}

                {modeAffichage === 'classe' && (
                  <>
                    <button
                      type="button"
                      className="cards-action-button primary"
                      onClick={genererPdfClasse}
                      disabled={elevesClasse.length === 0 || enExport}
                    >
                      <FileText />
                      {enExport ? (
                        <span className="cards-generating-indicator">Génération...</span>
                      ) : (
                        <>
                          Générer PDF
                          {elevesClasse.length > 0 && (
                            <span className="cards-generated-badge">{elevesClasse.length}</span>
                          )}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="cards-action-button secondary"
                      onClick={imprimerCarte}
                      disabled={elevesClasse.length === 0}
                    >
                      <Printer />
                      Imprimer toutes les cartes
                    </button>
                  </>
                )}

                {modeAffichage === 'personnel' && (
                  <>
                    <button
                      type="button"
                      className="cards-action-button primary"
                      onClick={() =>
                        telechargerCarte(
                          `carte-${membrePersonnel?.prenom || ''}-${membrePersonnel?.nom || 'personnel'}`,
                        )
                      }
                      disabled={!membrePersonnel || !etablissementPersonnel || enExport}
                    >
                      <Download />
                      {enExport ? 'Téléchargement...' : 'Télécharger (PNG)'}
                    </button>
                    <button
                      type="button"
                      className="cards-action-button secondary"
                      onClick={imprimerCarte}
                      disabled={!membrePersonnel || !etablissementPersonnel}
                    >
                      <Printer />
                      Imprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="cards-generation-card">
            <div className="cards-generation-card-header">
              <div className="flex items-center justify-between">
                <h2 className="cards-generation-card-title">Aperçu</h2>
                {(eleve || elevesClasse.length > 0) && (
                  <button
                    type="button"
                    className="cards-refresh-button"
                    onClick={() => {
                      if (modeAffichage === 'eleve' && eleve) {
                        const valeur = resolveId(eleve) || eleve.matricule || ''
                        setEleveSelectionne('')
                        setTimeout(() => setEleveSelectionne(valeur), 100)
                      }
                    }}
                  >
                    <RefreshCw />
                  </button>
                )}
              </div>
            </div>
            <div className="cards-generation-card-content">
              <div className="cards-preview-container">
                {modeAffichage === 'eleve' && (
                  eleve && classe && etablissement ? (
                    <div ref={carteRef}>{rendreCarte(eleve, classe, etablissement)}</div>
                  ) : (
                    <div className="cards-preview-empty">
                      <CreditCard />
                      <p>Sélectionnez un élève pour afficher l'aperçu</p>
                    </div>
                  )
                )}

                {modeAffichage === 'classe' && (
                  elevesClasse.length > 0 && classe && etablissement ? (
                    <div ref={cartesClasseRef} className="cards-preview-grid">
                      {elevesClasse.map((eleveData, idx) => {
                        const valeur = resolveId(eleveData) || eleveData.matricule || `classe-eleve-${idx}`
                        return (
                          <div key={valeur} className="carte-eleve-container">
                            {rendreCarte(eleveData, classe, etablissement)}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="cards-preview-empty">
                      <Users />
                      <p>Sélectionnez une classe pour afficher l'aperçu</p>
                    </div>
                  )
                )}

                {modeAffichage === 'personnel' && (
                  membrePersonnel && etablissementPersonnel ? (
                    <div ref={carteRef}>
                      <CartePersonnel
                        personnel={membrePersonnel}
                        etablissement={etablissementPersonnel}
                        avecQrCode={avecQrCode}
                      />
                    </div>
                  ) : (
                    <div className="cards-preview-empty">
                      <IdCard />
                      <p>Sélectionnez un membre du personnel pour afficher l'aperçu</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ContenuPageCartes
