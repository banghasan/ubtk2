# STRUKTUR FOLDER REFERENCE

Referensi struktur direktori project `utbk2`.
Dokumen ini disesuaikan dengan implementasi saat ini.

```text
utbk2/
├── .env
├── .env.example
├── .env.production.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── AGENTS.md
├── README.md
├── RTK.md
├── RULES.md
├── eslint.config.js
├── package.json
├── seed.json
├── docs/
│   ├── DEPLOY/
│   │   ├── README.md
│   │   ├── 01-setup.md
│   │   ├── 02-database.md
│   │   ├── 03-network.md
│   │   ├── 04-configuration.md
│   │   ├── 05-verification.md
│   │   ├── 06-checklist.md
│   │   ├── 07-update.md
│   │   └── 08-troubleshooting.md
│   ├── FORMAT-SOAL.md
│   ├── KONSEP.md
│   ├── RENCANA.md
│   ├── RENCANA-PROFESIONALISASI.md
│   └── STRUKTUR.md
├── backend/
│   ├── drizzle/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── app.ts
│       ├── config.ts
│       ├── index.ts
│       ├── __tests__/
│       │   ├── app.test.ts
│       │   ├── lib/
│       │   └── routes/
│       ├── db/
│       │   ├── connection.ts
│       │   ├── migrate.ts
│       │   └── schema/
│       ├── lib/
│       │   ├── auth-store.ts
│       │   ├── scoring.ts
│       │   ├── seed-check.ts
│       │   └── seed.ts
│       ├── mappers/
│       │   └── question-response.ts
│       ├── middleware/
│       │   └── require-auth.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── questions.ts
│       │   ├── subjects.ts
│       │   └── topics.ts
│       ├── services/
│       │   └── question-service.ts
│       └── validators/
│           └── question-validator.ts
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       ├── __tests__/
│       │   ├── components/
│       │   ├── composables/
│       │   └── views/
│       ├── api/
│       │   └── client.ts
│       ├── components/
│       │   ├── ExplanationPanel.vue
│       │   ├── OptionList.vue
│       │   ├── QuestionCard.vue
│       │   └── TimerBar.vue
│       ├── composables/
│       │   └── useQuizSession.ts
│       ├── router/
│       │   └── index.ts
│       ├── types/
│       │   └── index.ts
│       └── views/
│           ├── AuthView.vue
│           ├── HomeView.vue
│           ├── QuizView.vue
│           └── TopicView.vue
├── Dockerfile
└── docker-compose.yml
```

## Catatan

- `backend/src/routes/questions.ts` sekarang hanya berfungsi sebagai route wiring tipis.
- Logika quiz frontend utama sudah dipindahkan ke `frontend/src/composables/useQuizSession.ts`.
- Tooling kualitas tersedia di root: `lint`, `format`, `seed:check`, `test`, `typecheck`.
