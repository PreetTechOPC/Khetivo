import { Client, Account } from "appwrite";

export const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID = "6ae72036002d13f9c902";

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
