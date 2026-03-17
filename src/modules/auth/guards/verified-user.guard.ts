import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '@domain/enums/user-status.enum';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.status !== UserStatus.VERIFIED) {
      throw new ForbiddenException('Your account must be verified to perform this action');
    }
    return true;
  }
}
