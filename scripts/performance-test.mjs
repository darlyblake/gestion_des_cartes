#!/usr/bin/env node

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const results = {
  pagePerformance: [],
  apiPerformance: [],
  networkAnalysis: {
    totalRequests: 0,
    totalData: 0,
    avgResponseTime: 0,
  },
  timestamp: new Date().toISOString(),
}

async function testPagePerformance() {
  console.log('📊 Test des performances des pages...\n')

  const browser = await chromium.launch()
  const pages = [
    { name: 'Accueil', path: '/' },
    { name: 'Cartes', path: '/cartes' },
    { name: 'Classes', path: '/classes' },
    { name: 'Élèves', path: '/eleves' },
    { name: 'Établissements', path: '/etablissements' },
    { name: 'Personnel', path: '/personnel' },
  ]

  for (const pageInfo of pages) {
    const page = await browser.newPage()

    const resourceTimings = []
    page.on('response', (response) => {
      const timing = response.request().timing()
      if (timing) {
        resourceTimings.push((timing.responseEnd || 0) - (timing.requestStart || 0))
      }
    })

    const startTime = Date.now()
    try {
      await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle', timeout: 30000 })
      const loadTime = Date.now() - startTime

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        const paintEntries = performance.getEntriesByType('paint')
        const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint')
        const lcp = performance.getEntriesByType('largest-contentful-paint').pop()

        return {
          fcp: fcp?.startTime,
          lcp: lcp?.startTime,
          tti: navigation?.domInteractive,
        }
      })

      results.pagePerformance.push({
        pageName: pageInfo.name,
        path: pageInfo.path,
        metrics: {
          loadTime,
          fcp: metrics.fcp,
          lcp: metrics.lcp,
          tti: metrics.tti,
          resourceTiming: resourceTimings,
        },
      })

      console.log(
        `✅ ${pageInfo.name.padEnd(20)} - ${loadTime.toString().padEnd(5)}ms | FCP: ${metrics.fcp?.toFixed(0).padEnd(4)}ms | LCP: ${metrics.lcp?.toFixed(0)}ms`,
      )
    } catch (error) {
      console.error(`❌ ${pageInfo.name} - Erreur: ${error?.message || error}`)
    }

    await page.close()
  }

  await browser.close()
}

async function testAPIPerformance() {
  console.log('\n🔌 Test des performances des APIs...\n')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  } catch (error) {
    console.error('❌ Impossible de se connecter au serveur')
    await browser.close()
    return
  }

  const endpoints = [
    { endpoint: '/api/classes', method: 'GET' },
    { endpoint: '/api/eleves', method: 'GET' },
    { endpoint: '/api/etablissements', method: 'GET' },
    { endpoint: '/api/personnel', method: 'GET' },
  ]

  for (const api of endpoints) {
    try {
      const result = await page.evaluate(
        async ({ endpoint, method, baseUrl }) => {
          const startTime = performance.now()
          const response = await fetch(`${baseUrl}${endpoint}`, { method })
          const endTime = performance.now()

          const data = await response.text()

          return {
            status: response.status,
            time: endTime - startTime,
            size: new Blob([data]).size,
          }
        },
        { endpoint: api.endpoint, method: api.method, baseUrl: BASE_URL },
      )

      results.apiPerformance.push({
        endpoint: api.endpoint,
        method: api.method,
        fetchTime: result.time,
        status: result.status,
        dataSize: result.size,
      })

      console.log(
        `✅ ${api.method.padEnd(4)} ${api.endpoint.padEnd(25)} - ${result.time.toFixed(2).padEnd(7)}ms | Status: ${result.status} | Size: ${(result.size / 1024).toFixed(2)}KB`,
      )
    } catch (error) {
      console.error(`❌ ${api.endpoint} - Erreur: ${error?.message || error}`)
    }
  }

  await page.close()
  await browser.close()
}

async function testConcurrentRequests() {
  console.log('\n⚡ Test des requêtes concurrentes...\n')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  } catch (error) {
    await browser.close()
    return
  }

  const startTime = performance.now()

  const concurrentResult = await page.evaluate(async (baseUrl) => {
    const [classesRes, elevesRes, etablissementsRes, personnelRes] = await Promise.all([
      fetch(`${baseUrl}/api/classes`),
      fetch(`${baseUrl}/api/eleves`),
      fetch(`${baseUrl}/api/etablissements`),
      fetch(`${baseUrl}/api/personnel`),
    ])

    return {
      classes: classesRes.status,
      eleves: elevesRes.status,
      etablissements: etablissementsRes.status,
      personnel: personnelRes.status,
    }
  }, BASE_URL)

  const totalConcurrentTime = performance.now() - startTime

  console.log(`✅ 4 requêtes parallèles en ${totalConcurrentTime.toFixed(2)}ms`)
  console.log(`   - Classes: ${concurrentResult.classes}`)
  console.log(`   - Élèves: ${concurrentResult.eleves}`)
  console.log(`   - Établissements: ${concurrentResult.etablissements}`)
  console.log(`   - Personnel: ${concurrentResult.personnel}`)

  await page.close()
  await browser.close()
}

function generateReport() {
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗')
  console.log('║                    📊 RAPPORT DE PERFORMANCES                  ║')
  console.log('╚════════════════════════════════════════════════════════════════╝\n')

  // Résumé des pages
  console.log('📄 PAGES - TEMPS DE CHARGEMENT')
  console.log('─'.repeat(70))

  if (results.pagePerformance.length > 0) {
    const avgLoadTime = results.pagePerformance.reduce((sum, p) => sum + p.metrics.loadTime, 0) / results.pagePerformance.length
    const maxLoadTime = Math.max(...results.pagePerformance.map((p) => p.metrics.loadTime))
    const minLoadTime = Math.min(...results.pagePerformance.map((p) => p.metrics.loadTime))

    results.pagePerformance.forEach((p) => {
      console.log(`${p.pageName.padEnd(20)} ${p.metrics.loadTime.toString().padEnd(5)}ms`)
    })

    console.log('─'.repeat(70))
    console.log(`Moyenne: ${avgLoadTime.toFixed(2)}ms | Max: ${maxLoadTime}ms | Min: ${minLoadTime}ms\n`)
  }

  // Résumé des APIs
  console.log('🔌 API - TEMPS DE RÉCUPÉRATION DE DONNÉES')
  console.log('─'.repeat(70))

  if (results.apiPerformance.length > 0) {
    const avgFetchTime = results.apiPerformance.reduce((sum, a) => sum + a.fetchTime, 0) / results.apiPerformance.length
    const maxFetchTime = Math.max(...results.apiPerformance.map((a) => a.fetchTime))
    const minFetchTime = Math.min(...results.apiPerformance.map((a) => a.fetchTime))
    const totalDataSize = results.apiPerformance.reduce((sum, a) => sum + a.dataSize, 0)

    results.apiPerformance.forEach((a) => {
      console.log(`${a.method.padEnd(4)} ${a.endpoint.padEnd(30)} ${a.fetchTime.toFixed(2).padEnd(6)}ms | ${(a.dataSize / 1024).toFixed(2)}KB`)
    })

    console.log('─'.repeat(70))
    console.log(`Moyenne: ${avgFetchTime.toFixed(2)}ms | Max: ${maxFetchTime.toFixed(2)}ms | Min: ${minFetchTime.toFixed(2)}ms`)
    console.log(`Taille totale: ${(totalDataSize / 1024).toFixed(2)}KB\n`)
  }

  // Sauvegarder le rapport JSON
  const reportPath = path.join(process.cwd(), 'performance-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(`\n✅ Rapport sauvegardé: ${reportPath}`)
}

async function main() {
  try {
    console.log('🚀 Démarrage des tests de performance...\n')

    await testPagePerformance()
    await testAPIPerformance()
    await testConcurrentRequests()

    generateReport()

    console.log(
      '\n✅ Tests complétés avec succès! Consultez le fichier performance-report.json pour les détails complets.\n',
    )
  } catch (error) {
    console.error('❌ Erreur:', error?.message || error)
    process.exit(1)
  }
}

main()
