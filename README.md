# EmployAI
---
## Description
EmployAI est une application dédiée aux entreprises en ligne de gestion de documents et d'interface de Chat avec un agent IA qui analyse, et synthétise les documents approuvés par les managers (administrateurs).

## Objectif
L'application permet alors d'enregistrer des documents (.PDF) validés côté admins qui seront interprétés par l'Agent IA, et en fonction d'un prompt, l'agent répondra aux questions et/ou détails demandés par les employés sur un document. 

Cette application facilitera la compréhension des besoins, codes entreprises, et autres ressources d'une entreprise, le tout dans un cadre privé.

## Equipe
**ACHOUCHI** Rayane -- Front End, UI/UX, 2FA, Authentification<br>
**VOVARD** Mathéo -- Agent IA, Cluster/Database, Embedding, VectorDB, Tools, Gestion Documents (Chunk/Vectors) Deploiment, CI/CD, Environnement Dev/Prod<br>
**MARQUES DINIS** Joao Gabriel -- Back-End, Database, Gestion Users, Gestion Documents, Gestion Tags, Authentification, Security (Tests, oAuth). 

## Stack
**Front-End** - Next, React, Resend, BetterAuth (2FA)<br>
**Back-End** - NextJS, Google Cloud Service (oAuth), Mastra<br>
**Security** - JWT, Sessions<br>
**Tests** - Jest, Prettier, EsLint<br>
**Pipelines** - Husky, SonarQube, Vercel<br>
**Database** -  Cluster MongoDB Atlas, MongoVector<br>

## Quick Start
```sh
git clone https://github.com/Math-Vov13/EmployAI.git
```

Nous recommendons d'utiliser PNPM pour l'initiation | **DOC -> https://pnpm.io/fr/**
```sh
npm install
# ou
pnpm i
```

```sh
npm run dev
# ou
pnpm dev
```
Ou build l'app.

```sh
npm run build
npm run start
# ou
pnpm build
pnpm start
```

## Tests
```sh
cd .\front-end\
npm run test
# ou
cd .\front-end\
pnpm test
```

## Pages
```
/ (admin)
    / admin
        / documents
        / tags
        / users
/ (auth)
    / admin
        / sign-in
    / sign-in
/ (users)
    / chat
    / dashboard
    / documents
        /[id]
```

## API
```
/api-client
    /admin
        /logs
        /users
    /auth
        /[...all]                   (betterAuth)
        /admin
            /complete-signin
            /verify-credentials
        /google
            /callback
        /login
        /logout
        /send-otp                   (mail)
        /token
        /user
        /verify-otp                 (mail)
        /verify-user-credentials    (mail)
    /chat
        /completion
        /history
    /documents
        /[id]
    /tags
        /[id]
    /users
        /[user_id]
        /me
```
## Deploiment
Vercel --> https://employ-ai-six.vercel.app/ 

## Licence
**Copyright (c) 2025 - efrei.fr**

La présente autorisation est accordée, gratuitement, à toute personne obtenant une copie de ce logiciel et des fichiers de documentation associés (le « Logiciel »), afin de traiter le Logiciel sans restriction, y compris, sans s'y limiter, les droits d'utiliser, copier, modifier, fusionner, publier, distribuer, concéder en sous-licence et/ou vendre des copies du Logiciel, ainsi que d'autoriser les personnes auxquelles le Logiciel est fourni à le faire, sous réserve des conditions suivantes :

L'avis de copyright ci-dessus et le présent avis d'autorisation doivent être inclus dans toutes les copies ou parties substantielles du Logiciel.

**LE LOGICIEL EST FOURNI « EN L'ÉTAT », SANS GARANTIE D'AUCUNE SORTE, EXPRESSE OU IMPLICITE, Y COMPRIS, MAIS SANS S'Y LIMITER, LES GARANTIES DE QUALITÉ MARCHANDE, D'ADÉQUATION À UN USAGE PARTICULIER ET D'ABSENCE DE CONTREFAÇON. EN AUCUN CAS LES AUTEURS OU TITULAIRES DU COPYRIGHT NE POURRONT ÊTRE TENUS RESPONSABLES DE TOUTE RÉCLAMATION, DOMMAGE OU AUTRE RESPONSABILITÉ, QU’IL S’AGISSE D’UNE ACTION CONTRACTUELLE, DÉLICTUELLE OU AUTRE, DÉCOULANT DU LOGICIEL OU DE L’UTILISATION OU D’AUTRES INTERACTIONS AVEC LE LOGICIEL.**
