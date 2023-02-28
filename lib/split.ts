import fs from "fs";
import path from "path";

const WORD_COUNT = 500;

type SplitResult = {
  content: string;
  children?: SplitResult | SplitResult[] | null;
};

const fileData = fs
  .readFileSync(path.resolve(__dirname, "..", "src.md"))
  .toString();

const splitRecursive = (
  sourceData: string,
  headingLevel: number,
  currentLevel = 1
): SplitResult[] => {
  const headingRegexBuilder = `^#{${currentLevel}}(?!<=#)\\s`;
  const headingRegex = new RegExp(headingRegexBuilder, "gm");
  let splittedData = sourceData.split(headingRegex);

  splittedData = splittedData.filter((item) => item.trim() !== "");

  const result = splittedData.map((item) => {
    item = item.trim();
    const splitResult: SplitResult = {
      content: item,
    };

    if (currentLevel < headingLevel) {
      const headingRegexBuilder = `^#{${currentLevel + 1}}(?!<=#)\\s`;
      const headingRegex = new RegExp(headingRegexBuilder, "gm");
      const nextHeading = item.split(headingRegex)[0];
      if (nextHeading) {
        splitResult.content = nextHeading;
      }

      const children = splitRecursive(item, headingLevel, currentLevel + 1);

      if (children) splitResult.children = children;
    }

    splitResult.content = "## " + splitResult.content;

    return splitResult ?? "";
  });

  return result;
};

let counter = 1;

const writeToFile = (item: SplitResult) => {
  const file = path.resolve(__dirname, "..", `_pages/${counter}.md`);
  const getFootnote = (content: string) => {
    const footnoteRegex = /\[\^([0-9]+)\]/gm;
    const footnotes = content.match(footnoteRegex);

    if (footnotes) {
      const result = footnotes.map((footnote) => {
        const footnoteNumber = footnote.replace("[^", "").replace("]", "");
        const regex = new RegExp(`\\[\\^${footnoteNumber}\\]`, "gm");
        console.log(regex);
        const matchIndices = Array.from(fileData.matchAll(regex)).map(
          (x) => x.index
        );

        console.log(matchIndices);

        const endOfParagraph = fileData.indexOf("\n", matchIndices[1]) + 1;

        console.log(endOfParagraph, "end");

        const footnoteContent = fileData
          .slice(matchIndices[1], endOfParagraph)
          .trim();

        return footnoteContent;
      });

      return result?.join("\n\n");
    }

    return "";
  };

  const footnote = getFootnote(item.content) ?? "";
  fs.writeFileSync(file, item.content + "\n\n" + footnote);
  counter++;
};

const writeRecursive = (data: SplitResult[]) => {
  data.forEach((item) => {
    if (item.children) {
      writeRecursive(item.children as SplitResult[]);
    } else {
      const splittedItem = item.content.split(" ");
      if (splittedItem.length >= WORD_COUNT) {
        const chunks = Math.ceil(splittedItem.length / WORD_COUNT);
        // preserve paragraphs when splitting
        for (let i = 0; i < chunks; i++) {
          const start = i * WORD_COUNT;
          const end = (i + 1) * WORD_COUNT;
          const chunk = splittedItem.slice(start, end).join(" ");
          writeToFile({ content: chunk });
        }
      } else {
        writeToFile(item);
      }
    }
  });
};

writeRecursive(splitRecursive(fileData, 4));
