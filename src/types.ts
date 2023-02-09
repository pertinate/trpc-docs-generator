import { JsonSchema7AnyType } from 'zod-to-json-schema/src/parsers/any';

export interface TRPCDocsLicense {
  name: string;
  identifier: string;
  url?: string;
}

export interface TRPCDocsContact {
  name: string;
  url: string;
  email: string;
}

export interface TRPCDocsServers {
  url: string;
  description: string;
}

export interface TRPCDocsOperation {
  deprecated: boolean;
  requiresAuth: boolean;
  tags: string[];
}

export interface TRPCDocsMeta {
  summary: string;
  description?: string;
  servers?: TRPCDocsServers[];
  operation: TRPCDocsOperation;
}

export interface TRPCAPI {
  route: string;
  isRouter: boolean;
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
  metaData?: TRPCDocsMeta;
  inputs: JsonSchema7AnyType[];
  output?: JsonSchema7AnyType;
  children: TRPCAPI[];
}

export interface TRPCInfo {
  route: string;
  name: string;
  description?: string;
}

export interface TRPCBase {
  info: TRPCInfo;
  license: TRPCDocsLicense;
  contactInfo: TRPCDocsContact;
  termsOfService: string;
  servers: TRPCDocsServers[];
}

export interface TRPCDocs extends TRPCBase {
  api: TRPCAPI[];
}
