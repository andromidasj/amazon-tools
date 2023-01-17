import { JSDOM } from "jsdom";
import jsonexport from "jsonexport";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const zOptionalString = z.string().optional();
const ResultSchema = z.object({
  asin: z.string(),
  title: zOptionalString,
  price: zOptionalString,
  rating: zOptionalString,
});

type Result = z.infer<typeof ResultSchema>;

export const amazonRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ q: z.string(), pages: z.number() }))
    .mutation(async ({ input }) => {
      const { q, pages } = input;

      const promiseArr = [];

      console.time("time");

      for (let i = 1; i <= pages; i++) {
        promiseArr.push(
          (async () => {
            console.log("Loading page", i);
            const results: Result[] = [];
            const dom = await JSDOM.fromURL(
              `https://www.amazon.com/s?k=${q}&page=${i}`,
              { runScripts: "dangerously" }
            );

            const document = dom.window.document;

            const pageResults = Array.from(
              document.querySelectorAll(".s-result-item")
            ).filter((resultItem) => !!resultItem.getAttribute("data-asin"));

            // console.log("🚀 ~ .mutation ~ pageResults", pageResults);

            pageResults.forEach((resultItem) => {
              const entry = {
                asin: resultItem.getAttribute("data-asin"),
                title: resultItem.querySelector("h2 > a > span")?.innerHTML,
                price: resultItem.querySelector(".a-price > span")?.innerHTML,
                rating: resultItem
                  .querySelector(
                    "span[aria-label$='out of 5 stars'] > span > a > i > span"
                  )
                  ?.innerHTML.slice(0, 3),
              };

              // Validate entry values
              const validatedEntry = ResultSchema.safeParse(entry);

              if (validatedEntry.success) {
                results.push(validatedEntry.data);
              }
            });

            return results;
          })()
        );
      }

      const pageResults = await Promise.allSettled(promiseArr);

      console.log(pageResults);

      let results: Result[] = [];

      for (const pageResult of pageResults) {
        if (pageResult.status === "fulfilled") {
          results = results.concat(pageResult.value);
        } else {
          results = results.concat({
            asin: "N/A",
            title: "Error: Couldn't load page...",
          });
        }
      }

      const csv = await jsonexport(results, { rowDelimiter: "\t" });

      console.timeEnd("time");

      return { results, csv };
    }),
});
