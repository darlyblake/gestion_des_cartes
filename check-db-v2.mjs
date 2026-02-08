/**
 * Script pour vérifier et peupler la base de données MongoDB
 */

import 'dotenv/config.js';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Charger le fichier .env.local explicitement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: `${__dirname}/.env.local` });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'school-card';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non trouvé dans .env.local');
  console.error('   Variables disponibles:', Object.keys(process.env).filter(k => k.includes('MONGO')));
  process.exit(1);
}

console.log('📡 Configuration:');
console.log(`   DB Name: ${DB_NAME}`);
console.log(`   URI: ${MONGODB_URI.substring(0, 80)}...`);

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
      nom: 'Collège Albert Camus',
      adresse: '123 Rue de l\'École, Paris 75010',
      telephone: '01 44 39 45 95',
      email: 'contact@lycee-camus.fr',
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
    
    // Créer 3 élèves de test
    const eleves = [
      { nom: 'DUPONT', prenom: 'Jean', dateNaissance: '2010-05-15', lieuNaissance: 'Paris', sexe: 'M' },
      { nom: 'MARTIN', prenom: 'Marie', dateNaissance: '2010-08-22', lieuNaissance: 'Lyon', sexe: 'F' },
      { nom: 'BERNARD', prenom: 'Pierre', dateNaissance: '2011-01-03', lieuNaissance: 'Marseille', sexe: 'M' },
    ];
    
    for (const eleve of eleves) {
      await db.collection('eleves').insertOne({
        ...eleve,
        classeId: classeResult.insertedId,
        etablissementId: etablissementResult.insertedId,
        creeLe: new Date(),
        modifieLe: new Date(),
      });
    }
    console.log(`✓ ${eleves.length} élèves créés`);
    
    // Créer 2 personnels de test
    const personnels = [
      { nom: 'SOPHIE', prenom: 'Martin', role: 'enseignant', fonction: 'Professeur de Mathématiques', email: 'sophie.martin@camus.fr' },
      { nom: 'JEAN', prenom: 'Durand', role: 'directeur', fonction: 'Directeur', email: 'jean.durand@camus.fr' },
    ];
    
    for (const personnel of personnels) {
      await db.collection('personnel').insertOne({
        ...personnel,
        telephone: '06 12 34 56 78',
        etablissementId: etablissementResult.insertedId,
        creeLe: new Date(),
        modifieLe: new Date(),
      });
    }
    console.log(`✓ ${personnels.length} personnels créés`);
    
    console.log('\n✅ Données de test créées avec succès!');
    console.log('\nL\'application devrait maintenant afficher ces données.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error.message);
  }
}

checkDatabase();
