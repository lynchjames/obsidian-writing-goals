import type { CachedMetadata } from "obsidian";
import type { WritingGoalsSettings } from "../core/settings/settings";
import removeMd from 'remove-markdown';

export class ObsidianFileHelper {
    settings: WritingGoalsSettings;

    constructor(settings:WritingGoalsSettings) {
        this.settings = settings;
    }

    async countWords(fileContents:string, metadata: CachedMetadata) {
        const meaningfulContent = this.getMeaningfulContent(fileContents, metadata);
        return (meaningfulContent.match(/[^\s]+/g) || []).length;
    }

    private getMeaningfulContent(content: string, metadata: CachedMetadata): string {
        let meaningfulContent = content;
        meaningfulContent = this.excludeFrontMatter(metadata, meaningfulContent);

        if (this.settings.excludeComments) {
                meaningfulContent = this.removeCommentsRegex(new RegExp("(%%.*?%%|<!--.*?-->)", "gmis"), meaningfulContent);
        }
        meaningfulContent = removeMd(meaningfulContent);
        return meaningfulContent;
    }

    private excludeFrontMatter(metadata: CachedMetadata, content: string) {
        const hasFrontmatter = metadata && !!metadata.frontmatter;
        if (hasFrontmatter) {
            const frontmatterPos = (metadata as any).frontmatterPosition || metadata.frontmatter.position;
            content =
                frontmatterPos && frontmatterPos.start && frontmatterPos.end
                    ? content.slice(0, frontmatterPos.start.offset) +
                    content.slice(frontmatterPos.end.offset)
                    : content;
        }
        return content;
    }

    removeCommentsRegex(commentRegex: RegExp, content: string): string {
        const replaced = content.replace(commentRegex, '');
        return replaced;
    }

}