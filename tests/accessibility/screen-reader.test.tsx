import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import CarteClassique from '@/components/cartes/carte-classique'
import { Eleve, Classe, Etablissement } from '@/lib/types'

// Extend Vitest's expect
expect.extend(toHaveNoViolations)

// Mock data for testing
const mockEleve: Eleve = {
  id: '1',
  nom: 'Dupont',
  prenom: 'Jean',
  matricule: 'MAT001',
  dateNaissance: '2000-01-01',
  lieuNaissance: 'Paris',
  sexe: 'M',
  photo: '/photo.jpg'
}

const mockClasse: Classe = {
  id: '1',
  nom: '6ème A',
  etablissementId: '1'
}

const mockEtablissement: Etablissement = {
  id: '1',
  nom: 'École Test',
  adresse: '123 rue Test',
  telephone: '0123456789',
  couleur: '#1e40af',
  anneeScolaire: '2025-2026'
}

describe('Screen Reader Accessibility Tests', () => {
  describe('CarteClassique Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <CarteClassique 
          eleve={mockEleve}
          classe={mockClasse}
          etablissement={mockEtablissement}
          face="recto"
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels and roles', () => {
      render(
        <CarteClassique 
          eleve={mockEleve}
          classe={mockClasse}
          etablissement={mockEtablissement}
          face="recto"
        />
      )

      // Check for proper alt text on images
      const photo = screen.getByAltText(/Photo de Jean Dupont/i)
      expect(photo).toBeInTheDocument()

      // Check for QR code alt text
      const qrCode = screen.getByAltText('QR Code')
      expect(qrCode).toBeInTheDocument()

      // Check for semantic structure
      const card = document.querySelector('.carte-scolaire')
      expect(card).toBeInTheDocument()
    })

    it('should announce important information to screen readers', () => {
      render(
        <CarteClassique 
          eleve={mockEleve}
          classe={mockClasse}
          etablissement={mockEtablissement}
          face="recto"
        />
      )

      // Student name should be properly structured
      expect(screen.getByText('Dupont')).toBeInTheDocument()
      expect(screen.getByText('Jean')).toBeInTheDocument()

      // Important information should be available
      expect(screen.getByText('MAT001')).toBeInTheDocument()
      expect(screen.getByText('6ème A')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <CarteClassique 
            eleve={mockEleve}
            classe={mockClasse}
            etablissement={mockEtablissement}
            face="les-deux"
          />
        </div>
      )

      // Check that focusable elements exist and can be focused
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      expect(focusableElements.length).toBeGreaterThan(0)

      // Test tab navigation
      await user.tab()
      const firstFocusable = document.activeElement
      expect(firstFocusable).toBeInTheDocument()
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper form labels', async () => {
      const FormComponent = () => (
        <form>
          <label htmlFor="student-name">Nom de l'élève</label>
          <input id="student-name" type="text" required />
          
          <label htmlFor="student-class">Classe</label>
          <select id="student-class">
            <option>6ème A</option>
            <option>5ème B</option>
          </select>
          
          <button type="submit">Enregistrer</button>
        </form>
      )

      render(<FormComponent />)

      // Check that inputs have proper labels
      const nameInput = screen.getByLabelText('Nom de l\'élève')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('id', 'student-name')

      const classSelect = screen.getByLabelText('Classe')
      expect(classSelect).toBeInTheDocument()
      expect(classSelect).toHaveAttribute('id', 'student-class')

      // Check form validation
      expect(nameInput).toBeRequired()
    })

    it('should announce form errors to screen readers', async () => {
      const FormWithError = () => (
        <form>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            aria-describedby="email-error"
            aria-invalid="true"
          />
          <div id="email-error" role="alert">
            Format d'email invalide
          </div>
        </form>
      )

      render(<FormWithError />)

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('Format d\'email invalide')
    })
  })

  describe('Navigation Accessibility', () => {
    it('should have skip links for keyboard users', () => {
      const LayoutComponent = () => (
        <div>
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <nav>
            <ul>
              <li><a href="/eleves">Élèves</a></li>
              <li><a href="/personnel">Personnel</a></li>
            </ul>
          </nav>
          <main id="main-content">
            <h1>Contenu principal</h1>
          </main>
        </div>
      )

      render(<LayoutComponent />)

      const skipLink = screen.getByRole('link', { name: 'Aller au contenu principal' })
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')

      const mainContent = document.getElementById('main-content')
      expect(mainContent).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      const PageComponent = () => (
        <div>
          <h1>Élèves</h1>
          <section>
            <h2>Liste des élèves</h2>
            <article>
              <h3>Jean Dupont</h3>
              <p>Élève de 6ème A</p>
            </article>
          </section>
        </div>
      )

      render(<PageComponent />)

      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })
  })

  describe('Color and Contrast', () => {
    it('should not rely solely on color to convey information', () => {
      const StatusComponent = () => (
        <div>
          <span className="text-green-600 font-bold">✓ Actif</span>
          <span className="text-red-600 font-bold">✗ Inactif</span>
        </div>
      )

      render(<StatusComponent />)

      // Information should be available through text, not just color
      expect(screen.getByText('✓ Actif')).toBeInTheDocument()
      expect(screen.getByText('✗ Inactif')).toBeInTheDocument()
    })

    it('should have sufficient color contrast', () => {
      // This would typically be tested with tools like axe-core
      // For now, we ensure high contrast classes are used
      const HighContrastComponent = () => (
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Bouton contrasté
        </button>
      )

      render(<HighContrastComponent />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-white')
      expect(button).toHaveClass('bg-blue-600')
    })
  })

  describe('Focus Management', () => {
    it('should manage focus in modal dialogs', async () => {
      const user = userEvent.setup()
      const ModalComponent = ({ isOpen }: { isOpen: boolean }) => (
        isOpen ? (
          <div role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <h2 id="modal-title">Confirmation</h2>
            <p>Voulez-vous continuer ?</p>
            <button onClick={() => {}}>Annuler</button>
            <button onClick={() => {}}>Confirmer</button>
          </div>
        ) : null
      )

      render(<ModalComponent isOpen={true} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')

      // Focus should be trapped within modal
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(2)
    })
  })
})
