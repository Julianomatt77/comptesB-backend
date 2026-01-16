import { prisma } from '../lib/prisma.ts';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const uploadsDir = path.join(__dirname, '../uploads');

  const usersData = JSON.parse(fs.readFileSync(path.join(uploadsDir, 'users.json'), 'utf8'));
  const comptesData = JSON.parse(fs.readFileSync(path.join(uploadsDir, 'comptes.json'), 'utf8'));
  const operationsData = JSON.parse(fs.readFileSync(path.join(uploadsDir, 'operations.json'), 'utf8'));

  console.log('Importation des utilisateurs...');
  const userMap = new Map<string, number>();
  for (const u of usersData) {
    const oldId = u._id.$oid;
    
    const existingUserByEmail = await prisma.user.findUnique({ where: { email: u.email } });
    const existingUserByUsername = await prisma.user.findUnique({ where: { username: u.username } });
    
    let user;
    if (existingUserByEmail) {
      user = await prisma.user.update({
        where: { email: u.email },
        data: {
          username: u.username,
          password: u.password,
          isDeleted: u.isDeleted || false,
          oldId: oldId,
        },
      });
    } else if (existingUserByUsername) {
      user = await prisma.user.update({
        where: { username: u.username },
        data: {
          email: u.email,
          password: u.password,
          isDeleted: u.isDeleted || false,
          oldId: oldId,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          password: u.password,
          isDeleted: u.isDeleted || false,
          oldId: oldId,
        },
      });
    }
    userMap.set(oldId, user.id);
  }
  console.log(`${userMap.size} utilisateurs traités (créés ou mis à jour).`);

  console.log('Importation des comptes...');
  const compteMap = new Map<string, number>();
  for (const c of comptesData) {
    const oldId = c._id.$oid;
    const userId = userMap.get(c.userId);
    if (!userId) {
      console.warn(`Utilisateur non trouvé pour le compte ${oldId} (userId: ${c.userId})`);
      continue;
    }

    const existingCompte = await prisma.compte.findFirst({
      where: { oldId: oldId }
    });

    let compte;
    if (existingCompte) {
      compte = await prisma.compte.update({
        where: { id: existingCompte.id },
        data: {
          name: c.name,
          typeCompte: c.typeCompte,
          soldeInitial: parseFloat(c.soldeInitial) || 0,
          soldeActuel: parseFloat(c.soldeActuel) || 0,
          isDeleted: c.isDeleted || false,
          userId: userId,
        }
      });
    } else {
      compte = await prisma.compte.create({
        data: {
          name: c.name,
          typeCompte: c.typeCompte,
          soldeInitial: parseFloat(c.soldeInitial) || 0,
          soldeActuel: parseFloat(c.soldeActuel) || 0,
          isDeleted: c.isDeleted || false,
          oldId: oldId,
          userId: userId,
        },
      });
    }
    compteMap.set(oldId, compte.id);
  }
  console.log(`${compteMap.size} comptes traités.`);

  console.log('Importation des opérations...');
  let opCount = 0;
  for (const o of operationsData) {
    const oldId = o._id.$oid;
    const userId = userMap.get(o.userId);
    const compteId = compteMap.get(o.compte);

    if (!userId || !compteId) {
      console.warn(`Utilisateur (${o.userId}) ou Compte (${o.compte}) non trouvé pour l'opération ${oldId}`);
      continue;
    }

    const existingOp = await prisma.operation.findFirst({
      where: { oldId: oldId }
    });

    if (existingOp) {
      await prisma.operation.update({
        where: { id: existingOp.id },
        data: {
          montant: parseFloat(o.montant) || 0,
          type: o.type,
          categorie: o.categorie,
          description1: o.description1 || '',
          description2: o.description2 || '',
          operationDate: o.operationDate?.$date ? new Date(o.operationDate.$date) : new Date(),
          solde: parseFloat(o.solde) || 0,
          userId: userId,
          compteId: compteId,
        }
      });
    } else {
      await prisma.operation.create({
        data: {
          montant: parseFloat(o.montant) || 0,
          type: o.type,
          categorie: o.categorie,
          description1: o.description1 || '',
          description2: o.description2 || '',
          operationDate: o.operationDate?.$date ? new Date(o.operationDate.$date) : new Date(),
          solde: parseFloat(o.solde) || 0,
          oldId: oldId,
          userId: userId,
          compteId: compteId,
        },
      });
    }
    opCount++;
  }
  console.log(`${opCount} opérations importées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
