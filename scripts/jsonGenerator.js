const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const languages = require("../src/config/language.json");

const JSON_FOLDER = "./.json";
const CONTENT_ROOT = "src/content";
const CONTENT_DEPTH = 3;
const BLOG_FOLDER = "blog";
const BOOKS_FOLDER = "books";

// get data from markdown
const getData = (folder, groupDepth) => {
  // get paths
  const getPaths = languages
    .map((lang) => {
      const dir = path.join(CONTENT_ROOT, lang.contentDir, folder);
      return fs
        .readdirSync(dir)
        .filter(
          (filename) =>
            !filename.startsWith("_") &&
            (filename.endsWith(".md") || filename.endsWith(".mdx")),
        )
        .map((filename) => {
          const filepath = path.join(dir, filename);
          const stats = fs.statSync(filepath);
          const isFolder = stats.isDirectory();

          if (isFolder) {
            return getData(filepath, groupDepth);
          } else {
            const file = fs.readFileSync(filepath, "utf-8");
            const { data, content } = matter(file);
            const pathParts = filepath.split(path.sep);
            const slug =
              data.slug ||
              pathParts
                .slice(CONTENT_DEPTH)
                .join("/")
                .replace(/\.[^/.]+$/, "");
            const group = pathParts[groupDepth];

            console.log("-----------------")
            console.log({
              lang: lang.languageCode,
              group: group,
              slug: slug,
              frontmatter: data,
              content: content,
            });
            return {
              lang: lang.languageCode,
              group: group,
              slug: slug,
              frontmatter: data,
              content: content,
            };
          }
        });
    })
    .flat();

  const publishedPages = getPaths.filter(
    (page) => !page.frontmatter?.draft && page,
  );
  return publishedPages;
};

try {
  // create folder if it doesn't exist
  if (!fs.existsSync(JSON_FOLDER)) {
    fs.mkdirSync(JSON_FOLDER);
  }

  // create json files
  fs.writeFileSync(
    `${JSON_FOLDER}/posts.json`,
    JSON.stringify(getData(BLOG_FOLDER, 3)).slice(0, -1) + "," + JSON.stringify(getData(BOOKS_FOLDER, 3)).slice(1),
  );

  // merger json files for search
  const posts = require(`../${JSON_FOLDER}/posts.json`);
  const search = [...posts];
  fs.writeFileSync(`${JSON_FOLDER}/search.json`, JSON.stringify(search));
} catch (err) {
  console.error(err);
}
