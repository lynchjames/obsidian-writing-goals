import { TFile } from "obsidian";
import { CanvasData } from "obsidian/canvas";

export class CanvasHelper {

  getCanvasText(file: TFile, content: string): string {
    try {
      const canvas: CanvasData = JSON.parse(content);
      const texts = canvas.nodes.map(node => node.text).filter(text => !!text);
      return texts.join(' ');
    } catch (ex) {
      console.log(`Writing Goals: Unable to parse canvas file [${file.name}]: ${ex}`);
      return '';
    }
  }
}