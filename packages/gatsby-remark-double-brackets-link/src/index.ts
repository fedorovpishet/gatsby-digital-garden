import visit from "unist-util-visit";
import { Node } from "unist";
import slugify from "slugify";

const addDoubleBracketsLinks = (
  { markdownAST }: { markdownAST: Node },
  options?: { titleToURL?: (title: string) => string; stripBrackets?: boolean }
) => {
  const titleToURL =
    options?.titleToURL || ((title: string) => `/${slugify(title)}`);

  visit(markdownAST, `linkReference`, (node, index, parent) => {
    if (node.referenceType !== "shortcut") {
      return;
    }
    const siblings = parent.children;
    if (!siblings || !Array.isArray(siblings)) {
      return;
    }
    const previous = siblings[index - 1];
    const next = siblings[index + 1];

    if (!previous || !next) {
      return;
    }

    if (
      previous.type !== "text" ||
      previous.value[previous.value.length - 1] !== "[" ||
      next.type !== "text" ||
      next.value[0] !== "]"
    ) {
      return;
    }

    previous.value = previous.value.replace(/\[$/, "");
    next.value = next.value.replace(/^\]/, "");

    node.type = "link";
    node.url = titleToURL(node.label as string);
    node.title = node.label;
    if (!options?.stripBrackets && Array.isArray(node.children)) {
      node.children[0].value = `[[${node.children[0].value}]]`;
    }
    delete node.label;
    delete node.referenceType;
    delete node.identifier;
  });
};

export default addDoubleBracketsLinks;
