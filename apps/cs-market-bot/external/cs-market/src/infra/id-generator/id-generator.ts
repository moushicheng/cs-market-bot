import { nanoid, customAlphabet } from 'nanoid';

/**
 * ID生成器类
 */
export class IdGenerator {
  private length: number;
  private alphabet?: string;
  private customNanoid?: (size?: number) => string;

  constructor(length: number = 21, alphabet?: string) {
    this.length = length;
    this.alphabet = alphabet;
    
    if (alphabet) {
      this.customNanoid = customAlphabet(alphabet, length);
    }
  }

  /**
   * 生成ID
   */
  generate(): string {
    if (this.customNanoid) {
      return this.customNanoid();
    }
    return nanoid(this.length);
  }
}

export function createId(){
    return new IdGenerator().generate();
}