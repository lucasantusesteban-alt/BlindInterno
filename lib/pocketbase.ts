import PocketBase from "pocketbase";

export const pb = new PocketBase("https://pb.obrion.es");
pb.autoCancellation(false);
