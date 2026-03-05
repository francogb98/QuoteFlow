// generate-vapid.ts
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("PUBLIC:", keys.publicKey);
console.log("PRIVATE:", keys.privateKey);
