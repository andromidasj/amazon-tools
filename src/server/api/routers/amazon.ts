import puppeteer from "puppeteer";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

console.log("launching browser...");

export const amazonRouter = createTRPCRouter({
  search: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const browser = await puppeteer.launch({
        // headless: false,
      });
      const page = await browser.newPage();

      console.log("navigating to amazon...");
      await page.goto(`https://www.amazon.com/s?k=${input}`, {
        waitUntil: "networkidle0",
      });

      // const bodyHTML = await page.evaluate(
      //   () => document.documentElement.outerHTML
      // );
      // console.log("🚀 ~ .query ~ bodyHTML", bodyHTML);

      console.log("searching results...");

      const results = await page.$$eval(".s-result-item", (resultArr) =>
        resultArr
          .filter((resultItem) => !!resultItem.getAttribute("data-asin"))
          .map((resultItem) => ({
            asin: resultItem.getAttribute("data-asin"),
            title: resultItem.querySelector("h2 > a > span")?.innerHTML,
            price: resultItem.querySelector(".a-price > span")?.innerHTML,
            rating: resultItem
              .querySelector("span[aria-label$='out of 5 stars']")
              ?.ariaLabel?.replace(" out of 5 stars", ""),
          }))
      );

      console.log("🚀 ~ .query ~ results", results);

      console.log("done");
      await browser.close();
      console.log("browser closed");

      return results;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }),
});
