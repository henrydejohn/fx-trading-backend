import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InitiateRegistrationUseCase } from '@modules/auth/use-cases/initiate-registration.use-case';
import { VerifyRegistrationOtpUseCase } from '@modules/auth/use-cases/verify-registration-otp.use-case';
import { CompleteRegistrationUseCase } from '@modules/auth/use-cases/complete-registration.use-case';
import { InitiateRegistrationDto } from '@modules/auth/dto/initiate-registration.dto';
import { VerifyOtpDto } from '@modules/auth/dto/verify-otp.dto';
import { CompleteRegistrationDto } from '@modules/auth/dto/complete-registration.dto';

@Controller('auth/register')
export class AuthController {
  constructor(
    private readonly initiateUseCase: InitiateRegistrationUseCase,
    private readonly verifyOtpUseCase: VerifyRegistrationOtpUseCase,
    private readonly completeUseCase: CompleteRegistrationUseCase,
  ) {}

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  async initiate(@Body() dto: InitiateRegistrationDto) {
    return await this.initiateUseCase.execute(dto.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.verifyOtpUseCase.execute(dto.email, dto.otp);
  }

  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async complete(@Body() dto: CompleteRegistrationDto) {
    return await this.completeUseCase.execute(dto);
  }
}
