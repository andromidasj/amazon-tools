import jsonexport from "jsonexport/dist";
import { z } from "zod";
import getBrowserInstance from "../../../utils/browser";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const amazonRouter = createTRPCRouter({
  init: publicProcedure.query(async () => {
    try {
      await getBrowserInstance();
      return true;
    } catch (error) {
      return false;
    }
  }),
  search: publicProcedure
    .input(z.object({ q: z.string(), pages: z.number() }))
    .mutation(async ({ input }) => {
      const { q, pages } = input;

      try {
        const browser = await getBrowserInstance();
        const page = await browser.newPage();

        console.log("navigating to amazon...");
        await page.goto(`https://www.amazon.com/s?k=${q}`, {
          waitUntil: "networkidle0",
        });

        console.log("searching results...");

        const results = await page.$$eval(".s-result-item", (resultArr) =>
          resultArr
            .filter((resultItem) => !!resultItem.getAttribute("data-asin"))
            .map((resultItem, i) => ({
              "#": i + 1,
              asin: resultItem.getAttribute("data-asin"),
              title: resultItem.querySelector("h2 > a > span")?.innerHTML,
              price: resultItem.querySelector(".a-price > span")?.innerHTML,
              rating: resultItem
                .querySelector("span[aria-label$='out of 5 stars']")
                ?.ariaLabel?.replace(" out of 5 stars", ""),
            }))
        );

        console.log("🚀 ~ .query ~ results", results);

        // let csv = ''
        // let arr = []

        // results.forEach(e => {
        //   arr.push()
        // })

        // const csv = await new ObjectsToCsv(results).toString();

        const csv = await jsonexport(results, { rowDelimiter: "\t" });

        console.log("done");
        await page.close();
        return { results, csv };
      } catch (err) {
        console.error(err);
        throw err;
      }
    }),
});
