import * as NodeAppwrite from "node-appwrite";
import { APPWRITE_CONFIG } from "./appwriteConfig";

let serverClient: NodeAppwrite.Client | null = null;
let serverDatabases: NodeAppwrite.Databases | null = null;
let serverStorage: NodeAppwrite.Storage | null = null;
let serverUsers: NodeAppwrite.Users | null = null;

export function getServerAppwrite() {
  if (!serverClient) {
    const key = process.env.APPWRITE_API_KEY || APPWRITE_CONFIG.API_KEY;
    serverClient = new NodeAppwrite.Client()
      .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
      .setProject(APPWRITE_CONFIG.PROJECT_ID);

    if (key) {
      serverClient.setKey(key);
    }
  }
  return serverClient;
}

export function getServerDatabases() {
  if (!serverDatabases) {
    serverDatabases = new NodeAppwrite.Databases(getServerAppwrite());
  }
  return serverDatabases;
}

export function getServerStorage() {
  if (!serverStorage) {
    serverStorage = new NodeAppwrite.Storage(getServerAppwrite());
  }
  return serverStorage;
}

export function getServerUsers() {
  if (!serverUsers) {
    serverUsers = new NodeAppwrite.Users(getServerAppwrite());
  }
  return serverUsers;
}

