import { AnyRouter } from '@trpc/server';
import zodToJsonSchema from 'zod-to-json-schema';
import { TRPCAPI, TRPCBase } from './types';

export class TRPCDocsGenerator<T extends AnyRouter> {
  router: T;
  docs: TRPCBase;
  recursiveGenerators: (<K>(routeObject: TRPCAPI) => K & TRPCAPI)[] = [];
  postGenerators: any[] = [];
  constructor(router: T, docs: TRPCBase) {
    this.router = router;
    this.docs = docs;
  }
  generate = () => {
    const localRouter = this.router;

    const recursiveSet = (
      acc: any[],
      path: string[],
      router: AnyRouter
    ): any => {
      if (path.length === 0) {
        return;
      }

      const route = path.pop() as string;
      let idx = acc.findIndex(entry => entry.route === route);

      if (idx == -1) {
        const queries = Object.keys(localRouter._def.queries);
        const mutations = Object.keys(localRouter._def.mutations);
        const subscriptions = Object.keys(localRouter._def.subscriptions);

        const isQuery = !!queries.find(entry => entry.endsWith(route));
        const isMutation = !!mutations.find(entry => entry.endsWith(route));
        const isSubscription = !!subscriptions.find(entry =>
          entry.endsWith(route)
        );

        const notRouter = isQuery || isMutation || isSubscription;
        const routeObject: TRPCAPI = {
          route,
          isRouter: !(route in router._def.procedures),
          isQuery,
          isMutation,
          isSubscription,
          metaData: notRouter
            ? (router[route as keyof typeof router] as any).meta
            : undefined,
          inputs: notRouter
            ? (router[route as keyof typeof router] as any)._def.inputs.map(
                (entry: any) => zodToJsonSchema(entry)
              )
            : undefined,
          output:
            notRouter &&
            (router[route as keyof typeof router] as any)?._def?.output
              ? zodToJsonSchema(
                  (router[route as keyof typeof router] as any)?._def?.output
                )
              : undefined,
          children: [],
        };
        const routeBuildObject = this.recursiveGenerators.reduce(
          (acc, next) => {
            if (next) {
              acc = next?.({
                ...routeObject,
                ...acc,
              });
            }
            return acc;
          },
          {} as Record<string, unknown>
        );

        idx = acc.push(routeBuildObject) - 1;
      }
      return recursiveSet(
        acc[idx].children,
        path,
        router[route as keyof typeof router] as any
      );
    };

    const builtRouter = Object.keys(localRouter._def.procedures)
      .map(entry => entry.split('.'))
      .reduce<TRPCAPI[]>((acc, next) => {
        const reversed = next.reverse();
        recursiveSet(acc, reversed, localRouter);
        return acc;
      }, []);

    return {
      ...this.docs,
      api: builtRouter,
    };
  };
}
