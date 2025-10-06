class AuditDomain {
  private static instance: AuditDomain
  private constructor() {
  }
  public static getInstance(): AuditDomain {
    if (!AuditDomain.instance) {
      AuditDomain.instance = new AuditDomain()
    }
    return AuditDomain.instance
  }
}