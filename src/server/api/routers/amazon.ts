import { JSDOM } from "jsdom";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const zOptionalString = z.string().optional();
const ResultSchema = z.object({
  "#": z.number(),
  asin: z.string(),
  title: zOptionalString,
  price: zOptionalString,
  rating: zOptionalString,
});

type Result = z.infer<typeof ResultSchema>;

export const amazonRouter = createTRPCRouter({
  // init: publicProcedure.query(async () => {
  //   try {
  //     await getBrowserInstance();
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // }),
  search: publicProcedure
    .input(z.object({ q: z.string(), pages: z.number() }))
    .mutation(async ({ input }) => {
      const { q, pages } = input;

      let orderCount = 1;
      const results: Result[] = [];

      for (let i = 1; i <= pages; i++) {
        const dom = await JSDOM.fromURL(
          `https://www.amazon.com/s?k=${q}&page=${i}`,
          { runScripts: "dangerously" }
        );

        const document = dom.window.document;

        const pageResults = Array.from(
          document.querySelectorAll(".s-result-item")
        ).filter((resultItem) => !!resultItem.getAttribute("data-asin"));

        console.log("🚀 ~ .mutation ~ pageResults", pageResults.length);

        setTimeout(() => {
          pageResults.forEach((resultItem) => {
            const entry = {
              "#": orderCount,
              asin: resultItem.getAttribute("data-asin"),
              title: resultItem.querySelector("h2 > a > span")?.innerHTML,
              price: resultItem.querySelector(".a-price > span")?.innerHTML,
              rating: resultItem.querySelector(
                "span[aria-label$='out of 5 stars']"
              ),
              // ?.ariaLabel?.replace(" out of 5 stars", ""),
            };

            // could find a cleaner way to do this
            if (ResultSchema.safeParse(entry).success) {
              results.push(ResultSchema.parse(entry));
              orderCount++;
            }
          });
        }, 1000);
      }

      console.log(results);

      // try {
      //   const browser = await getBrowserInstance();
      //   const page = await browser.newPage();

      //   console.log("navigating to amazon...");

      //   let csv = "";
      //   const results: Result[] = [];

      //   for (let i = 1; i <= pages; i++) {
      //     await page.goto(`https://www.amazon.com/s?k=${q}&page=${i}`);

      //     await page.waitForSelector('div[data-index="1"]');

      //     console.log("searching results...");
      //     const pageResults = await page.$$eval(".s-result-item", (resultArr) =>
      //       resultArr.filter(
      //         (resultItem) => !!resultItem.getAttribute("data-asin")
      //       )
      //     );

      //     console.log(pageResults.length, "pageResults");
      //     console.log("looping...");
      //     pageResults.forEach((resultItem, i) => {
      //       console.log(i);
      //       console.log(resultItem);

      //       const entry = {
      //         asin: resultItem.getAttribute("data-asin"),
      //         title: resultItem.querySelector("h2 > a > span")?.innerHTML,
      //         price: resultItem.querySelector(".a-price > span")?.innerHTML,
      //         rating: resultItem
      //           .querySelector("span[aria-label$='out of 5 stars']")
      //           ?.ariaLabel?.replace(" out of 5 stars", ""),
      //       };

      //       results.push(ResultSchema.parse(entry));
      //     });

      //     console.log("🚀 ~ .query ~ results", results);

      //     csv += await jsonexport(results, { rowDelimiter: "\t" });
      //   }

      //   console.log("done");
      //   // await page.close();

      //   return { results, csv };
      // } catch (err) {
      //   console.error(err);
      //   throw err;
      // }
    }),
});
