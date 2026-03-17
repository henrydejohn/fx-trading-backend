export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  DEAD = 'DEAD',
}
