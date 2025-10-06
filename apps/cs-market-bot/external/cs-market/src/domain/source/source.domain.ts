import CSQAQClient from "@qq/csqaq-sdk"

export class SourceDomain {
  private static instance: SourceDomain
  private csqaqClient: CSQAQClient
  private constructor() {  
  }
  
  public static getInstance(): SourceDomain {
    if (!SourceDomain.instance) {
      SourceDomain.instance = new SourceDomain()
      SourceDomain.instance.csqaqClient = new CSQAQClient({
        token: process.env.CSQAQ_TOKEN
      })
    }
    return SourceDomain.instance
  }

  public async searchSkinByKeyword(keyword: string) {
    const skins = await this.csqaqClient.searchGoodId(keyword)
    return skins
  }
  public async suggestSkinByKeyword(keyword: string) {
    const skins = await this.csqaqClient.suggestGoodId(keyword)
    return skins.data
  }

  public async getSkinDetail(skinId: number) {
    const skinDetail = await this.csqaqClient.getGoodDetail(skinId)
    return skinDetail
  }
}