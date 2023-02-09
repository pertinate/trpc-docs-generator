import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from './trpc';
import { TRPCDocsGenerator } from '@pertinate/trpc-docs-generator';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TRPCDocs = new TRPCDocsGenerator(appRouter, {
  license: {
    name: 'test',
    identifier: 'test',
  },
  contactInfo: {
    name: 'test',
    email: 'test@test.com',
    url: 'test.com',
  },
  termsOfService: 'test.com',
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'local dev server',
    },
  ],
});

app.get('/trpc.json', (req, res) => {
  res.send(TRPCDocs.output());
});

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(8080, () => {
  console.log('Server Online');
});
