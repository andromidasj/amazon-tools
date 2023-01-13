import puppeteer from "puppeteer";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const amazonRouter = createTRPCRouter({
  search: publicProcedure
    // .input(z.object({ text: z.string() }))
    .query(async () => {
      // const dom = new JSDOM(`<!DOCTYPE html><p>Hello wasdfadsfadforld</p>`);
      // const val = dom.window.document.querySelector("p")?.textContent;

      // const dom = await JSDOM.fromURL("https://www.amazon.com/s?k=tv", {
      //   runScripts: "dangerously",
      // });
      // console.log(dom.serialize());
      // dom.window.document.body.id;

      // return { val };
      // return dom.serialize();

      try {
        console.log("launching browser...");
        const browser = await puppeteer.launch({
          // headless: false,
        });
        const page = await browser.newPage();
        console.log("navigating to amazon...");
        await page.goto("https://www.amazon.com/s?k=tv", {
          waitUntil: "networkidle0",
        });

        // const bodyHTML = await page.evaluate(
        //   () => document.documentElement.outerHTML
        // );
        // console.log("🚀 ~ .query ~ bodyHTML", bodyHTML);

        console.log("searching results...");
        // const results = (await page.$$(".s-result-item")).map((e) => ({
        //   asin: e.getAttribute("data-asin"),
        //   title: e.querySelector("h2 > a > span")?.innerHTML,
        // }));
        const results = await page.$$eval(".s-result-item", (resultArr) =>
          resultArr
            .filter((resultItem) => !!resultItem.getAttribute("data-asin"))
            .map((resultItem) => ({
              asin: resultItem.getAttribute("data-asin"),
              title: resultItem.querySelector("h2 > a > span")?.innerHTML,
            }))
        );

        // const results = await page.evaluate(() =>
        //   Array.from(
        //     document.querySelectorAll(".s-result-item"),
        //     (e) => ({
        //       asin: e.getAttribute("data-asin"),
        //       title: e.querySelector("h2 > a > span")?.innerHTML,
        //     })
        //   )
        // );
        console.log("🚀 ~ .query ~ results", results);

        console.log("done");
        await browser.close();
        console.log("browser closed");
      } catch (err) {
        console.error(err);
      }

      return 1;
    }),
});
