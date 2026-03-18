import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { InitiateRegistrationUseCase } from '@modules/auth/use-cases/initiate-registration.use-case';
import { VerifyRegistrationOtpUseCase } from '@modules/auth/use-cases/verify-registration-otp.use-case';
import { CompleteRegistrationUseCase } from '@modules/auth/use-cases/complete-registration.use-case';
import { InitiateRegistrationDto } from '@modules/auth/dto/initiate-registration.dto';
import { VerifyOtpDto } from '@modules/auth/dto/verify-otp.dto';
import { CompleteRegistrationDto } from '@modules/auth/dto/complete-registration.dto';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { AuthService } from '@modules/auth/auth.service';
import { Request } from 'express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { LogoutUseCase } from '@modules/auth/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '@modules/auth/use-cases/refresh-session.use-case';
import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly initiateUseCase: InitiateRegistrationUseCase,
    private readonly verifyOtpUseCase: VerifyRegistrationOtpUseCase,
    private readonly completeUseCase: CompleteRegistrationUseCase,
    private readonly authService: AuthService,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // --- Registration Flow ---
  @Post('register/initiate')
  @HttpCode(HttpStatus.OK)
  async initiate(@Body() dto: InitiateRegistrationDto) {
    return await this.initiateUseCase.execute(dto.email);
  }

  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.verifyOtpUseCase.execute(dto.email, dto.otp);
  }

  @Post('register/complete')
  @HttpCode(HttpStatus.CREATED)
  async complete(@Body() dto: CompleteRegistrationDto) {
    return await this.completeUseCase.execute(dto);
  }

  // --- Login Session Management ---
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);

    const clientInfo = {
      ip: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      agent: req.get('user-agent') || 'unknown',
    };

    return await this.authService.getAuthResponse(user, clientInfo);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return await this.refreshSessionUseCase.execute(dto.refreshToken, dto.sessionId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: any) {
    const { id, sessionId } = req.user;
    return await this.logoutUseCase.execute(id, sessionId);
  }
}
