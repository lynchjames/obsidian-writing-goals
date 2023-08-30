import type { CachedMetadata } from "obsidian";

export class ObsidianFileHelper {

    async countWords(fileContents:string, metadata: CachedMetadata) {
        const meaningfulContent = this.getMeaningfulContent(fileContents, metadata);
        return (meaningfulContent.match(/[^\s]+/g) || []).length;
    }

    private getMeaningfulContent(
        content: string,
        metadata: CachedMetadata
    ): string {
        let meaningfulContent = content;

        const hasFrontmatter = metadata && !!metadata.frontmatter;
        if (hasFrontmatter) {
            const frontmatterPos =
                (metadata as any).frontmatterPosition || metadata.frontmatter.position;
            meaningfulContent =
                frontmatterPos && frontmatterPos.start && frontmatterPos.end
                    ? meaningfulContent.slice(0, frontmatterPos.start.offset) +
                    meaningfulContent.slice(frontmatterPos.end.offset)
                    : meaningfulContent;
        }

        // if (this.settings.excludeComments) {
            const hasComments = meaningfulContent.includes("%%");
            if (hasComments) {
                meaningfulContent = this.removeComments("%%", meaningfulContent);
               
            }
            const hasHtmlComments = meaningfulContent.includes("<!--");
            console.log(hasHtmlComments);
            if(hasHtmlComments){
                meaningfulContent = this.removeCommentsRegex(new RegExp("<!--.*--!>", "gmi"), meaningfulContent);
            }
        // }

        return meaningfulContent;
    }
    removeComments(commentSymbols: string, content: string): string {
        const splitByComments = content.split(commentSymbols);
        content = splitByComments
                    .filter((_, ix) => ix % 2 == 0)
                    .join("");
        return content;
    }

    removeCommentsRegex(commentRegex: RegExp, content: string): string {
        const replaced = content.replace(commentRegex, '');
        console.log(replaced);
        return replaced;
    }

}