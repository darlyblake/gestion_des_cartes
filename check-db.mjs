/**
 * Script pour vérifier et peupler la base de données MongoDB
 */

import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement du fichier .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

let MONGODB_URI = process.env.MONGODB_URI;
let DB_NAME = process.env.MONGODB_DB_NAME || 'school-card';

if (!MONGODB_URI && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
      let value = line.split('=', 2)[1].trim();
      // Supprimer les guillemets
      value = value.replace(/^["']|["']$/g, '');
      MONGODB_URI = value;
    }
    if (line.startsWith('MONGODB_DB_NAME=')) {
      let value = line.split('=', 2)[1].trim();
      // Supprimer les guillemets
      value = value.replace(/^["']|["']$/g, '');
      DB_NAME = value;
    }
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non trouvé');
  process.exit(1);
}

console.log('📡 Configuration:');
console.log(`   DB Name: ${DB_NAME}`);
console.log(`   URI (full): ${MONGODB_URI}`);
console.log(`   URI (preview): ${MONGODB_URI.substring(0, 80)}...`);

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('\n✓ Connecté à MongoDB Atlas');
    
    const db = client.db(DB_NAME);
    
    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📊 Collections trouvées: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('\n⚠️  AUCUNE COLLECTION - La base de données est VIDE');
      console.log('\nCréation des données de test...\n');
      await createSampleData(db);
      return;
    }
    
    // Compter les documents dans chaque collection
    console.log('\n📈 Nombre de documents par collection:');
    let totalDocs = 0;
    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const count = await collection.countDocuments();
      totalDocs += count;
      console.log(`   • ${collectionInfo.name}: ${count} document(s)`);
    }
    
    console.log(`\n✅ Total: ${totalDocs} document(s) dans la base de données`);
    
    if (totalDocs === 0) {
      console.log('\n⚠️  La base de données est VIDE - Création des données de test...\n');
      await createSampleData(db);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
  } finally {
    await client.close();
    console.log('\n✓ Déconnecté');
  }
}

async function createSampleData(db) {
  try {
    // Créer un établissement de test
    const etablissementResult = await db.collection('etablissements').insertOne({
      nom: 'Collège de Test',
      adresse: '123 Rue de Test, Paris 75000',
      telephone: '01 23 45 67 89',
      email: 'test@college.fr',
      anneeScolaire: '2025-2026',
      couleur: '#1e40af',
      police: 'Arial',
      creeLe: new Date(),
      modifieLe: new Date(),
    });
    
    console.log(`✓ Établissement créé: ${etablissementResult.insertedId}`);
    
    // Créer une classe de test
    const classeResult = await db.collection('classes').insertOne({
      nom: '6ème A',
      niveau: '6ème',
      etablissementId: etablissementResult.insertedId,
      creeLe: new Date(),
      modifieLe: new Date(),
    });
    
    console.log(`✓ Classe créée: ${classeResult.insertedId}`);
    
    // Créer un élève de test
    const eleveResult = await db.collection('eleves').insertOne({
      nom: 'DUPONT',
      prenom: 'Jean',
      dateNaissance: '2010-05-15',
      lieuNaissance: 'Paris',
      sexe: 'M',
      classeId: classeResult.insertedId,
      etablissementId: etablissementResult.insertedId,
      creeLe: new Date(),
      modifieLe: new Date(),
    });
    
    console.log(`✓ Élève créé: ${eleveResult.insertedId}`);
    
    // Créer un personnel de test
    const personnelResult = await db.collection('personnel').insertOne({
      nom: 'MARTIN',
      prenom: 'Sophie',
      role: 'enseignant',
      fonction: 'Professeur de Mathématiques',
      email: 'sophie.martin@college.fr',
      telephone: '06 12 34 56 78',
      etablissementId: etablissementResult.insertedId,
      creeLe: new Date(),
      modifieLe: new Date(),
    });
    
    console.log(`✓ Personnel créé: ${personnelResult.insertedId}`);
    
    console.log('\n✅ Données de test créées avec succès!');
    console.log('\nL\'application devrait maintenant afficher ces données.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
  }
}

checkDatabase();
