# Compty API

API (Node.js / Express / MongoDb) de l'Application web de gestion de comptes bancaires.

-> Gérer vos dépenses quotidiennes
-> Suivez l'évolution de vos comptes
-> Suivez l'évolution de votre épargne
-> Exporter vos opérations et solde de vos comptes bancaires au format .csv ou .pdf

## Serveur

-- Node v18

`node server.js` en prod.

`npm run dev` en dev

`fly deploy` pour mettre en prod

## Mise à jour v2 (2026)

- mise à jour vers Node 24
- Suppression de Mongoose et MongoDb
- Passage à Mysql avec l'ORM Prisma: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/mysql
- `npx prisma init --datasource-provider mysql --output ../generated/prisma` pour générer les fichiers Prisma
- `npx prisma migrate dev --name init` pour créer une migration.
- `npx prisma generate` pour générer le client Prisma
- `npx tsx script-test.ts` pour lancer le script de test (ajout d'un utilisateur)
- `npx prisma studio --config ./prisma.config.ts` pour visualiser la BDD
