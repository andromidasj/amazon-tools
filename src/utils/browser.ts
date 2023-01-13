import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";

let instance: Browser | null = null;

export default async function getBrowserInstance() {
  if (!instance) {
    console.log("Initializing virtual browser...");
    instance = await puppeteer.launch();
  }
  return instance;
}
