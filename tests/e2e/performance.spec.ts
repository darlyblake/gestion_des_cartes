import { test, expect } from '@playwright/test'

// Configuration
const BASE_URL = 'http://localhost:3000'
const PAGES = [
  { name: 'Accueil', path: '/' },
  { name: 'Cartes', path: '/cartes' },
  { name: 'Classes', path: '/classes' },
  { name: 'Élèves', path: '/eleves' },
  { name: 'Établissements', path: '/etablissements' },
  { name: 'Personnel', path: '/personnel' },
]

interface PerformanceMetrics {
  pageName: string
  path: string
  pageLoadTime: number
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  timeToInteractive?: number
  networkRequests: {
    total: number
    completed: number
    failed: number
    totalTime: number
    avgTime: number
  }
}

// Stocker les résultats
const results: PerformanceMetrics[] = []

test.describe('Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    for (const page of PAGES) {
      test(`Mesurer le temps de chargement de ${page.name}`, async ({ page: browserPage }) => {
        const startTime = Date.now()
        const resourceTimings: number[] = []

        // Tracker les requêtes réseau
        browserPage.on('response', (response) => {
          const responseTime = Date.now()
          resourceTimings.push(responseTime)
        })

        // Naviguer vers la page
        const response = await browserPage.goto(`${BASE_URL}${page.path}`, { 
          waitUntil: 'networkidle' 
        })

        const pageLoadTime = Date.now() - startTime

        expect(response?.ok()).toBeTruthy()

        // Récupérer les Core Web Vitals
        const metrics = await browserPage.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const paintEntries = performance.getEntriesByType('paint')
          const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint')
          const lcp = performance.getEntriesByType('largest-contentful-paint').pop()

          return {
            fcp: fcp?.startTime,
            lcp: lcp?.startTime,
            navigationStart: navigation.navigationStart,
            loadEventEnd: navigation.loadEventEnd,
          }
        })

        const metric: PerformanceMetrics = {
          pageName: page.name,
          path: page.path,
          pageLoadTime,
          firstContentfulPaint: metrics.fcp,
          largestContentfulPaint: metrics.lcp,
          networkRequests: {
            total: resourceTimings.length,
            completed: resourceTimings.length,
            failed: 0,
            totalTime: resourceTimings.length > 0 ? Math.max(...resourceTimings) - Math.min(...resourceTimings) : 0,
            avgTime: resourceTimings.length > 0 ? resourceTimings.reduce((a, b) => a + b) / resourceTimings.length : 0,
          },
        }

        results.push(metric)

        console.log(`✅ ${page.name}: ${pageLoadTime}ms`)
        console.log(`   - FCP: ${metrics.fcp?.toFixed(2)}ms`)
        console.log(`   - LCP: ${metrics.lcp?.toFixed(2)}ms`)
        console.log(`   - Requêtes réseau: ${resourceTimings.length}`)
      })
    }
  })

  test.describe('API Performance - Data Fetch', () => {
    test('Mesurer le temps de récupération - Classes', async ({ page }) => {
      const startTime = performance.now()

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/classes')
        return {
          status: res.status,
          data: await res.json(),
        }
      })

      const fetchTime = performance.now() - startTime

      console.log(`✅ Fetch Classes: ${fetchTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Items: ${response.data?.data?.length || 0}`)

      expect(response.status).toBe(200)
    })

    test('Mesurer le temps de récupération - Élèves', async ({ page }) => {
      const startTime = performance.now()

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/eleves')
        return {
          status: res.status,
          data: await res.json(),
        }
      })

      const fetchTime = performance.now() - startTime

      console.log(`✅ Fetch Élèves: ${fetchTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Items: ${response.data?.data?.length || 0}`)

      expect(response.status).toBe(200)
    })

    test('Mesurer le temps de récupération - Établissements', async ({ page }) => {
      const startTime = performance.now()

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/etablissements')
        return {
          status: res.status,
          data: await res.json(),
        }
      })

      const fetchTime = performance.now() - startTime

      console.log(`✅ Fetch Établissements: ${fetchTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Items: ${response.data?.data?.length || 0}`)

      expect(response.status).toBe(200)
    })

    test('Mesurer le temps de récupération - Personnel', async ({ page }) => {
      const startTime = performance.now()

      const response = await page.evaluate(async () => {
        const res = await fetch('/api/personnel')
        return {
          status: res.status,
          data: await res.json(),
        }
      })

      const fetchTime = performance.now() - startTime

      console.log(`✅ Fetch Personnel: ${fetchTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)
      console.log(`   - Items: ${response.data?.data?.length || 0}`)

      expect(response.status).toBe(200)
    })
  })

  test.describe('API Performance - Data Send (POST)', () => {
    test('Mesurer le temps d\'envoi - Créer une classe', async ({ page }) => {
      const testData = {
        nom: `Test Classe ${Date.now()}`,
        niveau: '3ème',
        etablissementId: 1,
      }

      const startTime = performance.now()

      const response = await page.evaluate(async (data) => {
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        return {
          status: res.status,
          data: await res.json(),
        }
      }, testData)

      const sendTime = performance.now() - startTime

      console.log(`✅ POST Classes: ${sendTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)

      expect([200, 201, 400, 409]).toContain(response.status)
    })

    test('Mesurer le temps d\'envoi - Créer un élève', async ({ page }) => {
      const testData = {
        nom: `Test Élève ${Date.now()}`,
        prenom: 'Test',
        email: `test-${Date.now()}@test.com`,
        classeId: 1,
      }

      const startTime = performance.now()

      const response = await page.evaluate(async (data) => {
        const res = await fetch('/api/eleves', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        return {
          status: res.status,
          data: await res.json(),
        }
      }, testData)

      const sendTime = performance.now() - startTime

      console.log(`✅ POST Élèves: ${sendTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)

      expect([200, 201, 400, 409]).toContain(response.status)
    })

    test('Mesurer le temps d\'envoi - Créer un établissement', async ({ page }) => {
      const testData = {
        nom: `Test Établissement ${Date.now()}`,
        code: `TST${Date.now()}`,
        ville: 'Test',
      }

      const startTime = performance.now()

      const response = await page.evaluate(async (data) => {
        const res = await fetch('/api/etablissements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        return {
          status: res.status,
          data: await res.json(),
        }
      }, testData)

      const sendTime = performance.now() - startTime

      console.log(`✅ POST Établissements: ${sendTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)

      expect([200, 201, 400, 409]).toContain(response.status)
    })

    test('Mesurer le temps d\'envoi - Créer un personnel', async ({ page }) => {
      const testData = {
        nom: `Test Personnel ${Date.now()}`,
        prenom: 'Test',
        email: `perso-${Date.now()}@test.com`,
        fonction: 'Enseignant',
        etablissementId: 1,
      }

      const startTime = performance.now()

      const response = await page.evaluate(async (data) => {
        const res = await fetch('/api/personnel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        return {
          status: res.status,
          data: await res.json(),
        }
      }, testData)

      const sendTime = performance.now() - startTime

      console.log(`✅ POST Personnel: ${sendTime.toFixed(2)}ms`)
      console.log(`   - Status: ${response.status}`)

      expect([200, 201, 400, 409]).toContain(response.status)
    })
  })

  test.describe('Detailed Network Analysis', () => {
    test('Analyser en détail les requêtes réseau de la page Cartes', async ({ page }) => {
      const networkMetrics: {
        url: string
        method: string
        status: number
        time: number
        size: number
      }[] = []

      // Capturer toutes les réponses
      page.on('response', async (response) => {
        const request = response.request()
        const timing = response.request().timing()

        if (timing) {
          const totalTime =
            (timing.responseEnd || 0) -
            (timing.requestStart || 0)

          networkMetrics.push({
            url: request.url(),
            method: request.method(),
            status: response.status(),
            time: totalTime,
            size: (await response.body()).length,
          })
        }
      })

      await page.goto(`${BASE_URL}/cartes`, { waitUntil: 'networkidle' })

      // Attendre un peu pour capturer toutes les requêtes
      await page.waitForTimeout(500)

      console.log('\n📊 Analyse détaillée des requêtes réseau:')
      console.log('─'.repeat(80))

      // Trier par temps décroissant
      const sortedMetrics = networkMetrics.sort((a, b) => b.time - a.time)

      let totalTime = 0
      let totalSize = 0

      sortedMetrics.forEach((metric, index) => {
        if (index < 10) {
          // Top 10 requêtes les plus lentes
          console.log(
            `${index + 1}. ${metric.method} ${metric.status} - ${metric.time.toFixed(2)}ms - ${(metric.size / 1024).toFixed(2)}KB - ${new URL(metric.url).pathname}`,
          )
        }
        totalTime += metric.time
        totalSize += metric.size
      })

      console.log('─'.repeat(80))
      console.log(`Total: ${sortedMetrics.length} requêtes`)
      console.log(`Temps total: ${totalTime.toFixed(2)}ms`)
      console.log(`Taille totale: ${(totalSize / 1024).toFixed(2)}KB`)
    })
  })

  test.describe('Concurrent Requests Performance', () => {
    test('Mesurer les requêtes concurrentes', async ({ page }) => {
      const startTime = performance.now()

      const results = await page.evaluate(async () => {
        const [classesRes, elevesRes, etablissementsRes, personnelRes] =
          await Promise.all([
            fetch('/api/classes'),
            fetch('/api/eleves'),
            fetch('/api/etablissements'),
            fetch('/api/personnel'),
          ])

        return {
          classes: classesRes.status,
          eleves: elevesRes.status,
          etablissements: etablissementsRes.status,
          personnel: personnelRes.status,
        }
      })

      const concurrentTime = performance.now() - startTime

      console.log(`✅ Requêtes concurrentes (4 APIs): ${concurrentTime.toFixed(2)}ms`)
      console.log(`   - Classes: ${results.classes}`)
      console.log(`   - Élèves: ${results.eleves}`)
      console.log(`   - Établissements: ${results.etablissements}`)
      console.log(`   - Personnel: ${results.personnel}`)
    })
  })

  test('Récapitulatif des performances', async () => {
    console.log('\n\n╔════════════════════════════════════════════════════════════════╗')
    console.log('║           📈 RÉSUMÉ DES PERFORMANCES - TOUTES LES PAGES        ║')
    console.log('╚════════════════════════════════════════════════════════════════╝\n')

    if (results.length > 0) {
      console.log('┌─ Temps de chargement des pages:')
      results.forEach((result) => {
        console.log(`│  ${result.pageName.padEnd(20)} ${result.pageLoadTime.toString().padEnd(6)}ms`)
      })

      const avgLoadTime = results.reduce((sum, r) => sum + r.pageLoadTime, 0) / results.length
      console.log(`├─ Moyenne: ${avgLoadTime.toFixed(2)}ms`)

      const maxLoadTime = Math.max(...results.map((r) => r.pageLoadTime))
      console.log(`├─ Max: ${maxLoadTime}ms`)

      const minLoadTime = Math.min(...results.map((r) => r.pageLoadTime))
      console.log(`└─ Min: ${minLoadTime}ms\n`)
    }
  })
})
